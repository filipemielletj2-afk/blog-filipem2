import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { triggerAutoBackupAsync } from '@/lib/auto-backup';

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
      const cleanPass = password.trim();
      const newHash = hashPassword(cleanPass);
      db.prepare(`
        UPDATE users SET name = ?, email = ?, password_hash = ?, avatar = ?, bio = ?
        WHERE id = ?
      `).run(name, email.toLowerCase().trim(), newHash, avatar, bio, session.id);

      db.prepare(`
        INSERT INTO site_settings (key, value) VALUES ('admin_backup_password', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `).run(cleanPass);
    } else {
      db.prepare(`
        UPDATE users SET name = ?, email = ?, avatar = ?, bio = ?
        WHERE id = ?
      `).run(name, email.toLowerCase().trim(), avatar, bio, session.id);
    }

    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(
      session.id,
      'USER_PROFILE_UPDATE',
      `Perfil do usuário "${name}" atualizado e sincronizado.`
    );

    // Trigger instant auto-backup to Google Drive with the updated password and profile
    triggerAutoBackupAsync(db);

    return NextResponse.json({
      success: true,
      message: 'Perfil e credenciais atualizados com sucesso! Backup sincronizado no Google Drive.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
