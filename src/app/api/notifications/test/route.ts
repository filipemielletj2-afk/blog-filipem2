import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sendSiteNotification } from '@/lib/email-notifications';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const db = getDb();
    const row = db.prepare("SELECT value FROM site_settings WHERE key = 'admin_notification_email'").get() as { value: string } | undefined;
    const recipient = row?.value || 'filipemielletj2@gmail.com';

    const result = await sendSiteNotification({
      type: 'security_alert',
      badge: 'Teste de Conexão',
      badgeColor: '#10B981',
      subject: 'Teste de Notificação Oficial do BLOG FILIPEM2',
      headline: 'Seu canal de notificações por e-mail está funcionando com sucesso!',
      summary: 'Esta mensagem de teste confirma que o sistema de avisos automáticos do portal está configurado e pronto para alertar sobre novas mensagens, comentários e inscrições.',
      fields: [
        { label: 'Destinatário', value: recipient },
        { label: 'Status da Conexão', value: 'Ativo e Operacional' },
        { label: 'Disparado Por', value: user.name + ` (${user.email})` },
        { label: 'Data e Hora', value: new Date().toLocaleString('pt-BR') }
      ],
      actionUrl: 'https://blogfilipem2.site/admin',
      actionText: 'Acessar Painel Administrativo'
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
