import React from 'react';
import Link from 'next/link';
import { Clock, Eye, Calendar, ArrowUpRight } from 'lucide-react';
import { formatDateBR } from '@/lib/utils';

interface ArticleCardProps {
  article: {
    id: number;
    title: string;
    subtitle?: string;
    slug: string;
    excerpt?: string;
    cover_image?: string;
    category_name?: string;
    category_slug?: string;
    category_color?: string;
    published_at?: string;
    reading_time?: number;
    views?: number;
    author_name?: string;
  };
  layout?: 'standard' | 'horizontal' | 'compact' | 'featured';
}

export default function ArticleCard({ article, layout = 'standard' }: ArticleCardProps) {
  const catColor = article.category_color || '#DC2626';

  if (layout === 'horizontal') {
    return (
      <article className="group flex flex-col sm:flex-row gap-4 p-3 sm:p-4 rounded-2xl bg-[#14161f] border border-neutral-800/80 hover:border-neutral-700 transition-all duration-300">
        <Link
          href={`/artigo/${article.slug}`}
          className="sm:w-5/12 h-44 sm:h-auto rounded-xl overflow-hidden relative shrink-0 bg-neutral-900 block"
        >
          {article.cover_image ? (
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-600">
              Sem Imagem
            </div>
          )}
          {article.category_name && (
            <span
              className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[11px] font-bold text-white shadow-md"
              style={{ backgroundColor: catColor }}
            >
              {article.category_name}
            </span>
          )}
        </Link>

        <div className="flex-1 flex flex-col justify-between py-1">
          <div className="space-y-2">
            <div className="flex items-center space-x-3 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDateBR(article.published_at)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.reading_time || 5} min de leitura
              </span>
            </div>
            <Link href={`/artigo/${article.slug}`}>
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                {article.title}
              </h3>
            </Link>
            {article.excerpt && (
              <p className="text-xs sm:text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-neutral-800/60 text-xs text-neutral-500">
            <span>Por <strong className="text-neutral-300">{article.author_name || 'Redação'}</strong></span>
            <Link
              href={`/artigo/${article.slug}`}
              className="inline-flex items-center gap-1 text-red-500 font-semibold group-hover:translate-x-0.5 transition-transform"
            >
              Ler matéria <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // Standard Card
  return (
    <article className="group flex flex-col rounded-2xl bg-[#14161f] border border-neutral-800/80 hover:border-neutral-700 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
      <Link
        href={`/artigo/${article.slug}`}
        className="w-full h-48 sm:h-52 overflow-hidden relative bg-neutral-900 block"
      >
        {article.cover_image ? (
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-600">
            Sem Imagem
          </div>
        )}
        {article.category_name && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-bold text-white shadow-md uppercase tracking-wider"
            style={{ backgroundColor: catColor }}
          >
            {article.category_name}
          </span>
        )}
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-[11px] text-neutral-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateBR(article.published_at)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.reading_time || 5} min
            </span>
            {article.views !== undefined && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {article.views}
                </span>
              </>
            )}
          </div>

          <Link href={`/artigo/${article.slug}`}>
            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
              {article.title}
            </h3>
          </Link>

          {article.excerpt && (
            <p className="text-xs sm:text-sm text-neutral-400 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-neutral-800/60 text-xs text-neutral-400">
          <span>Por <strong className="text-neutral-300">{article.author_name || 'Redação'}</strong></span>
          <Link
            href={`/artigo/${article.slug}`}
            className="text-red-500 font-semibold group-hover:text-red-400 flex items-center gap-1"
          >
            Acessar <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
