import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendSiteNotification } from '@/lib/email-notifications';

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = request.headers.get('cf-connecting-ip') ||
               (forwarded ? forwarded.split(',')[0].trim() : null) ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1';

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Por favor, informe seu e-mail.' }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim().slice(0, 100);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Por favor, informe um endereço de e-mail válido.' }, { status: 400 });
    }

    const db = getDb();

    // Ensure table exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert or ignore if already subscribed
    const existing = db.prepare('SELECT id FROM newsletter_subscribers WHERE email = ?').get(cleanEmail);
    if (!existing) {
      db.prepare('INSERT INTO newsletter_subscribers (email) VALUES (?)').run(cleanEmail);
    }

    // Send email notification to site owner
    sendSiteNotification({
      type: 'newsletter_subscriber',
      badge: 'Nova Inscrição',
      badgeColor: '#10B981',
      subject: `Novo Assinante na Newsletter: ${cleanEmail}`,
      headline: 'Um novo leitor se inscreveu para receber as novidades do seu portal!',
      summary: 'A lista de leitores do BLOG FILIPEM2 está crescendo. Confira os dados do assinante abaixo:',
      fields: [
        { label: 'E-mail do Assinante', value: cleanEmail },
        { label: 'Data e Hora', value: new Date().toLocaleString('pt-BR') },
        { label: 'Status', value: existing ? 'E-mail reconfirmado' : 'Novo Assinante Ativo' },
        { label: 'IP de Origem', value: ip }
      ],
      actionUrl: 'https://blogfilipem2.site/admin',
      actionText: 'Acessar Painel do Blog'
    }).catch((err) => console.error('[Newsletter] Erro ao enviar notificação:', err));

    return NextResponse.json({
      success: true,
      message: 'Inscrição confirmada com sucesso! Você receberá as novidades diretamente no seu e-mail.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
