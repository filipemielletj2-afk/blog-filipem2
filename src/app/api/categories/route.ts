import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { triggerAutoBackupAsync } from '@/lib/auto-backup';

export async function GET() {
  try {
    const db = getDb();
    const categories = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM articles a WHERE a.category_id = c.id AND a.status = 'published') as article_count
      FROM categories c
      ORDER BY c.sort_order ASC, c.name ASC
    `).all();

    return NextResponse.json(categories);
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

    const { name, slug: customSlug, description, color, icon, parent_id, sort_order } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Nome da categoria é obrigatório.' }, { status: 400 });
    }

    const db = getDb();
    const finalSlug = slugify(customSlug || name);

    const exists = db.prepare('SELECT id FROM categories WHERE slug = ?').get(finalSlug);
    if (exists) {
      return NextResponse.json({ error: 'Já existe uma categoria com esta URL/slug.' }, { status: 400 });
    }

    const result = db.prepare(`
      INSERT INTO categories (name, slug, description, color, icon, parent_id, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      finalSlug,
      description || '',
      color || '#DC2626',
      icon || 'Gamepad2',
      parent_id || null,
      sort_order || 0
    );

    triggerAutoBackupAsync(db);

    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
