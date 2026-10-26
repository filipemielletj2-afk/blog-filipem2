import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM site_settings').all() as Array<{ key: string; value: string }>;
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    const updates = await request.json();
    const db = getDb();

    const upsertStmt = db.prepare(`
      INSERT INTO site_settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    for (const [key, value] of Object.entries(updates)) {
      const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
      upsertStmt.run(key, valStr);
    }

    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(
      user.id,
      'SETTINGS_UPDATE',
      `Configurações do site atualizadas (${Object.keys(updates).join(', ')})`
    );

    return NextResponse.json({ success: true, message: 'Configurações atualizadas com sucesso!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
