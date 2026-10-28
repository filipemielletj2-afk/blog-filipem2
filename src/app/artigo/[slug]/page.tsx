import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb, toPlain } from '@/lib/db';
import { ensureAutoBackupSynced } from '@/lib/auto-backup';
import { formatDateBR, formatDateTimeBR } from '@/lib/utils';
import ArticleCard from '@/components/ArticleCard';
import CommentsSection from './CommentsSection';
import ShareButtons from './ShareButtons';
import {
  Calendar,
  Clock,
  Eye,
  ChevronRight,
  User,
  ExternalLink,
  ShieldCheck,
  BookmarkCheck
} from 'lucide-react';

export const revalidate = 0;

function formatArticleContent(content?: string): string {
  if (!content) return '';

  // If content already contains rich HTML tags, return directly
  const hasParagraphs = /<\/?(p|div|h[1-6]|ul|ol|li|blockquote|table|section|article)\b/i.test(content);
  if (hasParagraphs) {
    return content;
  }

  // Content was entered as raw text / newlines:
  const rawLines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const blocks: string[] = [];
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      blocks.push(`<p>${currentParagraphLines.join(' ')}</p>`);
      currentParagraphLines = [];
    }
  };

  for (const line of rawLines) {
    if (/^##\s+(.*)/.test(line)) {
      flushParagraph();
      blocks.push(`<h2>${line.replace(/^##\s+/, '')}</h2>`);
      continue;
    }
    if (/^###\s+(.*)/.test(line)) {
      flushParagraph();
      blocks.push(`<h3>${line.replace(/^###\s+/, '')}</h3>`);
      continue;
    }

    // Standalone headings (short lines under 85 chars, not ending with punctuation)
    const isHeading = line.length < 85 && !/[.,;]$/.test(line) && !line.startsWith('http');
    if (isHeading) {
      flushParagraph();
      blocks.push(`<h2>${line}</h2>`);
    } else {
      currentParagraphLines.push(line);
    }
  }

  flushParagraph();
  return blocks.join('\n');
}

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const db = getDb();
  await ensureAutoBackupSynced(db);
  const article = db.prepare(`
    SELECT a.*, c.name as category_name
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    WHERE a.slug = ?
  `).get(params.slug) as any;

  if (!article) {
    return { title: 'Artigo não encontrado | BLOG FILIPEM2' };
  }

  const metaTitle = article.meta_title || `${article.title} | BLOG FILIPEM2`;
  const metaDesc = article.meta_description || article.excerpt || article.title;
  const url = `https://blogfilipem2.site/artigo/${article.slug}`;

  return {
    title: metaTitle,
    description: metaDesc,
    alternates: {
      canonical: article.canonical_url || url
    },
    openGraph: {
      type: 'article',
      locale: 'pt_BR',
      url,
      title: metaTitle,
      description: metaDesc,
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      section: article.category_name,
      images: [
        {
          url: article.og_image || article.cover_image || '/logo.svg',
          width: 1200,
          height: 630,
          alt: article.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDesc,
      images: [article.og_image || article.cover_image || '/logo.svg']
    }
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const db = getDb();
  await ensureAutoBackupSynced(db);

  // Increment view count
  db.prepare('UPDATE articles SET views = views + 1 WHERE slug = ?').run(params.slug);

  const article = toPlain(db.prepare(`
    SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
           u.name as author_name, u.avatar as author_avatar, u.bio as author_bio
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    JOIN users u ON a.author_id = u.id
    WHERE a.slug = ?
  `).get(params.slug)) as any;

  if (!article) {
    notFound();
  }

  // Fetch tags
  const tags = toPlain(db.prepare(`
    SELECT t.id, t.name, t.slug
    FROM tags t
    JOIN article_tags at ON t.id = at.tag_id
    WHERE at.article_id = ?
  `).all(article.id)) as any[];

  // Fetch comments
  const comments = toPlain(db.prepare(`
    SELECT * FROM comments
    WHERE article_id = ? AND status = 'approved'
    ORDER BY created_at DESC
  `).all(article.id)) as any[];

  // Fetch related articles
  const related = toPlain(db.prepare(`
    SELECT a.*, c.name as category_name, c.color as category_color, u.name as author_name
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    JOIN users u ON a.author_id = u.id
    WHERE a.category_id = ? AND a.id != ? AND a.status = 'published'
    ORDER BY a.published_at DESC LIMIT 3
  `).all(article.category_id, article.id)) as any[];

  // Parse sources
  let sources: Array<{ title: string; url: string }> = [];
  try {
    if (article.sources_json) {
      sources = JSON.parse(article.sources_json);
    }
  } catch {}

  const articleUrl = `https://blogfilipem2.site/artigo/${article.slug}`;

  // Schema.org Structured Data (NewsArticle + BreadcrumbList)
  const schemaArticle = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl
    },
    headline: article.title,
    description: article.excerpt || article.subtitle,
    image: [article.cover_image || 'https://blogfilipem2.site/logo.svg'],
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: {
      '@type': 'Person',
      name: article.author_name || 'Redação BLOG FILIPEM2'
    },
    publisher: {
      '@type': 'Organization',
      name: 'BLOG FILIPEM2',
      logo: {
        '@type': 'ImageObject',
        url: 'https://blogfilipem2.site/logo.svg'
      }
    }
  };

  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: 'https://blogfilipem2.site'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: article.category_name,
        item: `https://blogfilipem2.site/categoria/${article.category_slug}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: articleUrl
      }
    ]
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Schema.org Injections */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-neutral-400 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-white transition-colors">Início</Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
        <Link href={`/categoria/${article.category_slug}`} className="hover:text-white transition-colors">
          {article.category_name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
        <span className="text-neutral-500 truncate max-w-xs">{article.title}</span>
      </nav>

      {/* Article Header */}
      <header className="space-y-4">
        <Link
          href={`/categoria/${article.category_slug}`}
          className="inline-block px-3 py-1 rounded-md text-xs font-black tracking-wider uppercase text-white shadow-lg"
          style={{ backgroundColor: article.category_color || '#DC2626' }}
        >
          {article.category_name}
        </Link>

        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="text-lg sm:text-xl text-neutral-300 leading-relaxed font-normal">
            {article.subtitle}
          </p>
        )}

        {/* Author & Meta bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-y border-neutral-800 text-xs sm:text-sm text-neutral-400">
          <div className="flex items-center space-x-3">
            {article.author_avatar ? (
              <img
                src={article.author_avatar}
                alt={article.author_name}
                className="w-10 h-10 rounded-full object-cover border border-neutral-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="font-bold text-white block">{article.author_name}</span>
              <span className="text-xs text-neutral-500">Equipe Editorial BLOG FILIPEM2</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center gap-1.5" title="Data de publicação">
              <Calendar className="w-4 h-4 text-neutral-500" />
              {formatDateBR(article.published_at)}
            </span>
            <span className="flex items-center gap-1.5" title="Tempo estimado de leitura">
              <Clock className="w-4 h-4 text-neutral-500" />
              {article.reading_time || 5} min
            </span>
            <span className="flex items-center gap-1.5" title="Visualizações">
              <Eye className="w-4 h-4 text-neutral-500" />
              {article.views}
            </span>
          </div>
        </div>

        {/* Share buttons */}
        <ShareButtons title={article.title} url={articleUrl} />
      </header>

      {/* Cover Image */}
      {article.cover_image && (
        <figure className="space-y-2 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950">
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full max-h-[520px] object-cover"
          />
          {(article.cover_caption || article.cover_source) && (
            <figcaption className="px-4 py-2 text-xs text-neutral-400 flex flex-wrap justify-between items-center bg-neutral-900/60 border-t border-neutral-800">
              <span>{article.cover_caption}</span>
              {article.cover_source && (
                <span className="text-neutral-500 italic">
                  Fonte/Crédito: {article.cover_source}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      )}

      {/* Main Content Body */}
      <div className="article-content max-w-none">
        <div dangerouslySetInnerHTML={{ __html: formatArticleContent(article.content) }} />
      </div>

      {/* Updated at notice if modified */}
      {article.updated_at && article.updated_at !== article.published_at && (
        <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl flex items-center gap-2.5 text-xs text-neutral-400">
          <BookmarkCheck className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Nota de Atualização Editorial:</strong> Este artigo foi revisado e atualizado em {formatDateTimeBR(article.updated_at)}.
          </span>
        </div>
      )}

      {/* Tags Cloud */}
      {tags.length > 0 && (
        <div className="pt-6 border-t border-neutral-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Assuntos Relacionados
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Link
                key={t.id}
                href={`/tag/${t.slug}`}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
              >
                #{t.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sources and References (Section 8 requirement) */}
      {sources.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#14161f] border border-neutral-800 space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-red-500" />
            Fontes &amp; Referências Verificadas
          </h4>
          <ul className="space-y-1.5 text-xs text-neutral-300">
            {sources.map((src, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-400 underline flex items-center gap-1"
                >
                  <span>{src.title}</span>
                  <ExternalLink className="w-3 h-3 text-neutral-500" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Author Bio Box */}
      <div className="p-6 rounded-2xl bg-[#14161f] border border-neutral-800 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {article.author_avatar ? (
          <img
            src={article.author_avatar}
            alt={article.author_name}
            className="w-16 h-16 rounded-2xl object-cover border border-neutral-700 shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-neutral-800 flex items-center justify-center text-white shrink-0">
            <User className="w-8 h-8" />
          </div>
        )}
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h4 className="text-base font-bold text-white">{article.author_name}</h4>
            <span className="text-[10px] font-bold text-red-500 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60">
              Autor
            </span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {article.author_bio || 'Colunista e pesquisador no portal BLOG FILIPEM2, cobrindo o universo geek, produções audiovisuais e tecnologia.'}
          </p>
        </div>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-neutral-800">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            Leia Também no BLOG FILIPEM2
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((rel) => (
              <ArticleCard key={rel.id} article={rel} layout="standard" />
            ))}
          </div>
        </section>
      )}

      {/* Comments Section */}
      <CommentsSection
        articleId={article.id}
        allowComments={article.allow_comments === 1}
        initialComments={comments}
      />
    </article>
  );
}
