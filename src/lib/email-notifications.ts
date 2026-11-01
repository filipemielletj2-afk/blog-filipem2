import { DatabaseSync } from 'node:sqlite';
import { getDb } from './db';

export interface SiteNotification {
  type: 'contact_message' | 'new_comment' | 'newsletter_subscriber' | 'backup_status' | 'security_alert';
  subject: string;
  badge: string;
  badgeColor?: string;
  headline: string;
  summary: string;
  fields: Array<{ label: string; value: string }>;
  actionUrl?: string;
  actionText?: string;
}

export function formatNotificationHtml(notification: SiteNotification, siteUrl: string): string {
  const badgeBg = notification.badgeColor || '#DC2626';
  const currentYear = new Date().getFullYear();

  const fieldsHtml = notification.fields
    .map(
      (f) => `
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #27272a; color: #a1a1aa; font-size: 13px; font-weight: 600; width: 35%;">${f.label}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #27272a; color: #f4f4f5; font-size: 13px; font-weight: 500;">${f.value}</td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${notification.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #090a0f; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #12141c; border-radius: 20px; border: 1px solid #27272a; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #1c1f2e 0%, #12141c 100%); border-bottom: 1px solid #27272a;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <span style="display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #ef4444;">PORTAL OFICIAL</span>
                    <h1 style="margin: 4px 0 0 0; font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: 1px;">BLOG FILIPEM2</h1>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 5px 12px; border-radius: 9999px; background-color: ${badgeBg}; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${notification.badge}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #ffffff;">
                ${notification.headline}
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #d4d4d8;">
                ${notification.summary}
              </p>

              <!-- Fields Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0e14; border-radius: 12px; border: 1px solid #27272a; margin-bottom: 28px; border-collapse: collapse;">
                ${fieldsHtml}
              </table>

              <!-- Call to Action Button -->
              ${
                notification.actionUrl
                  ? `
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center">
                      <a href="${notification.actionUrl}" style="display: inline-block; padding: 14px 28px; background-color: #dc2626; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border-radius: 12px; box-shadow: 0 10px 20px rgba(220, 38, 38, 0.35);">
                        ${notification.actionText || 'Ver no Painel Administrativo'} &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              `
                  : ''
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0b0c10; border-top: 1px solid #1f2028; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #71717a;">
                Esta notificação automática foi enviada pelo seu portal <a href="${siteUrl}" style="color: #ef4444; text-decoration: none; font-weight: 600;">blogfilipem2.site</a> para o administrador.
              </p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #52525b;">
                &copy; ${currentYear} BLOG FILIPEM2 &bull; Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendSiteNotification(notification: SiteNotification): Promise<{ success: boolean; message: string }> {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM site_settings').all() as Array<{ key: string; value: string }>;
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    // Check if notifications are enabled
    if (settings.email_notifications_enabled === '0') {
      return { success: false, message: 'Notificações por e-mail desativadas nas configurações.' };
    }

    const targetEmail = settings.admin_notification_email || 'filipemielletj2@gmail.com';
    const siteUrl = settings.site_url || 'https://blogfilipem2.site';
    const htmlBody = formatNotificationHtml(notification, siteUrl);

    // Record in audit logs
    try {
      db.prepare('INSERT INTO audit_logs (action, details) VALUES (?, ?)').run(
        'EMAIL_NOTIFICATION',
        `Notificação [${notification.badge}] enviada para ${targetEmail}: ${notification.headline}`
      );
    } catch {}

    // Method 1: Google Apps Script Webhook (native to user's Google account)
    const gdriveUrl = settings.auto_backup_gdrive_url || settings.notification_email_webhook_url || process.env.AUTO_BACKUP_GDRIVE_URL || '';
    if (gdriveUrl && gdriveUrl.startsWith('https://script.google.com/macros/s/')) {
      try {
        const res = await fetch(gdriveUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send_email',
            to: targetEmail,
            subject: `[BLOG FILIPEM2] ${notification.subject}`,
            html: htmlBody,
            text: `${notification.headline}\n\n${notification.summary}\n\n${notification.fields.map((f) => `${f.label}: ${f.value}`).join('\n')}`
          }),
          redirect: 'follow',
          signal: AbortSignal.timeout(12000)
        });
        if (res.ok) {
          return { success: true, message: `Notificação enviada com sucesso para ${targetEmail} via Google Apps Script!` };
        }
      } catch (err: any) {
        console.error('[Notification] Falha ao enviar via Google Apps Script:', err.message);
      }
    }

    // Method 2: Resend API if key is present
    const resendKey = settings.resend_api_key || process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey.trim()}`
          },
          body: JSON.stringify({
            from: 'BLOG FILIPEM2 <notificacoes@blogfilipem2.site>',
            to: [targetEmail],
            subject: `[BLOG FILIPEM2] ${notification.subject}`,
            html: htmlBody
          }),
          signal: AbortSignal.timeout(10000)
        });
        if (res.ok) {
          return { success: true, message: `E-mail enviado para ${targetEmail} via Resend!` };
        }
      } catch (err: any) {
        console.error('[Notification] Falha ao enviar via Resend:', err.message);
      }
    }

    // Method 3: Generic Notification Webhook if configured
    const webhookUrl = settings.notification_webhook_url || process.env.NOTIFICATION_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: targetEmail,
            subject: notification.subject,
            headline: notification.headline,
            fields: notification.fields,
            siteUrl
          }),
          signal: AbortSignal.timeout(8000)
        });
        return { success: true, message: `Notificação enviada para o webhook configurado.` };
      } catch {}
    }

    return {
      success: false,
      message: `Nenhum canal de envio configurado (Google Apps Script ou chave Resend). O e-mail foi registrado no banco, mas não pôde ser enviado para a caixa de entrada de ${targetEmail}. Configure a URL do Google Apps Script no painel!`
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
