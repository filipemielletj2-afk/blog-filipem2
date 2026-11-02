'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ListFilter
} from 'lucide-react';
import { formatDateBR } from '@/lib/utils';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number | 'all'>(100);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [search, selectedCategory, selectedStatus, page, limit]);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      let url = `/api/articles?page=${page}&limit=${limit}&sort=newest`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedStatus) url += `&status=${encodeURIComponent(selectedStatus)}`;

      const res = await fetch(url);
      const data = await res.json();
      setArticles(data.articles || []);
      if (data.pagination) {
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir permanentemente o artigo "${title}"?`)) return;

    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir artigo.');
      setArticles(articles.filter((a) => a.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startItem = articles.length > 0 ? (limit === 'all' ? 1 : (page - 1) * limit + 1) : 0;
  const endItem = limit === 'all' ? total : Math.min(page * (limit as number), total);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-red-500" />
            <span>Gerenciador de Artigos &amp; Publicações</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Crie, edite, organize e acompanhe todas as matérias jornalísticas do portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#12141c] border border-neutral-800 text-xs font-semibold text-neutral-300">
            Total:{' '}
            <span className="text-red-400 font-bold font-mono text-sm ml-1">{total}</span>{' '}
            {total === 1 ? 'artigo' : 'artigos'}
          </div>
          <Link
            href="/admin/artigos/novo"
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Artigo</span>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#12141c] border border-neutral-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por título ou trecho..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
          >
            <option value="">Todos os Status</option>
            <option value="published">Publicados</option>
            <option value="draft">Rascunhos</option>
            <option value="scheduled">Agendados</option>
          </select>

          <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-800">
            <span className="text-[11px] text-neutral-400 font-medium">Exibir:</span>
            <select
              value={limit.toString()}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10);
                setLimit(val as any);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs font-semibold focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="25">25 por pág.</option>
              <option value="50">50 por pág.</option>
              <option value="100">100 por pág.</option>
              <option value="all">Todos ({total})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="rounded-2xl bg-[#12141c] border border-neutral-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <span className="text-xs text-neutral-400">Carregando artigos...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <AlertCircle className="w-10 h-10 text-neutral-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">Nenhum artigo encontrado</h3>
            <p className="text-xs text-neutral-500">Tente alterar os filtros ou publique um novo artigo.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#161822] border-b border-neutral-800 text-neutral-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Artigo</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Autor</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Visualizações</th>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {articles.map((art) => (
                    <tr key={art.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3 max-w-md">
                          {art.cover_image && (
                            <img
                              src={art.cover_image}
                              alt={art.title}
                              className="w-12 h-12 rounded-lg object-cover bg-neutral-900 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/admin/artigos/${art.id}/editar`}
                              className="font-bold text-white hover:text-red-400 transition-colors line-clamp-1"
                            >
                              {art.title}
                            </Link>
                            <span className="text-[11px] text-neutral-500 block truncate">
                              /artigo/{art.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className="px-2.5 py-1 rounded font-semibold text-[11px]"
                          style={{ backgroundColor: `${art.category_color}22`, color: art.category_color }}
                        >
                          {art.category_name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-300">
                        {art.author_name}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            art.status === 'published'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                              : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                          }`}
                        >
                          {art.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-400 font-mono">
                        {art.views || 0}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-400">
                        {formatDateBR(art.published_at)}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/artigo/${art.slug}`}
                            target="_blank"
                            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                            title="Ver no site ao vivo"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/artigos/${art.id}/editar`}
                            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                            title="Editar matéria"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(art.id, art.title)}
                            className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800"
                            title="Excluir matéria"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {total > 0 && (
              <div className="p-4 bg-[#141622] border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <span>
                    Exibindo <strong className="text-white">{startItem}</strong> a{' '}
                    <strong className="text-white">{endItem}</strong> de{' '}
                    <strong className="text-white">{total}</strong> artigos
                  </span>
                  {limit === 'all' && (
                    <span className="text-[10px] bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                      TODOS OS ARTIGOS NA TELA
                    </span>
                  )}
                </div>

                {limit !== 'all' && totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold transition-all"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Anterior</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            p === page
                              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                              : 'bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold transition-all"
                    >
                      <span>Próxima</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}