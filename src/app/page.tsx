import React from 'react';
import Link from 'next/link';
import { getDb, toPlain } from '@/lib/db';
import ArticleCard from '@/components/ArticleCard';
import BreakingTicker from '@/components/BreakingTicker';
import AdBanner from '@/components/AdBanner';
import NewsletterBox from '@/components/NewsletterBox';
import { ArrowRight, Flame, Play, Mail, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { formatDateBR, formatYouTubeEmbedUrl } from '@/lib/utils';

export const revalidate = 0; // Always serve fresh dynamic content

export default function HomePage() {
  const db = getDb();

  // Fetch published builder sections
  const sections = toPlain(db.prepare(`
    SELECT * FROM visual_builder_sections
    WHERE page_identifier = 'home' AND is_active = 1 AND version_state = 'published'
    ORDER BY sort_order ASC
  `).all()) as any[];

  // Fetch recent articles for tickers and general feed
  const allArticles = toPlain(db.prepare(`
    SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
           u.name as author_name, u.avatar as author_avatar
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    JOIN users u ON a.author_id = u.id
    WHERE a.status = 'published'
    ORDER BY a.published_at DESC LIMIT 20
  `).all()) as any[];

  // Fetch featured articles
  const featuredArticles = allArticles.filter(a => a.featured === 1);
  const heroMain = featuredArticles[0] || allArticles[0];
  const heroSecondary = (featuredArticles.length > 1 ? featuredArticles.slice(1, 3) : allArticles.slice(1, 3));

  // Fetch ad settings
  const adHeader = db.prepare('SELECT value FROM site_settings WHERE key = ?').get('ad_header_enabled') as any;
  const adHeaderCode = db.prepare('SELECT value FROM site_settings WHERE key = ?').get('ad_header_code') as any;

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Header Ad Slot if enabled */}
      <div className="max-w-7xl mx-auto px-4">
        <AdBanner
          slot="header"
          enabled={adHeader?.value === '1'}
          code={adHeaderCode?.value}
        />
      </div>

      {/* Render Visual Page Builder Sections */}
      {sections.map((section) => {
        let config: any = {};
        try {
          config = typeof section.config_json === 'string' ? JSON.parse(section.config_json) : (section.config_json || {});
        } catch {
          config = {};
        }

        switch (section.type) {
          // 1. HERO FEATURED
          case 'hero_featured': {
            if (!heroMain) return null;
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Big Hero Card */}
                  <div className="lg:col-span-8 group relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl min-h-[420px] sm:min-h-[500px] flex flex-col justify-end p-6 sm:p-10">
                    <img
                      src={heroMain.cover_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'}
                      alt={heroMain.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.75] group-hover:brightness-[0.85]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                    <div className="relative z-10 space-y-3.5">
                      <div className="flex items-center space-x-3">
                        <span
                          className="px-3 py-1 rounded-md text-xs font-black tracking-wider uppercase text-white shadow-lg"
                          style={{ backgroundColor: heroMain.category_color || '#DC2626' }}
                        >
                          {heroMain.category_name}
                        </span>
                        <span className="text-xs text-neutral-300 font-medium">
                          {formatDateBR(heroMain.published_at)}
                        </span>
                        <span className="text-neutral-500">•</span>
                        <span className="text-xs text-neutral-300">
                          {heroMain.reading_time || 5} min de leitura
                        </span>
                      </div>

                      <Link href={`/artigo/${heroMain.slug}`}>
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-white group-hover:text-red-300 transition-colors leading-tight">
                          {heroMain.title}
                        </h1>
                      </Link>

                      <p className="text-sm sm:text-base text-neutral-300 line-clamp-2 max-w-2xl leading-relaxed">
                        {heroMain.subtitle || heroMain.excerpt}
                      </p>

                      <div className="pt-2">
                        <Link
                          href={`/artigo/${heroMain.slug}`}
                          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-red-600/40 transition-all"
                        >
                          <span>LER MATÉRIA COMPLETA</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Stacks */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    {heroSecondary.map((sec) => (
                      <div
                        key={sec.id}
                        className="group relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl flex-1 min-h-[220px] flex flex-col justify-end p-5"
                      >
                        <img
                          src={sec.cover_image}
                          alt={sec.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-[0.7]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

                        <div className="relative z-10 space-y-2">
                          <span
                            className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold text-white uppercase"
                            style={{ backgroundColor: sec.category_color || '#DC2626' }}
                          >
                            {sec.category_name}
                          </span>
                          <Link href={`/artigo/${sec.slug}`}>
                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-red-300 transition-colors line-clamp-2 leading-snug">
                              {sec.title}
                            </h3>
                          </Link>
                          <span className="text-[11px] text-neutral-400 block">
                            {formatDateBR(sec.published_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          // 2. BREAKING TICKER
          case 'breaking_ticker': {
            return (
              <BreakingTicker
                key={section.id}
                articles={allArticles.slice(0, config.limit || 5)}
                badgeText={config.badgeText || 'EM ALTA'}
              />
            );
          }

          // 3. CATEGORY GRID
          case 'category_grid': {
            const catSlug = config.categorySlug;
            const limit = config.limit || 3;
            let catArticles: any[] = [];

            if (catSlug) {
              catArticles = db.prepare(`
                SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
                       u.name as author_name
                FROM articles a
                JOIN categories c ON a.category_id = c.id
                JOIN users u ON a.author_id = u.id
                WHERE c.slug = ? AND a.status = 'published'
                ORDER BY a.published_at DESC LIMIT ?
              `).all(catSlug, limit);
            } else {
              catArticles = allArticles.slice(0, limit);
            }

            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-8 pb-4 border-b border-neutral-800">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-red-600"></span>
                      {section.title || 'Destaques'}
                    </h2>
                    {section.subtitle && (
                      <p className="text-sm text-neutral-400 mt-1">{section.subtitle}</p>
                    )}
                  </div>
                  {catSlug && (
                    <Link
                      href={`/categoria/${catSlug}`}
                      className="text-xs sm:text-sm font-semibold text-red-500 hover:text-red-400 flex items-center gap-1 group"
                    >
                      <span>Ver todas</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catArticles.map((art) => (
                    <ArticleCard key={art.id} article={art} layout="standard" />
                  ))}
                </div>
              </section>
            );
          }

          // 4. VIDEO SHOWCASE
          case 'video_showcase': {
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-3xl bg-gradient-to-r from-[#171924] via-[#12141c] to-[#1a131b] border border-neutral-800 p-6 sm:p-10 shadow-2xl overflow-hidden">
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="lg:w-1/2 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-400 text-xs font-bold">
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>VÍDEO SHOWCASE OFICIAL</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                        {config.videoTitle || section.title || 'Confira a Prévia Especial'}
                      </h2>
                      <p className="text-sm text-neutral-300 leading-relaxed">
                        {config.videoDescription || section.subtitle || 'Assista aos trailers, novidades e anúncios em alta definição com comentários exclusivos.'}
                      </p>
                    </div>

                    <div className="lg:w-1/2 w-full aspect-video rounded-2xl overflow-hidden border border-neutral-700/80 shadow-2xl bg-black">
                      <iframe
                        src={formatYouTubeEmbedUrl(config.videoUrl) || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                        title={config.videoTitle || 'Vídeo em Destaque'}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          // 5. NEWSLETTER
          case 'newsletter': {
            return (
              <NewsletterBox
                key={section.id}
                title={section.title}
                subtitle={section.subtitle}
                buttonText={config.buttonText}
                placeholder={config.placeholder}
              />
            );
          }

          // 6. CUSTOM HTML
          case 'custom_html': {
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div dangerouslySetInnerHTML={{ __html: config.html || '' }} />
              </section>
            );
          }

          default:
            return null;
        }
      })}

      {/* Two Column Bottom Feed: More articles + Sidebar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" />
                Feed Geral de Matérias
              </h3>
            </div>

            <div className="space-y-4">
              {allArticles.slice(3).map((art) => (
                <ArticleCard key={art.id} article={art} layout="horizontal" />
              ))}
            </div>
          </div>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Popular Articles Widget */}
            <div className="p-5 rounded-2xl bg-[#14161f] border border-neutral-800 shadow-xl space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white border-l-2 border-red-600 pl-2.5 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-red-500" />
                Mais Lidos da Semana
              </h4>

              <div className="space-y-3">
                {allArticles.slice(0, 5).map((pop, idx) => (
                  <Link
                    key={pop.id}
                    href={`/artigo/${pop.slug}`}
                    className="flex items-start gap-3 group py-2 border-b border-neutral-800/60 last:border-0"
                  >
                    <span className="text-xl font-black text-neutral-600 group-hover:text-red-500 font-mono w-6">
                      0{idx + 1}
                    </span>
                    <div className="flex-1">
                      <h5 className="text-xs sm:text-sm font-semibold text-neutral-200 group-hover:text-red-300 transition-colors line-clamp-2">
                        {pop.title}
                      </h5>
                      <span className="text-[10px] text-neutral-500 mt-0.5 block">
                        {formatDateBR(pop.published_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar Ad Widget */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">
                Espaço Patrocinado
              </span>
              <div className="mt-2 h-60 rounded-xl bg-[#0c0d10] border border-dashed border-neutral-800 flex flex-col items-center justify-center p-4 text-neutral-500">
                <span className="text-xs font-semibold text-neutral-400">Banner Responsivo</span>
                <span className="text-[11px] text-neutral-600 mt-1">Configurável no Painel Administrativo</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
