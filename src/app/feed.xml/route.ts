import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const siteUrlSetting = db.prepare('SELECT value FROM site_settings WHERE key = ?').get('site_url') as any;
    const baseUrl = siteUrlSetting?.value || 'https://blogfilipem2.site';

    const articles = db.prepare(`
      SELECT a.id, a.title, a.subtitle, a.slug, a.excerpt, a.cover_image, a.published_at,
             c.name as category_name, u.name as author_name
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      JOIN users u ON a.author_id = u.id
      WHERE a.status = 'published'
      ORDER BY a.published_at DESC LIMIT 30
    `).all() as any[];

    const escapeXml = (unsafe: string) => {
      if (!unsafe) return '';
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>BLOG FILIPEM2 | Games, Séries, Músicas e Cultura Geek</title>\n`;
    xml += `    <link>${baseUrl}</link>\n`;
    xml += `    <description>Portal independente de jornalismo e análises sobre games, séries, cultura geek e tecnologia.</description>\n`;
    xml += `    <language>pt-BR</language>\n`;
    xml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
    xml += `    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>\n`;

    for (const art of articles) {
      const artUrl = `${baseUrl}/artigo/${art.slug}`;
      const pubDate = new Date(art.published_at || Date.now()).toUTCString();

      xml += `    <item>\n`;
      xml += `      <title>${escapeXml(art.title)}</title>\n`;
      xml += `      <link>${artUrl}</link>\n`;
      xml += `      <guid isPermaLink="true">${artUrl}</guid>\n`;
      xml += `      <description>${escapeXml(art.excerpt || art.subtitle || art.title)}</description>\n`;
      xml += `      <category>${escapeXml(art.category_name)}</category>\n`;
      xml += `      <author>${escapeXml(art.author_name || 'BLOG FILIPEM2')}</author>\n`;
      xml += `      <pubDate>${pubDate}</pubDate>\n`;
      if (art.cover_image) {
        const fullCover = art.cover_image.startsWith('http') ? art.cover_image : `${baseUrl}${art.cover_image}`;
        xml += `      <media:content url="${escapeXml(fullCover)}" medium="image"/>\n`;
        xml += `      <enclosure url="${escapeXml(fullCover)}" type="image/jpeg" length="0"/>\n`;
      }
      xml += `    </item>\n`;
    }

    xml += `  </channel>\n`;
    xml += `</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800'
      }
    });
  } catch (error: any) {
    return new Response('Error generating RSS feed: ' + error.message, { status: 500 });
  }
}
