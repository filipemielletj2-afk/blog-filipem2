'use client';

import React, { useState, useEffect } from 'react';
import { Tags, Plus, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tags');
      const data = await res.json();
      setTags(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });

      if (!res.ok) throw new Error('Falha ao adicionar tag.');

      setName('');
      setNotification({ type: 'success', text: 'Tag cadastrada com sucesso!' });
      loadTags();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Tags className="w-7 h-7 text-red-500" />
          <span>Tags &amp; Tópicos de Artigos</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Palavras-chave e assuntos que conectam artigos relacionados em todo o portal.
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
          <span>{notification.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Add Tag Form */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#12141c] border border-neutral-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
            Adicionar Nova Tag
          </h3>

          <form onSubmit={handleAddTag} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome da Tag</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: PlayStation 5, K-pop, Unreal Engine 5..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Tag</span>
            </button>
          </form>
        </div>

        {/* Tags List */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#12141c] border border-neutral-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
            Tags Existentes ({tags.length})
          </h3>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
              <span className="text-xs text-neutral-400">Carregando tags...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {tags.map((t) => (
                <div
                  key={t.id}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2 hover:border-neutral-700 transition-colors"
                >
                  <span className="font-semibold text-white">#{t.name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-mono text-neutral-400">
                    {t.count || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
