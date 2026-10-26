import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    const db = getDb();
    const users = db.prepare('SELECT id, name, email, role, avatar, bio, created_at FROM users').all();
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    const { name, email, password, avatar, bio } = await request.json();
    const db = getDb();

    if (password && password.trim().length >= 6) {
      const newHash = hashPassword(password);
      db.prepare(`
        UPDATE users SET name = ?, email = ?, password_hash = ?, avatar = ?, bio = ?
        WHERE id = ?
      `).run(name, email.toLowerCase().trim(), newHash, avatar, bio, session.id);
    } else {
      db.prepare(`
        UPDATE users SET name = ?, email = ?, avatar = ?, bio = ?
        WHERE id = ?
      `).run(name, email.toLowerCase().trim(), avatar, bio, session.id);
    }

    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(
      session.id,
      'USER_PROFILE_UPDATE',
      `Perfil do usuário "${name}" atualizado.`
    );

    return NextResponse.json({ success: true, message: 'Perfil e credenciais atualizados com sucesso!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
