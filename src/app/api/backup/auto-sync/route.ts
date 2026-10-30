import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getAutoBackupConfig, pushAutoBackup } from '@/lib/auto-backup';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    const db = getDb();
    const config = getAutoBackupConfig(db);
    return NextResponse.json(config);
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

    const body = await request.json();
    const { action, enabled, provider, pantryId, jsonbinKey, jsonbinBinId, customUrl, gdriveUrl, gdriveRetention } = body;

    const db = getDb();

    // Action: Trigger immediate test sync
    if (action === 'test_sync') {
      if (pantryId || customUrl || jsonbinKey || gdriveUrl) {
        const updates: Record<string, string> = {
          auto_backup_enabled: enabled !== undefined ? (enabled ? '1' : '0') : '1',
          auto_backup_provider: provider || (gdriveUrl ? 'gdrive' : (pantryId ? 'pantry' : 'none')),
          auto_backup_pantry_id: pantryId || '',
          auto_backup_jsonbin_key: jsonbinKey || '',
          auto_backup_jsonbin_bin_id: jsonbinBinId || '',
          auto_backup_custom_url: customUrl || '',
          auto_backup_gdrive_url: gdriveUrl || '',
          auto_backup_gdrive_retention: String(gdriveRetention || '7')
        };

        const upsertStmt = db.prepare(`
          INSERT INTO site_settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `);

        for (const [k, v] of Object.entries(updates)) {
          upsertStmt.run(k, v);
        }
      }

      const result = await pushAutoBackup(db);
      if (!result.success) {
        return NextResponse.json({ error: result.message || 'Falha ao sincronizar com a nuvem.' }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: result.message });
    }

    // Action: Save configuration
    const updates: Record<string, string> = {
      auto_backup_enabled: enabled ? '1' : '0',
      auto_backup_provider: provider || 'none',
      auto_backup_pantry_id: pantryId || '',
      auto_backup_jsonbin_key: jsonbinKey || '',
      auto_backup_jsonbin_bin_id: jsonbinBinId || '',
      auto_backup_custom_url: customUrl || '',
      auto_backup_gdrive_url: gdriveUrl || '',
      auto_backup_gdrive_retention: String(gdriveRetention || '7')
    };

    const upsertStmt = db.prepare(`
      INSERT INTO site_settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    for (const [k, v] of Object.entries(updates)) {
      upsertStmt.run(k, v);
    }

    // If enabled, attempt an initial sync immediately
    let initialSyncMessage = '';
    if (enabled && (pantryId || customUrl || gdriveUrl || (jsonbinKey && jsonbinBinId))) {
      const syncResult = await pushAutoBackup(db);
      initialSyncMessage = syncResult.success
        ? ' e backup inicial salvo na nuvem!'
        : ` (Aviso na sincronização: ${syncResult.message})`;
    }

    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(
      user.id,
      'AUTO_BACKUP_CONFIG',
      `Configuração de backup automático em nuvem atualizada (${enabled ? 'ATIVADO' : 'DESATIVADO'}).`
    );

    return NextResponse.json({
      success: true,
      message: `Configurações de sincronização salvas com sucesso${initialSyncMessage}`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
