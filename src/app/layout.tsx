import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import { getDb, toPlain } from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  const db = getDb();
  const settingsRows = db.prepare('SELECT key, value FROM site_settings').all() as Array<{ key: string; value: string }>;
  const settings = Object.fromEntries(settingsRows.map(r => [r.key, r.value]));

  const title = settings.site_title || 'BLOG FILIPEM2';
  const description = settings.site_description || 'Portal profissional de games, músicas, filmes, séries e cultura geek.';

  return {
    title: {
      default: `${title} | O Portal Definitivo de Games, Séries e Cultura Geek`,
      template: `%s | ${title}`
    },
    description,
    keywords: ['games', 'notícias de jogos', 'playstation 5', 'xbox series x', 'nintendo switch', 'músicas', 'filmes', 'séries', 'streaming', 'cultura geek', 'tecnologia', 'inteligência artificial'],
    authors: [{ name: 'Filipe M.', url: settings.site_url || 'https://blogfilipem2.com.br' }],
    metadataBase: new URL(settings.site_url || 'https://blogfilipem2.com.br'),
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: settings.site_url || 'https://blogfilipem2.com.br',
      siteName: title,
      title: `${title} — Games, Músicas, Cinema e Tecnologia`,
      description,
      images: [
        {
          url: '/logo.svg',
          width: 1200,
          height: 630,
          alt: 'BLOG FILIPEM2 Portal'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@filipem2'
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    icons: {
      icon: '/favicon.svg',
      apple: '/favicon.svg'
    }
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const db = getDb();
  const categories = toPlain(db.prepare('SELECT name, slug, color FROM categories ORDER BY sort_order ASC').all()) as any[];
  const settingsRows = db.prepare('SELECT key, value FROM site_settings').all() as Array<{ key: string; value: string }>;
  const settings = Object.fromEntries(settingsRows.map(r => [r.key, r.value]));

  const primaryColor = settings.theme_primary_color || '#DC2626';
  const borderRadius = settings.theme_border_radius || '0.75rem';

  const schemaOrgSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.site_title || 'BLOG FILIPEM2',
    url: settings.site_url || 'https://blogfilipem2.com.br',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${settings.site_url || 'https://blogfilipem2.com.br'}/busca?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  const schemaOrgOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.site_title || 'BLOG FILIPEM2',
    url: settings.site_url || 'https://blogfilipem2.com.br',
    logo: `${settings.site_url || 'https://blogfilipem2.com.br'}/logo.svg`,
    sameAs: [
      'https://youtube.com',
      'https://twitter.com',
      'https://instagram.com'
    ]
  };

  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800;900&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${primaryColor};
              --radius: ${borderRadius};
            }
          `
        }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgOrg) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#0c0d10] text-slate-100 antialiased selection:bg-red-600 selection:text-white">
        <Header categories={categories} siteTitle={settings.site_title} />
        <main className="flex-1">{children}</main>
        <Footer categories={categories} footerText={settings.footer_text} />
        <CookieBanner />
      </body>
    </html>
  );
}
