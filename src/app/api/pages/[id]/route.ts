import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = params.id;
    const isNumeric = /^\d+$/.test(id);

    const page = isNumeric
      ? db.prepare('SELECT * FROM pages WHERE id = ?').get(parseInt(id, 10))
      : db.prepare('SELECT * FROM pages WHERE slug = ?').get(id);

    if (!page) {
      return NextResponse.json({ error: 'Página não encontrada.' }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    const db = getDb();
    const current = db.prepare('SELECT * FROM pages WHERE id = ?').get(id) as any;

    if (!current) {
      return NextResponse.json({ error: 'Página não encontrada.' }, { status: 404 });
    }

    const { title, slug: customSlug, content, meta_title, meta_description } = await request.json();
    const newSlug = customSlug ? slugify(customSlug) : current.slug;

    db.prepare(`
      UPDATE pages SET
        title = ?,
        slug = ?,
        content = ?,
        meta_title = ?,
        meta_description = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title || current.title,
      newSlug,
      content !== undefined ? content : current.content,
      meta_title !== undefined ? meta_title : current.meta_title,
      meta_description !== undefined ? meta_description : current.meta_description,
      id
    );

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
    const page = db.prepare('SELECT is_system FROM pages WHERE id = ?').get(id) as any;

    if (!page) {
      return NextResponse.json({ error: 'Página não encontrada.' }, { status: 404 });
    }

    if (page.is_system === 1) {
      return NextResponse.json({ error: 'Páginas essenciais do sistema (legais) não podem ser excluídas, apenas editadas.' }, { status: 400 });
    }

    db.prepare('DELETE FROM pages WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
