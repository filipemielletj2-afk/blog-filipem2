import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { slugify, calculateReadingTime, sanitizeContent } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    const db = getDb();

    let query = `
      SELECT 
        a.id, a.title, a.subtitle, a.slug, a.excerpt, a.cover_image, a.cover_caption, a.cover_source,
        a.status, a.published_at, a.updated_at, a.reading_time, a.views, a.featured,
        c.name as category_name, c.slug as category_slug, c.color as category_color,
        u.name as author_name, u.avatar as author_avatar
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      JOIN users u ON a.author_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category) {
      query += ` AND (c.slug = ? OR c.id = ?)`;
      params.push(category, category);
    }

    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    if (featured !== null && featured !== undefined && featured !== '') {
      query += ` AND a.featured = ?`;
      params.push(parseInt(featured, 10));
    }

    if (search) {
      query += ` AND (a.title LIKE ? OR a.excerpt LIKE ? OR a.content LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (tag) {
      query += ` AND a.id IN (
        SELECT at.article_id FROM article_tags at
        JOIN tags t ON at.tag_id = t.id
        WHERE t.slug = ? OR t.name = ?
      )`;
      params.push(tag, tag);
    }

    // Count total query
    const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
    const countResult = db.prepare(countQuery).get(...params) as { total: number };
    const total = countResult ? countResult.total : 0;

    query += ` ORDER BY a.featured DESC, a.published_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const articles = db.prepare(query).all(...params);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
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
      status = 'published',
      published_at,
      featured = 0,
      meta_title,
      meta_description,
      canonical_url,
      og_image,
      sources_json,
      allow_comments = 1,
      tags = []
    } = body;

    if (!title || !content || !category_id) {
      return NextResponse.json({ error: 'Título, conteúdo e categoria são obrigatórios.' }, { status: 400 });
    }

    const db = getDb();

    // Generate unique slug
    let baseSlug = slugify(customSlug || title);
    if (!baseSlug) baseSlug = 'artigo-' + Date.now();
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = db.prepare('SELECT id FROM articles WHERE slug = ?').get(uniqueSlug);
      if (!existing) break;
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const readingTime = calculateReadingTime(content);
    const cleanContent = sanitizeContent(content);
    const pubDate = published_at || (status === 'published' ? new Date().toISOString() : null);

    const insertStmt = db.prepare(`
      INSERT INTO articles (
        title, subtitle, slug, content, excerpt, cover_image, cover_caption, cover_source,
        author_id, category_id, status, published_at, updated_at, reading_time, views, featured,
        meta_title, meta_description, canonical_url, og_image, sources_json, allow_comments
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 0, ?,
        ?, ?, ?, ?, ?, ?
      )
    `);

    const result = insertStmt.run(
      title,
      subtitle || null,
      uniqueSlug,
      cleanContent,
      excerpt || title,
      cover_image || null,
      cover_caption || null,
      cover_source || null,
      user.id,
      category_id,
      status,
      pubDate,
      readingTime,
      featured ? 1 : 0,
      meta_title || `${title} | BLOG FILIPEM2`,
      meta_description || excerpt || title,
      canonical_url || null,
      og_image || cover_image || null,
      typeof sources_json === 'string' ? sources_json : JSON.stringify(sources_json || []),
      allow_comments ? 1 : 0
    );

    const articleId = Number(result.lastInsertRowid);

    // Handle tags
    if (Array.isArray(tags) && tags.length > 0) {
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
          insertArtTagStmt.run(articleId, tagRow.id);
        }
      }
    }

    // Audit log
    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(
      user.id,
      'ARTICLE_CREATE',
      `Artigo criado: "${title}" (ID: ${articleId})`
    );

    return NextResponse.json({
      success: true,
      id: articleId,
      slug: uniqueSlug
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
