import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import path from 'node:path';
import fs from 'node:fs';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    const db = getDb();
    const media = db.prepare('SELECT * FROM media WHERE id = ?').get(id) as any;

    if (!media) {
      return NextResponse.json({ error: 'Mídia não encontrada.' }, { status: 404 });
    }

    // Try deleting physical file if exists
    try {
      const filePath = path.join(process.cwd(), 'public', 'uploads', media.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('Erro ao excluir arquivo físico:', err);
    }

    db.prepare('DELETE FROM media WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
