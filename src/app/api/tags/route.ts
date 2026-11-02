import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const db = getDb();
    const tags = db.prepare(`
      SELECT t.*, COUNT(at.article_id) as count
      FROM tags t
      LEFT JOIN article_tags at ON t.id = at.tag_id
      GROUP BY t.id
      ORDER BY count DESC, t.name ASC
    `).all();

    return NextResponse.json(tags);
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

    const { name } = await request.json();
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Nome da tag é obrigatório.' }, { status: 400 });
    }

    const db = getDb();
    const insertStmt = db.prepare('INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)');
    const parts = name.split(',');
    const createdTags: any[] = [];

    for (const part of parts) {
      const clean = part.trim().replace(/^#+/, '');
      if (!clean) continue;
      const slug = slugify(clean);
      insertStmt.run(clean, slug);
      const tag = db.prepare('SELECT * FROM tags WHERE slug = ?').get(slug);
      if (tag) createdTags.push(tag);
    }

    return NextResponse.json({ success: true, count: createdTags.length, tags: createdTags });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
