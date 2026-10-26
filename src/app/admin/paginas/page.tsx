'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileCode, Edit3, Eye, CheckCircle2, AlertCircle, Loader2, Save, X, ExternalLink } from 'lucide-react';

export default function AdminPagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      setPages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    setSaving(true);
    setNotification(null);

    try {
      const res = await fetch(`/api/pages/${editingPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingPage.title,
          content: editingPage.content,
          meta_title: editingPage.meta_title,
          meta_description: editingPage.meta_description
        })
      });

      if (!res.ok) throw new Error('Erro ao salvar página.');

      setNotification({ type: 'success', text: `Página "${editingPage.title}" atualizada com sucesso!` });
      setEditingPage(null);
      loadPages();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <FileCode className="w-7 h-7 text-red-500" />
          <span>Páginas Institucionais &amp; Políticas LGPD</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Edite livremente o conteúdo legal, termos de uso, políticas de privacidade e cookies do portal.
        </p>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
              : 'bg-red-950/80 border border-red-800 text-red-400'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Pages Table */}
      <div className="rounded-2xl bg-[#12141c] border border-neutral-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <span className="text-xs text-neutral-400">Carregando páginas...</span>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#161822] border-b border-neutral-800 text-neutral-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Página</th>
                <th className="py-3 px-4">URL / Rota</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <strong className="text-white block text-sm">{p.title}</strong>
                    <span className="text-[11px] text-neutral-500 line-clamp-1">{p.meta_description}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-neutral-400">
                    /{p.slug}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-neutral-900 border border-neutral-800 text-neutral-400">
                      {p.is_system ? 'Legal / Sistema' : 'Customizada'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/${p.slug}`}
                        target="_blank"
                        className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                        title="Ver no site"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setEditingPage({ ...p })}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar Texto</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Page Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-[#14161f] border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-red-500" />
                  Editar Página: {editingPage.title}
                </h3>
                <span className="text-xs text-neutral-500 font-mono">Rota: /{editingPage.slug}</span>
              </div>
              <button
                onClick={() => setEditingPage(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 flex-1 overflow-y-auto pr-1 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Título da Página</label>
                <input
                  type="text"
                  required
                  value={editingPage.title}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Conteúdo da Página (HTML / Texto Rico)</label>
                <textarea
                  rows={14}
                  required
                  value={editingPage.content}
                  onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Título SEO (Meta Title)</label>
                  <input
                    type="text"
                    value={editingPage.meta_title || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, meta_title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Descrição SEO (Meta Description)</label>
                  <input
                    type="text"
                    value={editingPage.meta_description || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, meta_description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
