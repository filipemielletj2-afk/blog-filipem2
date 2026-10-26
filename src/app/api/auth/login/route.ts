import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, signJwt, COOKIE_NAME } from '@/lib/auth';

// In-memory rate limiting for brute force protection
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();

    // Check rate limit: max 5 attempts per 5 minutes
    const record = loginAttempts.get(ip);
    if (record) {
      if (now - record.lastAttempt < 300000 && record.count >= 5) {
        return NextResponse.json(
          { error: 'Muitas tentativas de login. Aguarde 5 minutos antes de tentar novamente.' },
          { status: 429 }
        );
      }
      if (now - record.lastAttempt >= 300000) {
        loginAttempts.delete(ip);
      }
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;

    if (!user || !verifyPassword(password, user.password_hash)) {
      // Record failed attempt
      const current = loginAttempts.get(ip) || { count: 0, lastAttempt: now };
      loginAttempts.set(ip, { count: current.count + 1, lastAttempt: now });

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
