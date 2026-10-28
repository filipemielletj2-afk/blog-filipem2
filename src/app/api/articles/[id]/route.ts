import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { slugify, calculateReadingTime, sanitizeContent } from '@/lib/utils';
import { triggerAutoBackupAsync } from '@/lib/auto-backup';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = params.id;

    // Check if looking up by numeric ID or by slug
    const isNumeric = /^\d+$/.test(id);
    let article: any;

    if (isNumeric) {
      article = db.prepare(`
        SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
               u.name as author_name, u.avatar as author_avatar, u.bio as author_bio
        FROM articles a
        JOIN categories c ON a.category_id = c.id
        JOIN users u ON a.author_id = u.id
        WHERE a.id = ?
      `).get(parseInt(id, 10));
    } else {
      article = db.prepare(`
        SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
               u.name as author_name, u.avatar as author_avatar, u.bio as author_bio
        FROM articles a
        JOIN categories c ON a.category_id = c.id
        JOIN users u ON a.author_id = u.id
        WHERE a.slug = ?
      `).get(id);
    }

    if (!article) {
      return NextResponse.json({ error: 'Artigo não encontrado.' }, { status: 404 });
    }

    // Increment views if public view
    const url = new URL(request.url);
    if (!url.searchParams.get('no_view_increment')) {
      db.prepare('UPDATE articles SET views = views + 1 WHERE id = ?').run(article.id);
      article.views += 1;
    }

    // Get tags
    const tags = db.prepare(`
      SELECT t.id, t.name, t.slug 
      FROM tags t
      JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?
    `).all(article.id);

    article.tags = tags;

    // Get related articles (same category or shared tags)
    const related = db.prepare(`
      SELECT id, title, slug, cover_image, published_at, reading_time
      FROM articles
      WHERE category_id = ? AND id != ? AND status = 'published'
      ORDER BY published_at DESC LIMIT 4
    `).all(article.category_id, article.id);

    article.related = related;

    return NextResponse.json(article);
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
    if (!id) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    const body = await request.json();
    const {
      title,
      subtitle,
      slug: customSlug,
      content,
      excerpt,
      cover_image,
      cover_caption,
      cover_source,
      category_id,
      status,
      published_at,
      featured,
      meta_title,
      meta_description,
      canonical_url,
      og_image,
      sources_json,
      allow_comments,
      tags
    } = body;

    const db = getDb();
    const current = db.prepare('SELECT * FROM articles WHERE id = ?').get(id) as any;
    if (!current) {
      return NextResponse.json({ error: 'Artigo não encontrado.' }, { status: 404 });
    }

    // Check slug uniqueness if changed
    let uniqueSlug = current.slug;
    if (customSlug && customSlug !== current.slug) {
      const baseSlug = slugify(customSlug);
      const exists = db.prepare('SELECT id FROM articles WHERE slug = ? AND id != ?').get(baseSlug, id);
      uniqueSlug = exists ? `${baseSlug}-${Date.now()}` : baseSlug;

      // Register 301 redirect from old slug to new slug for SEO
      db.prepare(`
        INSERT OR REPLACE INTO redirects (source_path, target_path, status_code)
        VALUES (?, ?, 301)
      `).run(`/artigo/${current.slug}`, `/artigo/${uniqueSlug}`);
    }

    const cleanContent = content !== undefined ? sanitizeContent(content) : current.content;
    const readingTime = calculateReadingTime(cleanContent);

    db.prepare(`
      UPDATE articles SET
        title = ?,
        subtitle = ?,
        slug = ?,
        content = ?,
        excerpt = ?,
        cover_image = ?,
        cover_caption = ?,
        cover_source = ?,
        category_id = ?,
        status = ?,
        published_at = ?,
        updated_at = CURRENT_TIMESTAMP,
        reading_time = ?,
        featured = ?,
        meta_title = ?,
        meta_description = ?,
        canonical_url = ?,
        og_image = ?,
        sources_json = ?,
        allow_comments = ?
      WHERE id = ?
    `).run(
      title !== undefined ? title : current.title,
      subtitle !== undefined ? subtitle : current.subtitle,
      uniqueSlug,
      cleanContent,
      excerpt !== undefined ? excerpt : current.excerpt,
      cover_image !== undefined ? cover_image : current.cover_image,
      cover_caption !== undefined ? cover_caption : current.cover_caption,
      cover_source !== undefined ? cover_source : current.cover_source,
      category_id !== undefined ? category_id : current.category_id,
      status !== undefined ? status : current.status,
      published_at !== undefined ? published_at : current.published_at,
      readingTime,
      featured !== undefined ? (featured ? 1 : 0) : current.featured,
      meta_title !== undefined ? meta_title : current.meta_title,
      meta_description !== undefined ? meta_description : current.meta_description,
      canonical_url !== undefined ? canonical_url : current.canonical_url,
      og_image !== undefined ? og_image : current.og_image,
      sources_json !== undefined ? (typeof sources_json === 'string' ? sources_json : JSON.stringify(sources_json)) : current.sources_json,
      allow_comments !== undefined ? (allow_comments ? 1 : 0) : current.allow_comments,
      id
    );

    // Update tags if provided
    if (Array.isArray(tags)) {
      db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(id);
      const insertTagStmt = db.prepare('INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)');
      const getTagStmt = db.prepare('SELECT id FROM tags WHERE slug = ?');
      const insertArtTagStmt = db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)');

      for (const t of tags) {
        const tagName = typeof t === 'string' ? t.trim() : t.name?.trim();
        if (!tagName) continue;
        const tagSlug = slugify(tagName);
        insertTagStmt.run(tagName, tagSlug);
        const tagRow = getTagStmt.get(tagSlug) as { id: number };
        if (tagRow) {
          insertArtTagStmt.run(id, tagRow.id);
        }
      }
    }

    // Audit log
    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(
      user.id,
      'ARTICLE_UPDATE',
      `Artigo atualizado: "${title || current.title}" (ID: ${id})`
    );

    triggerAutoBackupAsync(db);

    return NextResponse.json({ success: true, slug: uniqueSlug });
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

    const current = db.prepare('SELECT title FROM articles WHERE id = ?').get(id) as any;
    if (!current) {
      return NextResponse.json({ error: 'Artigo não encontrado.' }, { status: 404 });
    }

    db.prepare('DELETE FROM articles WHERE id = ?').run(id);

    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(
      user.id,
      'ARTICLE_DELETE',
      `Artigo excluído: "${current.title}" (ID: ${id})`
    );

    triggerAutoBackupAsync(db);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
