import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import sanitizeHtml from 'sanitize-html';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message, honeypot } = await request.json();

    if (honeypot) {
      return NextResponse.json({ success: true, message: 'Mensagem enviada com sucesso!' });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Por favor, preencha todos os campos obrigatórios.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
    }

    const cleanMsg = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} }).trim();

    const db = getDb();
    db.prepare(`
      INSERT INTO audit_logs (action, details)
      VALUES (?, ?)
    `).run(
      'CONTACT_MESSAGE',
      `Mensagem recebida de "${name}" (${email}) - Assunto: "${subject || 'Geral'}": ${cleanMsg.slice(0, 200)}...`
    );

    return NextResponse.json({
      success: true,
      message: 'Obrigado pelo contato! Sua mensagem foi recebida com sucesso pela equipe do BLOG FILIPEM2.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
