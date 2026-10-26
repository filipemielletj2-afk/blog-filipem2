import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const siteUrlSetting = db.prepare('SELECT value FROM site_settings WHERE key = ?').get('site_url') as any;
    const baseUrl = siteUrlSetting?.value || 'https://blogfilipem2.com.br';

    const articles = db.prepare(`
      SELECT slug, updated_at, published_at FROM articles
      WHERE status = 'published'
      ORDER BY published_at DESC
    `).all() as Array<{ slug: string; updated_at: string; published_at: string }>;

    const categories = db.prepare('SELECT slug FROM categories').all() as Array<{ slug: string }>;
    const pages = db.prepare('SELECT slug, updated_at FROM pages').all() as Array<{ slug: string; updated_at: string }>;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Home
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // Categories
    for (const cat of categories) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/categoria/${cat.slug}</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Articles
    for (const art of articles) {
      const date = art.updated_at || art.published_at || new Date().toISOString();
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/artigo/${art.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(date).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }

    // Pages
    for (const page of pages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/${page.slug}</loc>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error: any) {
    return new Response('Error generating sitemap: ' + error.message, { status: 500 });
  }
}
