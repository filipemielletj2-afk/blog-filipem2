import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    const db = getDb();
    const backupData = {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      site_title: 'BLOG FILIPEM2',
      categories: db.prepare('SELECT * FROM categories').all(),
      tags: db.prepare('SELECT * FROM tags').all(),
      articles: db.prepare('SELECT * FROM articles').all(),
      article_tags: db.prepare('SELECT * FROM article_tags').all(),
      pages: db.prepare('SELECT * FROM pages').all(),
      site_settings: db.prepare('SELECT * FROM site_settings').all(),
      visual_builder_sections: db.prepare('SELECT * FROM visual_builder_sections').all(),
      media: db.prepare('SELECT * FROM media').all()
    };

    const jsonString = JSON.stringify(backupData, null, 2);

    return new Response(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="blog-filipem2-backup-${Date.now()}.json"`
      }
    });
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

    const data = await request.json();
    if (!data || !data.site_settings || !data.categories) {
      return NextResponse.json({ error: 'Arquivo de backup inválido.' }, { status: 400 });
    }

    const db = getDb();

    // Import settings
    if (Array.isArray(data.site_settings)) {
      const upsert = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
      for (const s of data.site_settings) {
        upsert.run(s.key, s.value);
      }
    }

    // Import visual builder sections
    if (Array.isArray(data.visual_builder_sections)) {
      db.prepare('DELETE FROM visual_builder_sections').run();
      const ins = db.prepare(`
        INSERT INTO visual_builder_sections (page_identifier, type, title, subtitle, config_json, sort_order, is_active, version_state)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const s of data.visual_builder_sections) {
        ins.run(s.page_identifier, s.type, s.title, s.subtitle, s.config_json, s.sort_order, s.is_active, s.version_state || 'published');
      }
    }

    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(
      user.id,
      'BACKUP_RESTORE',
      `Restauração de configurações e seções importadas com sucesso.`
    );

    return NextResponse.json({ success: true, message: 'Dados e configurações importados com sucesso!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
