import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const db = getDb();

    let query = 'SELECT * FROM media WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (original_name LIKE ? OR alt_text LIKE ? OR credit LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY created_at DESC';
    const media = db.prepare(query).all(...params);

    return NextResponse.json(media);
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const altText = (formData.get('alt_text') as string) || '';
    const credit = (formData.get('credit') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato de arquivo não suportado. Envie apenas imagens JPG, PNG, WebP, GIF, SVG ou AVIF.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'O arquivo excede o limite de 10MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate safe random filename
    const ext = path.extname(file.name) || '.jpg';
    const randomHex = crypto.randomBytes(8).toString('hex');
    const safeFilename = `${Date.now()}-${randomHex}${ext.toLowerCase()}`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, safeFilename);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${safeFilename}`;
    const base64Data = buffer.toString('base64');
    const db = getDb();

    const result = db.prepare(`
      INSERT INTO media (filename, original_name, mime_type, size, url, alt_text, credit, data_base64)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      safeFilename,
      file.name,
      file.type,
      file.size,
      fileUrl,
      altText,
      credit,
      base64Data
    );

    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(
      user.id,
      'MEDIA_UPLOAD',
      `Arquivo enviado: ${file.name} (${safeFilename})`
    );

    return NextResponse.json({
      success: true,
      media: {
        id: Number(result.lastInsertRowid),
        url: fileUrl,
        filename: safeFilename,
        original_name: file.name,
        size: file.size,
        mime_type: file.type,
        alt_text: altText,
        credit
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
