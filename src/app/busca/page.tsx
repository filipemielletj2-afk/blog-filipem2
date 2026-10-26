import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import ArticleCard from '@/components/ArticleCard';
import { Search, ChevronRight, FolderSearch } from 'lucide-react';

export const revalidate = 0;

interface SearchPageProps {
  searchParams: { q?: string; categoria?: string };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || '';
  return {
    title: query ? `Resultados de busca para "${query}" | BLOG FILIPEM2` : 'Pesquisa | BLOG FILIPEM2',
    description: `Resultados da busca por ${query} no BLOG FILIPEM2.`
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const catSlug = searchParams.categoria || '';
  const db = getDb();

  let articles: any[] = [];
  if (query.trim()) {
    let sql = `
      SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
             u.name as author_name
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      JOIN users u ON a.author_id = u.id
      WHERE a.status = 'published' AND (a.title LIKE ? OR a.excerpt LIKE ? OR a.content LIKE ?)
    `;
    const params: any[] = [`%${query}%`, `%${query}%`, `%${query}%`];

    if (catSlug) {
      sql += ` AND c.slug = ?`;
      params.push(catSlug);
    }

    sql += ` ORDER BY a.published_at DESC LIMIT 30`;
    articles = db.prepare(sql).all(...params);
  }

  const categories = db.prepare('SELECT name, slug FROM categories ORDER BY name ASC').all() as any[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-white transition-colors">Início</Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
        <span className="text-white font-semibold">Pesquisa</span>
      </nav>

      {/* Search Header Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#13151f] border border-neutral-800 space-y-4">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
          <Search className="w-6 h-6 text-red-500" />
          Busca Geral no Portal
        </h1>

        <form action="/busca" method="GET" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Digite o que deseja buscar..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <select
            name="categoria"
            defaultValue={catSlug}
            className="px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-red-500"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
          >
            Buscar
          </button>
        </form>

        {query && (
          <p className="text-xs text-neutral-400">
            Exibindo <strong className="text-white">{articles.length}</strong> resultado(s) para &quot;<span className="text-red-400 font-semibold">{query}</span>&quot;
          </p>
        )}
      </div>

      {/* Results */}
      {query && articles.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[#12141c] border border-neutral-800 space-y-3">
          <FolderSearch className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Nenhum resultado encontrado</h3>
          <p className="text-xs text-neutral-400">Tente buscar por termos mais genéricos ou verifique se a ortografia está correta.</p>
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
