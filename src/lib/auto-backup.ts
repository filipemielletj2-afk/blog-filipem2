import { DatabaseSync } from 'node:sqlite';

export interface BackupData {
  version: string;
  exported_at: string;
  site_title: string;
  categories: any[];
  tags: any[];
  articles: any[];
  article_tags: any[];
  pages: any[];
  comments: any[];
  site_settings: any[];
  visual_builder_sections: any[];
  media: any[];
}

/**
 * Generates a full snapshot of all content and configuration from SQLite
 */
export function generateBackupSnapshot(db: DatabaseSync): BackupData {
  return {
    version: '2.0.0',
    exported_at: new Date().toISOString(),
    site_title: 'BLOG FILIPEM2',
    categories: db.prepare('SELECT * FROM categories').all(),
    tags: db.prepare('SELECT * FROM tags').all(),
    articles: db.prepare('SELECT * FROM articles').all(),
    article_tags: db.prepare('SELECT * FROM article_tags').all(),
    pages: db.prepare('SELECT * FROM pages').all(),
    comments: db.prepare('SELECT * FROM comments').all(),
    site_settings: db.prepare('SELECT * FROM site_settings').all(),
    visual_builder_sections: db.prepare('SELECT * FROM visual_builder_sections').all(),
    media: db.prepare('SELECT id, filename, original_name, mime_type, size, url, alt_text, credit, created_at FROM media').all()
  };
}

/**
 * Restores a snapshot into SQLite in an atomic transaction
 */
export function restoreBackupSnapshot(db: DatabaseSync, data: any): { articles: number; categories: number } {
  if (!data || typeof data !== 'object') {
    throw new Error('Dados de backup inválidos.');
  }

  let restoredArticles = 0;
  let restoredCategories = 0;

  db.exec('BEGIN TRANSACTION;');
  try {
    // 1. Categories
    if (Array.isArray(data.categories) && data.categories.length > 0) {
      const insCat = db.prepare(`
        INSERT INTO categories (id, name, slug, description, color, icon, parent_id, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          slug = excluded.slug,
          description = excluded.description,
          color = excluded.color,
          icon = excluded.icon,
          parent_id = excluded.parent_id,
          sort_order = excluded.sort_order
      `);
      for (const c of data.categories) {
        insCat.run(c.id, c.name, c.slug, c.description, c.color || '#DC2626', c.icon || 'Gamepad2', c.parent_id, c.sort_order || 0);
        restoredCategories++;
      }
    }

    // 2. Tags
    if (Array.isArray(data.tags) && data.tags.length > 0) {
      const insTag = db.prepare(`
        INSERT INTO tags (id, name, slug)
        VALUES (?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET name = excluded.name, slug = excluded.slug
      `);
      for (const t of data.tags) {
        insTag.run(t.id, t.name, t.slug);
      }
    }

    // 3. Articles
    if (Array.isArray(data.articles) && data.articles.length > 0) {
      const insArt = db.prepare(`
        INSERT INTO articles (
          id, title, subtitle, slug, content, excerpt, cover_image, cover_caption, cover_source,
          author_id, category_id, status, published_at, updated_at, created_at, reading_time,
          views, featured, meta_title, meta_description, canonical_url, og_image, sources_json, allow_comments,
          amazon_ad_code, amazon_product_title, amazon_product_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          subtitle = excluded.subtitle,
          slug = excluded.slug,
          content = excluded.content,
          excerpt = excluded.excerpt,
          cover_image = excluded.cover_image,
          cover_caption = excluded.cover_caption,
          cover_source = excluded.cover_source,
          category_id = excluded.category_id,
          status = excluded.status,
          published_at = excluded.published_at,
          updated_at = excluded.updated_at,
          reading_time = excluded.reading_time,
          views = excluded.views,
          featured = excluded.featured,
          meta_title = excluded.meta_title,
          meta_description = excluded.meta_description,
          canonical_url = excluded.canonical_url,
          og_image = excluded.og_image,
          sources_json = excluded.sources_json,
          allow_comments = excluded.allow_comments,
          amazon_ad_code = excluded.amazon_ad_code,
          amazon_product_title = excluded.amazon_product_title,
          amazon_product_url = excluded.amazon_product_url
      `);

      for (const a of data.articles) {
        insArt.run(
          a.id,
          a.title,
          a.subtitle,
          a.slug,
          a.content,
          a.excerpt,
          a.cover_image,
          a.cover_caption,
          a.cover_source,
          a.author_id || 1,
          a.category_id,
          a.status || 'published',
          a.published_at || new Date().toISOString(),
          a.updated_at || new Date().toISOString(),
          a.created_at || new Date().toISOString(),
          a.reading_time || 5,
          a.views || 0,
          a.featured ? 1 : 0,
          a.meta_title,
          a.meta_description,
          a.canonical_url,
          a.og_image,
          a.sources_json,
          a.allow_comments !== undefined ? a.allow_comments : 1,
          a.amazon_ad_code || null,
          a.amazon_product_title || null,
          a.amazon_product_url || null
        );
        restoredArticles++;
      }
    }

    // 4. Article Tags
    if (Array.isArray(data.article_tags) && data.article_tags.length > 0) {
      const insArtTag = db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)');
      for (const at of data.article_tags) {
        insArtTag.run(at.article_id, at.tag_id);
      }
    }

    // 5. Pages
    if (Array.isArray(data.pages) && data.pages.length > 0) {
      const insPage = db.prepare(`
        INSERT INTO pages (id, title, slug, content, meta_title, meta_description, is_system, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          slug = excluded.slug,
          content = excluded.content,
          meta_title = excluded.meta_title,
          meta_description = excluded.meta_description,
          is_system = excluded.is_system,
          updated_at = excluded.updated_at
      `);
      for (const p of data.pages) {
        insPage.run(p.id, p.title, p.slug, p.content, p.meta_title, p.meta_description, p.is_system || 0, p.created_at, p.updated_at);
      }
    }

    // 6. Site Settings
    if (Array.isArray(data.site_settings) && data.site_settings.length > 0) {
      const upsert = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
      for (const s of data.site_settings) {
        // Do not overwrite auto_backup settings if they exist
        if (!s.key.startsWith('auto_backup_')) {
          upsert.run(s.key, s.value);
        }
      }
    }

    // 7. Visual Builder Sections
    if (Array.isArray(data.visual_builder_sections) && data.visual_builder_sections.length > 0) {
      db.prepare("DELETE FROM visual_builder_sections WHERE page_identifier = 'home'").run();
      const insSec = db.prepare(`
        INSERT INTO visual_builder_sections (page_identifier, type, title, subtitle, config_json, sort_order, is_active, version_state)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const s of data.visual_builder_sections) {
        insSec.run(
          s.page_identifier || 'home',
          s.type,
          s.title || '',
          s.subtitle || '',
          typeof s.config_json === 'string' ? s.config_json : JSON.stringify(s.config_json || {}),
          s.sort_order || 0,
          s.is_active !== undefined ? (s.is_active ? 1 : 0) : 1,
          s.version_state || 'published'
        );
      }
    }

    // 8. Media metadata
    if (Array.isArray(data.media) && data.media.length > 0) {
      const insMedia = db.prepare(`
        INSERT INTO media (id, filename, original_name, mime_type, size, url, alt_text, credit, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          filename = excluded.filename,
          original_name = excluded.original_name,
          mime_type = excluded.mime_type,
          size = excluded.size,
          url = excluded.url,
          alt_text = excluded.alt_text,
          credit = excluded.credit
      `);
      for (const m of data.media) {
        insMedia.run(
          m.id,
          m.filename,
          m.original_name,
          m.mime_type,
          m.size || 0,
          m.url,
          m.alt_text || null,
          m.credit || null,
          m.created_at || new Date().toISOString()
        );
      }
    }

    db.exec('COMMIT;');
    return { articles: restoredArticles, categories: restoredCategories };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

/**
 * Returns the configured cloud backup provider and target
 */
export function getAutoBackupConfig(db: DatabaseSync): {
  enabled: boolean;
  provider: 'pantry' | 'jsonbin' | 'custom' | 'none';
  pantryId?: string;
  jsonbinKey?: string;
  jsonbinBinId?: string;
  customUrl?: string;
  lastSync?: string;
} {
  try {
    const rows = db.prepare("SELECT key, value FROM site_settings WHERE key LIKE 'auto_backup_%'").all() as Array<{ key: string; value: string }>;
    const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));

    const envPantry = process.env.AUTO_BACKUP_PANTRY_ID?.trim();
    const envProvider = process.env.AUTO_BACKUP_PROVIDER?.trim();
    const envEnabled = process.env.AUTO_BACKUP_ENABLED?.trim();

    const pantryId = settings.auto_backup_pantry_id || envPantry || '';
    const provider = (settings.auto_backup_provider || envProvider || (pantryId ? 'pantry' : 'none')) as any;
    const enabled = settings.auto_backup_enabled === '1' || envEnabled === '1' || (Boolean(pantryId) && settings.auto_backup_enabled !== '0');
    const jsonbinKey = settings.auto_backup_jsonbin_key || process.env.AUTO_BACKUP_JSONBIN_KEY || '';
    const jsonbinBinId = settings.auto_backup_jsonbin_bin_id || process.env.AUTO_BACKUP_JSONBIN_BIN_ID || '';
    const customUrl = settings.auto_backup_custom_url || process.env.AUTO_BACKUP_CUSTOM_URL || '';
    const lastSync = settings.auto_backup_last_sync || '';

    return {
      enabled,
      provider,
      pantryId,
      jsonbinKey,
      jsonbinBinId,
      customUrl,
      lastSync
    };
  } catch {
    return { enabled: false, provider: 'none' };
  }
}

/**
 * Sends a full backup snapshot to the configured cloud provider
 */
export async function pushAutoBackup(db: DatabaseSync): Promise<{ success: boolean; message?: string }> {
  const config = getAutoBackupConfig(db);
  if (!config.enabled) {
    return { success: false, message: 'Backup automático desativado.' };
  }

  const snapshot = generateBackupSnapshot(db);

  try {
    if (config.provider === 'pantry' && config.pantryId) {
      const url = `https://getpantry.cloud/apiv1/pantry/${config.pantryId.trim()}/basket/blogfilipem2`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) throw new Error(`Pantry HTTP ${res.status}`);
    } else if (config.provider === 'jsonbin' && config.jsonbinKey && config.jsonbinBinId) {
      const url = `https://api.jsonbin.io/v3/b/${config.jsonbinBinId.trim()}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': config.jsonbinKey.trim()
        },
        body: JSON.stringify(snapshot),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) throw new Error(`JSONBin HTTP ${res.status}`);
    } else if (config.provider === 'custom' && config.customUrl) {
      const res = await fetch(config.customUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) throw new Error(`Custom Webhook HTTP ${res.status}`);
    } else {
      return { success: false, message: 'Provedor não configurado corretamente.' };
    }

    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO site_settings (key, value) VALUES ('auto_backup_last_sync', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(now);

    return { success: true, message: `Backup sincronizado na nuvem com sucesso às ${new Date().toLocaleTimeString('pt-BR')}` };
  } catch (err: any) {
    console.error('[AutoBackup] Erro ao sincronizar backup:', err.message);
    return { success: false, message: err.message };
  }
}

/**
 * Called on server startup. Pulls the latest cloud backup and restores it if available.
 */
export async function pullAutoBackupOnStartup(db: DatabaseSync): Promise<void> {
  const config = getAutoBackupConfig(db);
  if (!config.enabled) return;

  try {
    let remoteData: any = null;

    if (config.provider === 'pantry' && config.pantryId) {
      const url = `https://getpantry.cloud/apiv1/pantry/${config.pantryId.trim()}/basket/blogfilipem2`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        remoteData = await res.json();
      }
    } else if (config.provider === 'jsonbin' && config.jsonbinKey && config.jsonbinBinId) {
      const url = `https://api.jsonbin.io/v3/b/${config.jsonbinBinId.trim()}/latest`;
      const res = await fetch(url, {
        headers: { 'X-Master-Key': config.jsonbinKey.trim() },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const json = await res.json();
        remoteData = json.record;
      }
    } else if (config.provider === 'custom' && config.customUrl) {
      const res = await fetch(config.customUrl.trim(), { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        remoteData = await res.json();
      }
    }

    if (remoteData && Array.isArray(remoteData.articles)) {
      console.log(`[AutoBackup] Restaurando automaticamente ${remoteData.articles.length} artigos da nuvem após reinício...`);
      restoreBackupSnapshot(db, remoteData);
      console.log('[AutoBackup] Restauração automática concluída com sucesso!');
    }
  } catch (err: any) {
    console.error('[AutoBackup] Erro ao restaurar backup na inicialização:', err.message);
  }
}

let startupSyncPromise: Promise<void> | null = null;

/**
 * Ensures cloud backup restoration runs at most once on startup.
 */
export function ensureAutoBackupSynced(db: DatabaseSync): Promise<void> {
  if (!startupSyncPromise) {
    startupSyncPromise = pullAutoBackupOnStartup(db).catch(err => {
      console.error('[AutoBackup] Startup sync catch:', err);
    });
  }
  return startupSyncPromise;
}

export function resetStartupSyncPromise(): void {
  startupSyncPromise = null;
}

/**
 * Helper to trigger auto-backup asynchronously without blocking API responses
 */
export function triggerAutoBackupAsync(db: DatabaseSync): void {
  Promise.resolve().then(async () => {
    try {
      await pushAutoBackup(db);
    } catch (err) {
      console.error('[AutoBackup] Falha silenciosa no auto-backup:', err);
    }
  });
}
