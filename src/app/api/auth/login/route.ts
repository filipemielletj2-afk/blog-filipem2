import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, signJwt, COOKIE_NAME } from '@/lib/auth';

// In-memory rate limiting and lockout for brute force defense
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil: number }>();

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = request.headers.get('cf-connecting-ip') ||
               (forwarded ? forwarded.split(',')[0].trim() : null) ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1';
    const now = Date.now();

    // Check rate limit: 5 attempts -> 15 min lock
    const record = loginAttempts.get(ip);
    if (record) {
      if (record.lockedUntil && now < record.lockedUntil) {
        const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
        return NextResponse.json(
          { error: `Muitas tentativas incorretas. Por segurança, o acesso deste IP foi temporariamente bloqueado por ${remainingMinutes} minuto(s).` },
          { status: 429 }
        );
      }
      if (now - record.lastAttempt >= 900000) {
        loginAttempts.delete(ip);
      }
    }

    const db = getDb();
    // Persistent brute-force check across restarts
    const recentFails = db.prepare(`
      SELECT count(*) as cnt FROM audit_logs
      WHERE action = 'LOGIN_FAILED' AND ip_address = ? AND created_at > datetime('now', '-15 minutes')
    `).get(ip) as { cnt: number };

    if (recentFails && recentFails.cnt >= 5) {
      return NextResponse.json(
        { error: 'Muitas tentativas incorretas registradas. Por segurança, o acesso deste IP foi bloqueado por 15 minutos.' },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim().slice(0, 100);
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;

    if (!user || !verifyPassword(password, user.password_hash)) {
      // Record failed attempt
      const current = loginAttempts.get(ip) || { count: 0, lastAttempt: now, lockedUntil: 0 };
      const newCount = current.count + 1;
      const lockedUntil = newCount >= 5 ? now + 900000 : 0; // Lock for 15 minutes if 5 failures
      loginAttempts.set(ip, { count: newCount, lastAttempt: now, lockedUntil });

      // Record security audit log
      try {
        db.prepare('INSERT INTO audit_logs (action, details, ip_address) VALUES (?, ?, ?)').run(
          'LOGIN_FAILED',
          `Tentativa incorreta de login com e-mail: "${cleanEmail}" (Tentativa ${newCount}/5)`,
          ip
        );
      } catch {}

      if (newCount >= 5) {
        return NextResponse.json(
          { error: 'Limite de tentativas excedido. Por motivos de segurança, o acesso deste IP foi bloqueado por 15 minutos.' },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' }, { status: 401 });
    }

    // Reset rate limit on success
    loginAttempts.delete(ip);

    // Record audit log
    db.prepare('INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)').run(
      user.id,
      'LOGIN_SUCCESS',
      `Login bem-sucedido para o usuário ${user.email}`,
      ip
    );

    const token = signJwt({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });

    // Set secure cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno ao processar login: ' + error.message }, { status: 500 });
  }
}
