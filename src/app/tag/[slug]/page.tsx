import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import ArticleCard from '@/components/ArticleCard';
import { ChevronRight, Tag } from 'lucide-react';

export const revalidate = 0;

interface TagPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const db = getDb();
  const tag = db.prepare('SELECT * FROM tags WHERE slug = ?').get(params.slug) as any;

  if (!tag) {
    return { title: 'Tag não encontrada | BLOG FILIPEM2' };
  }

  return {
    title: `Artigos sobre #${tag.name} | BLOG FILIPEM2`,
    description: `Confira todos os artigos, notícias e análises marcados com a tag #${tag.name} no BLOG FILIPEM2.`
  };
}

export default function TagPage({ params }: TagPageProps) {
  const db = getDb();
  const tag = db.prepare('SELECT * FROM tags WHERE slug = ?').get(params.slug) as any;

  if (!tag) {
    notFound();
  }

  const articles = db.prepare(`
    SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
           u.name as author_name
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    JOIN users u ON a.author_id = u.id
    JOIN article_tags at ON a.id = at.article_id
    WHERE at.tag_id = ? AND a.status = 'published'
    ORDER BY a.published_at DESC
  `).all(tag.id) as any[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <nav className="flex items-center space-x-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-white transition-colors">Início</Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
        <span className="text-neutral-500">Tags</span>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
        <span className="text-white font-semibold">#{tag.name}</span>
      </nav>

      <div className="rounded-3xl p-8 sm:p-10 bg-[#13151f] border border-neutral-800 flex items-center gap-4">
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-500">
          <Tag className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs font-black tracking-widest uppercase text-neutral-400">
            Tópico de Cobertura
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            #{tag.name}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {articles.length} artigo(s) com este tema.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((art) => (
          <ArticleCard key={art.id} article={art} layout="standard" />
        ))}
      </div>
    </div>
  );
}
