import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import ArticleCard from '@/components/ArticleCard';
import { ChevronRight, Gamepad2, Music, Film, Tv, Cpu, FolderOpen } from 'lucide-react';

export const revalidate = 0;

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const db = getDb();
  const category = db.prepare('SELECT * FROM categories WHERE slug = ?').get(params.slug) as any;

  if (!category) {
    return { title: 'Categoria não encontrada | BLOG FILIPEM2' };
  }

  return {
    title: `${category.name} — Notícias, Artigos e Análises`,
    description: category.description || `Confira as melhores notícias, análises e novidades sobre ${category.name} no BLOG FILIPEM2.`,
    alternates: {
      canonical: `https://blogfilipem2.com.br/categoria/${category.slug}`
    }
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const db = getDb();
  const category = db.prepare('SELECT * FROM categories WHERE slug = ?').get(params.slug) as any;

  if (!category) {
    notFound();
  }

  const articles = db.prepare(`
    SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
           u.name as author_name
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    JOIN users u ON a.author_id = u.id
    WHERE a.category_id = ? AND a.status = 'published'
    ORDER BY a.published_at DESC
  `).all(category.id) as any[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-white transition-colors">Início</Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
        <span className="text-neutral-500">Categorias</span>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
        <span className="text-white font-semibold">{category.name}</span>
      </nav>

      {/* Category Hero Banner */}
      <div
        className="rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-neutral-800 shadow-2xl"
        style={{
          background: `linear-gradient(135deg, #13151f 0%, #0c0d10 100%)`
        }}
      >
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: category.color || '#DC2626' }}
        />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center space-x-2.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category.color || '#DC2626' }}
            />
            <span className="text-xs font-black tracking-widest uppercase text-neutral-400">
              EDITORIAL EXCLUSIVO
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {category.name}
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            {category.description || `Fique por dentro de todas as publicações, resenhas e notícias da categoria ${category.name}.`}
          </p>

          <div className="pt-2 text-xs text-neutral-400 flex items-center gap-2">
            <span className="font-bold text-white">{articles.length}</span> artigo(s) publicado(s) nesta seção.
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[#12141c] border border-neutral-800 space-y-3">
          <FolderOpen className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Nenhum artigo publicado nesta categoria no momento</h3>
          <p className="text-xs text-neutral-400">Nossa equipe editorial está preparando conteúdos inéditos. Volte em breve!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <ArticleCard key={art.id} article={art} layout="standard" />
          ))}
        </div>
      )}
    </div>
  );
}
