import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { triggerAutoBackupAsync } from '@/lib/auto-backup';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'home';
    const state = searchParams.get('state') || 'published'; // 'published' or 'draft'

    const db = getDb();
    const sections = db.prepare(`
      SELECT * FROM visual_builder_sections
      WHERE page_identifier = ? AND version_state = ?
      ORDER BY sort_order ASC
    `).all(page, state);

    // If draft is requested but empty, clone published as draft
    if (state === 'draft' && sections.length === 0) {
      const published = db.prepare(`
        SELECT * FROM visual_builder_sections
        WHERE page_identifier = ? AND version_state = 'published'
        ORDER BY sort_order ASC
      `).all(page);
      return NextResponse.json(published);
    }

    return NextResponse.json(sections);
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

    const { page = 'home', action, sections, publish = false } = await request.json();
    const db = getDb();

    if (action === 'save_and_publish' || publish) {
      // Save directly to published and clear drafts
      db.prepare(`DELETE FROM visual_builder_sections WHERE page_identifier = ?`).run(page);

      const insertStmt = db.prepare(`
        INSERT INTO visual_builder_sections (page_identifier, type, title, subtitle, config_json, sort_order, is_active, version_state)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'published')
      `);

      for (let i = 0; i < sections.length; i++) {
        const s = sections[i];
        insertStmt.run(
          page,
          s.type,
          s.title || '',
          s.subtitle || '',
          typeof s.config_json === 'string' ? s.config_json : JSON.stringify(s.config_json || {}),
          i + 1,
          s.is_active !== undefined ? (s.is_active ? 1 : 0) : 1
        );
      }

      db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(
        user.id,
        'BUILDER_PUBLISH',
        `Layout visual da página "${page}" publicado com ${sections.length} seções.`
      );

      triggerAutoBackupAsync(db);

      return NextResponse.json({ success: true, message: 'Layout publicado no site com sucesso!' });
    }

    if (action === 'save_draft') {
      // Save draft state
      db.prepare(`DELETE FROM visual_builder_sections WHERE page_identifier = ? AND version_state = 'draft'`).run(page);

      const insertStmt = db.prepare(`
        INSERT INTO visual_builder_sections (page_identifier, type, title, subtitle, config_json, sort_order, is_active, version_state)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')
      `);

      for (let i = 0; i < sections.length; i++) {
        const s = sections[i];
        insertStmt.run(
          page,
          s.type,
          s.title || '',
          s.subtitle || '',
          typeof s.config_json === 'string' ? s.config_json : JSON.stringify(s.config_json || {}),
          i + 1,
          s.is_active !== undefined ? (s.is_active ? 1 : 0) : 1
        );
      }

      return NextResponse.json({ success: true, message: 'Rascunho salvo com sucesso.' });
    }

    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
