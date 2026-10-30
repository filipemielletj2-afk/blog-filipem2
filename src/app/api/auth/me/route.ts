import { NextResponse } from 'next/server';
import { getCurrentUser, verifyPassword } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const db = getDb();
  const user = db.prepare('SELECT id, name, email, role, avatar, bio, password_hash FROM users WHERE id = ?').get(session.id) as any;

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const isDefaultPassword = user.password_hash ? verifyPassword('admin123456', user.password_hash) : false;

  const { password_hash, ...safeUser } = user;

  return NextResponse.json({
    authenticated: true,
    user: {
      ...safeUser,
      isDefaultPassword
    }
  });
}
