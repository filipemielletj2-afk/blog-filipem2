import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import sanitizeHtml from 'sanitize-html';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('article_id');
    const status = searchParams.get('status');
    const db = getDb();

    let query = `
      SELECT c.*, a.title as article_title, a.slug as article_slug
      FROM comments c
      JOIN articles a ON c.article_id = a.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (articleId) {
      query += ` AND c.article_id = ?`;
      params.push(articleId);
    }

    if (status) {
      query += ` AND c.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY c.created_at DESC`;
    const comments = db.prepare(query).all(...params);

    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { article_id, author_name, author_email, content, honeypot } = body;

    // Honeypot anti-spam check
    if (honeypot) {
      return NextResponse.json({ success: true, message: 'Comentário recebido.' }); // Silent drop for bots
    }

    if (!article_id || !author_name || !author_email || !content) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(author_email)) {
      return NextResponse.json({ error: 'Por favor, informe um e-mail válido.' }, { status: 400 });
    }

    // Sanitize comment content (only plain text with basic formatting)
    const cleanContent = sanitizeHtml(content, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p'],
      allowedAttributes: {}
    }).trim();

    if (cleanContent.length < 3) {
      return NextResponse.json({ error: 'O comentário deve conter pelo menos 3 caracteres.' }, { status: 400 });
    }

    const db = getDb();

    // Verify article exists and allows comments
    const article = db.prepare('SELECT allow_comments FROM articles WHERE id = ?').get(article_id) as any;
    if (!article || article.allow_comments === 0) {
      return NextResponse.json({ error: 'Os comentários estão desativados para esta publicação.' }, { status: 403 });
    }

    const result = db.prepare(`
      INSERT INTO comments (article_id, author_name, author_email, content, status)
      VALUES (?, ?, ?, ?, 'approved')
    `).run(
      article_id,
      author_name.trim(),
      author_email.trim().toLowerCase(),
      cleanContent
    );

    return NextResponse.json({
      success: true,
      message: 'Comentário publicado com sucesso!',
      id: Number(result.lastInsertRowid)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
