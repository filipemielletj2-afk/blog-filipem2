import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const db = getDb();
    const pages = db.prepare('SELECT * FROM pages ORDER BY is_system DESC, title ASC').all();
    return NextResponse.json(pages);
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

    const { title, slug: customSlug, content, meta_title, meta_description } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Título e conteúdo são obrigatórios.' }, { status: 400 });
    }

    const db = getDb();
    const slug = slugify(customSlug || title);

    const exists = db.prepare('SELECT id FROM pages WHERE slug = ?').get(slug);
    if (exists) {
      return NextResponse.json({ error: 'Já existe uma página com esta URL.' }, { status: 400 });
    }

    const result = db.prepare(`
      INSERT INTO pages (title, slug, content, meta_title, meta_description, is_system)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(title, slug, content, meta_title || `${title} | BLOG FILIPEM2`, meta_description || '');

    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
