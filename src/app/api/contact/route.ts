import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendSiteNotification } from '@/lib/email-notifications';
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

    const cleanName = sanitizeHtml(name, { allowedTags: [] }).trim().slice(0, 80);
    const cleanSubject = sanitizeHtml(subject || 'Geral', { allowedTags: [] }).trim().slice(0, 120);
    const cleanMsg = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} }).trim();

    const db = getDb();

    // 1. Ensure contact_messages table exists and store message
    db.exec(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        ip TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.prepare(`
      INSERT INTO contact_messages (name, email, subject, message, ip)
      VALUES (?, ?, ?, ?, ?)
    `).run(cleanName, email, cleanSubject, cleanMsg, ip);

    // 2. Log in audit logs
    db.prepare(`
      INSERT INTO audit_logs (action, details)
      VALUES (?, ?)
    `).run(
      'CONTACT_MESSAGE',
      `Mensagem recebida de "${cleanName}" (${email}) - Assunto: "${cleanSubject}": ${cleanMsg.slice(0, 200)}...`
    );

    // 3. Dispatch automated email notification to filipemielletj2@gmail.com
    sendSiteNotification({
      type: 'contact_message',
      subject: `Nova Mensagem: ${cleanSubject}`,
      badge: 'Mensagem de Contato',
      badgeColor: '#DC2626',
      headline: `Nova mensagem recebida de ${cleanName}`,
      summary: `Um leitor enviou uma mensagem através do formulário de contato do BLOG FILIPEM2:`,
      fields: [
        { label: 'Nome do Remetente', value: cleanName },
        { label: 'E-mail para Resposta', value: email },
        { label: 'Assunto', value: cleanSubject },
        { label: 'Mensagem Completa', value: cleanMsg },
        { label: 'Data e Hora', value: new Date().toLocaleString('pt-BR') }
      ],
      actionUrl: 'https://blogfilipem2.site/admin',
      actionText: 'Acessar Painel do Blog'
    }).catch((err) => console.error('[Contact] Erro ao disparar e-mail de notificação:', err));

    return NextResponse.json({
      success: true,
      message: 'Obrigado pelo contato! Sua mensagem foi recebida com sucesso pela equipe do BLOG FILIPEM2.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
