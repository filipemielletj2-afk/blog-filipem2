import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import {
  FileText,
  Eye,
  MessageSquare,
  FolderTree,
  Plus,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Globe,
  Clock,
  Sparkles
} from 'lucide-react';
import { formatDateBR } from '@/lib/utils';

export const revalidate = 0;

export default function AdminDashboardPage() {
  const db = getDb();

  const totalArticles = db.prepare('SELECT COUNT(*) as count FROM articles').get() as { count: number };
  const publishedArticles = db.prepare("SELECT COUNT(*) as count FROM articles WHERE status = 'published'").get() as { count: number };
  const totalViews = db.prepare('SELECT SUM(views) as total FROM articles').get() as { total: number };
  const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  const totalComments = db.prepare('SELECT COUNT(*) as count FROM comments').get() as { count: number };
  const pendingComments = db.prepare("SELECT COUNT(*) as count FROM comments WHERE status = 'pending'").get() as { count: number };

  const recentArticles = db.prepare(`
    SELECT a.id, a.title, a.slug, a.status, a.published_at, a.views, c.name as category_name, c.color as category_color
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    ORDER BY a.created_at DESC LIMIT 5
  `).all() as any[];

  const recentComments = db.prepare(`
    SELECT c.*, a.title as article_title, a.slug as article_slug
    FROM comments c
    JOIN articles a ON c.article_id = a.id
    ORDER BY c.created_at DESC LIMIT 4
  `).all() as any[];

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Visão Geral do Portal</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400">
              SISTEMA ATIVO
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Controle total sobre publicações, layout visual, métricas e comunidade do BLOG FILIPEM2.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/artigos/novo"
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Artigo</span>
          </Link>
          <Link
            href="/admin/builder"
            className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
          >
            <Layers className="w-4 h-4 text-red-500" />
            <span>Editor Visual</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-[#12141c] border border-neutral-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total de Artigos</span>
            <div className="p-2 rounded-xl bg-red-950/60 border border-red-800/60 text-red-500">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{totalArticles.count}</div>
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <span className="font-semibold text-emerald-400">{publishedArticles.count}</span> publicados no ar
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#12141c] border border-neutral-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total de Leituras</span>
            <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-500">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{totalViews.total || 0}</div>
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <span>Visualizações consolidadas</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#12141c] border border-neutral-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Categorias Ativas</span>
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-500">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{totalCategories.count}</div>
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <span>Games, Música, Filmes, Séries, Geek</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#12141c] border border-neutral-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Comentários</span>
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-500">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{totalComments.count}</div>
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <span className="font-semibold text-amber-400">{pendingComments.count}</span> pendentes de moderação
          </div>
        </div>
      </div>

      {/* Grid: Recent Articles & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Articles */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#12141c] border border-neutral-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-500" />
              Artigos Recentes
            </h3>
            <Link
              href="/admin/artigos"
              className="text-xs text-red-500 hover:text-red-400 font-semibold flex items-center gap-1"
            >
              <span>Gerenciar todos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Título</th>
                  <th className="pb-3">Categoria</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Views</th>
                  <th className="pb-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {recentArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 pr-4 font-semibold text-white max-w-xs truncate">
                      {art.title}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className="px-2 py-0.5 rounded font-semibold text-[11px]"
                        style={{ backgroundColor: `${art.category_color}22`, color: art.category_color }}
                      >
                        {art.category_name}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                          art.status === 'published'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        {art.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-neutral-400 font-mono">
                      {art.views}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/admin/artigos/${art.id}/editar`}
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-[11px] transition-colors"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Health & Fast Tools */}
        <div className="lg:col-span-4 space-y-6">
          {/* SEO & Checklist Card */}
          <div className="p-6 rounded-3xl bg-[#12141c] border border-neutral-800 shadow-xl space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Checklist de Boas Práticas
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-300">Sitemap XML Automático</span>
                <span className="text-emerald-400 font-bold">100% Ativo</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-300">Robots.txt Indexável</span>
                <span className="text-emerald-400 font-bold">Ativo</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-300">Schema.org JSON-LD</span>
                <span className="text-emerald-400 font-bold">Injetado</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-300">Conformidade LGPD</span>
                <span className="text-emerald-400 font-bold">Banner Ativo</span>
              </div>
            </div>

            <Link
              href="/admin/seo"
              className="w-full py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-800 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Configurar SEO &amp; Indexação</span>
            </Link>
          </div>

          {/* Quick Page Builder Shortcut */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-red-950/40 to-[#12141c] border border-red-900/40 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-red-500">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Construtor de Páginas</span>
            </div>
            <h4 className="text-base font-bold text-white">
              Personalize a Home Sem Programar
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Altere blocos de destaque, carrosséis de games, vídeos e banners através do editor visual em tempo real.
            </p>
            <Link
              href="/admin/builder"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-600/30"
            >
              <span>Abrir Editor Visual</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
