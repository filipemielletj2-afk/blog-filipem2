'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Check, X, ShieldAlert, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { formatDateBR } from '@/lib/utils';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [statusFilter]);

  const loadComments = async () => {
    setLoading(true);
    try {
      let url = '/api/comments';
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setComments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setComments(comments.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir permanentemente este comentário?')) return;
    try {
      await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      setComments(comments.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-red-500" />
            <span>Moderação de Comentários</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Mantenha o ambiente saudável e livre de spam ou conteúdos impróprios.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
        >
          <option value="">Todos os Comentários</option>
          <option value="pending">Apenas Pendentes</option>
          <option value="approved">Apenas Aprovados</option>
          <option value="spam">Marcados como Spam</option>
        </select>
      </div>

      <div className="rounded-2xl bg-[#12141c] border border-neutral-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <span className="text-xs text-neutral-400">Carregando comentários...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <AlertCircle className="w-10 h-10 text-neutral-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">Nenhum comentário na fila</h3>
            <p className="text-xs text-neutral-500">Tudo limpo e sob controle!</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/60">
            {comments.map((c) => (
              <div key={c.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-neutral-800/30 transition-colors">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 text-xs">
                    <strong className="text-white">{c.author_name}</strong>
                    <span className="text-neutral-500 font-mono text-[11px]">({c.author_email})</span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-neutral-500">{formatDateBR(c.created_at)}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                        c.status === 'approved'
                          ? 'bg-emerald-950/80 text-emerald-400'
                          : c.status === 'pending'
                          ? 'bg-amber-950/80 text-amber-400'
                          : 'bg-red-950/80 text-red-400'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                    {c.content}
                  </p>

                  <div className="text-[11px] text-neutral-500">
                    Artigo:{' '}
                    <Link href={`/artigo/${c.article_slug}`} target="_blank" className="text-red-400 hover:underline">
                      {c.article_title}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-start pt-2 sm:pt-0">
                  {c.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'approved')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 text-xs font-bold flex items-center gap-1"
                      title="Aprovar comentário"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aprovar</span>
                    </button>
                  )}

                  {c.status !== 'spam' && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'spam')}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white text-xs font-semibold flex items-center gap-1"
                      title="Marcar como spam"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Spam</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800"
                    title="Excluir permanentemente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
