import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get('ads_txt') as any;
    
    let content = row?.value?.trim();
    if (!content) {
      content = `# ads.txt - BLOG FILIPEM2 (https://blogfilipem2.site)
# Adicione suas linhas de autorização de publicidade no Painel Admin (/admin/monetizacao).
# Exemplo Google AdSense:
# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
`;
    }

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error: any) {
    return new Response('# Erro ao carregar ads.txt: ' + error.message, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
