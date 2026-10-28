import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    const db = getDb();
    const backupData = {
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
      media: db.prepare('SELECT * FROM media').all()
    };

    const jsonString = JSON.stringify(backupData, null, 2);

    return new Response(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="blog-filipem2-backup-${Date.now()}.json"`
      }
    });
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

    const data = await request.json();
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Arquivo de backup inválido ou corrompido.' }, { status: 400 });
    }

    const db = getDb();

    // Start transaction for atomic restore
    db.exec('BEGIN TRANSACTION;');

    try {
      let restoredArticlesCount = 0;
      let restoredCategoriesCount = 0;
      let restoredSectionsCount = 0;

      // 1. Restore Categories
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
          restoredCategoriesCount++;
        }
      }

      // 2. Restore Tags
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

      // 3. Restore Articles
      if (Array.isArray(data.articles) && data.articles.length > 0) {
        const insArt = db.prepare(`
          INSERT INTO articles (
            id, title, subtitle, slug, content, excerpt, cover_image, cover_caption, cover_source,
            author_id, category_id, status, published_at, updated_at, created_at, reading_time,
            views, featured, meta_title, meta_description, canonical_url, og_image, sources_json, allow_comments
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            allow_comments = excluded.allow_comments
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
            a.author_id || user.id,
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
            a.allow_comments !== undefined ? a.allow_comments : 1
          );
          restoredArticlesCount++;
        }
      }

      // 4. Restore Article Tags
      if (Array.isArray(data.article_tags) && data.article_tags.length > 0) {
        const insArtTag = db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)');
        for (const at of data.article_tags) {
          insArtTag.run(at.article_id, at.tag_id);
        }
      }

      // 5. Restore Pages
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

      // 6. Restore Site Settings
      if (Array.isArray(data.site_settings) && data.site_settings.length > 0) {
        const upsert = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
        for (const s of data.site_settings) {
          upsert.run(s.key, s.value);
        }
      }

      // 7. Restore Visual Builder Sections
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
          restoredSectionsCount++;
        }
      }

      // Commit transaction
      db.exec('COMMIT;');

      db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(
        user.id,
        'BACKUP_RESTORE',
        `Restauração completa efetuada: ${restoredArticlesCount} artigos, ${restoredCategoriesCount} categorias e ${restoredSectionsCount} seções importadas.`
      );

      return NextResponse.json({
        success: true,
        message: `Restauração concluída com sucesso! ${restoredArticlesCount} artigos e ${restoredCategoriesCount} categorias sincronizados.`
      });
    } catch (innerError: any) {
      db.exec('ROLLBACK;');
      throw innerError;
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
