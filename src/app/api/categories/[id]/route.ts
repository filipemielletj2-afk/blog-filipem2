import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { triggerAutoBackupAsync } from '@/lib/auto-backup';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    const db = getDb();
    const current = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any;
    if (!current) {
      return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 });
    }

    const { name, slug: customSlug, description, color, icon, parent_id, sort_order } = await request.json();
    const newSlug = customSlug ? slugify(customSlug) : current.slug;

    db.prepare(`
      UPDATE categories SET
        name = ?,
        slug = ?,
        description = ?,
        color = ?,
        icon = ?,
        parent_id = ?,
        sort_order = ?
      WHERE id = ?
    `).run(
      name || current.name,
      newSlug,
      description !== undefined ? description : current.description,
      color || current.color,
      icon || current.icon,
      parent_id !== undefined ? parent_id : current.parent_id,
      sort_order !== undefined ? sort_order : current.sort_order,
      id
    );

    triggerAutoBackupAsync(db);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    const db = getDb();

    // Check if category has articles
    const hasArticles = db.prepare('SELECT COUNT(*) as cnt FROM articles WHERE category_id = ?').get(id) as { cnt: number };
    if (hasArticles.cnt > 0) {
      return NextResponse.json(
        { error: `Esta categoria possui ${hasArticles.cnt} artigo(s) vinculado(s). Transfira ou exclua os artigos antes de remover a categoria.` },
        { status: 400 }
      );
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    triggerAutoBackupAsync(db);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
