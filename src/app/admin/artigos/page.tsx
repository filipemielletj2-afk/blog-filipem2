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
  AlertCircle
} from 'lucide-react';
import { formatDateBR } from '@/lib/utils';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [search, selectedCategory, selectedStatus, pagination.page]);

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
      let url = `/api/articles?page=${pagination.page}&limit=${pagination.limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedStatus) url += `&status=${encodeURIComponent(selectedStatus)}`;

      const res = await fetch(url);
      const data = await res.json();
      setArticles(data.articles || []);
      setPagination(data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
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
    } catch (err: any) {
      alert(err.message);
    }
  };

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

        <Link
          href="/admin/artigos/novo"
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Artigo</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#12141c] border border-neutral-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou trecho..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
          >
            <option value="">Todos os Status</option>
            <option value="published">Publicados</option>
            <option value="draft">Rascunhos</option>
            <option value="scheduled">Agendados</option>
          </select>
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
        )}
      </div>
    </div>
  );
}
