import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import sanitizeHtml from 'sanitize-html';

// In-memory rate limiting to protect contact form against spam
const contactRateLimits = new Map<string, { count: number; lastTime: number }>();

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = request.headers.get('cf-connecting-ip') ||
               (forwarded ? forwarded.split(',')[0].trim() : null) ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1';
    const now = Date.now();

    // Check rate limit: max 3 messages per 5 minutes per IP
    const record = contactRateLimits.get(ip);
    if (record) {
      if (now - record.lastTime < 300000 && record.count >= 3) {
        return NextResponse.json(
          { error: 'Você enviou várias mensagens recentemente. Aguarde 5 minutos antes de enviar outra.' },
          { status: 429 }
        );
      }
      if (now - record.lastTime >= 300000) {
        contactRateLimits.delete(ip);
      }
    }

    const { name, email, subject, message, honeypot } = await request.json();

    if (honeypot) {
      return NextResponse.json({ success: true, message: 'Mensagem enviada com sucesso!' });
    }

    // Update rate limit count
    const cur = contactRateLimits.get(ip) || { count: 0, lastTime: now };
    contactRateLimits.set(ip, { count: cur.count + 1, lastTime: now });

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
