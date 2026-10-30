import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import path from 'node:path';
import fs from 'node:fs';

export async function GET(request: Request, { params }: { params: { filename: string } }) {
  try {
    const filename = path.basename(params.filename);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const diskPath = path.join(uploadsDir, filename);

    // 1. If file already exists on disk, serve it directly
    if (fs.existsSync(diskPath)) {
      const fileBuffer = fs.readFileSync(diskPath);
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.avif': 'image/avif'
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      });
    }

    // 2. If not on disk, check if it's stored in SQLite database
    const db = getDb();
    const row = db.prepare('SELECT mime_type, data_base64 FROM media WHERE filename = ?').get(filename) as any;

    if (row && row.data_base64) {
      const buffer = Buffer.from(row.data_base64, 'base64');

      // Re-create the file on disk for future fast reads
      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(diskPath, buffer);
      } catch (err) {
        console.error('Erro ao recriar arquivo de mídia no disco:', err);
      }

      return new Response(buffer, {
        headers: {
          'Content-Type': row.mime_type || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      });
    }

    // 3. Fallback for known assets (Doctor-X, GTA 6) if an older random upload hash was stored
    const lowerFilename = filename.toLowerCase();
    if (
      lowerFilename.includes('doctor-x') ||
      lowerFilename.includes('doctorx') ||
      lowerFilename.startsWith('1793391958980') ||
      lowerFilename.startsWith('1793392495814')
    ) {
      const fallbackPath = path.join(uploadsDir, 'doctor-x-cover.png');
      if (fs.existsSync(fallbackPath)) {
        return new Response(fs.readFileSync(fallbackPath), {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      }
    }

    if (lowerFilename.includes('gta-6') || lowerFilename.includes('gta6')) {
      const fallbackPath = path.join(uploadsDir, 'gta-6-cover.png');
      if (fs.existsSync(fallbackPath)) {
        return new Response(fs.readFileSync(fallbackPath), {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      }
    }

    return new Response('Arquivo não encontrado.', { status: 404 });
  } catch (error: any) {
    return new Response('Erro ao carregar mídia: ' + error.message, { status: 500 });
  }
}
