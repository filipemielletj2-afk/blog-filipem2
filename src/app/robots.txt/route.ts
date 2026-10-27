import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get('robots_txt_content') as any;

    const robotsContent = row?.value || `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://blogfilipem2.site/sitemap.xml`;

    return new Response(robotsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch {
    return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n`, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
