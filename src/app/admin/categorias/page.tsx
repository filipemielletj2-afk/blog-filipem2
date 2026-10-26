'use client';

import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit3, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { slugify } from '@/lib/utils';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#DC2626');
  const [icon, setIcon] = useState('Gamepad2');
  const [sortOrder, setSortOrder] = useState(0);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setColor(cat.color || '#DC2626');
    setIcon(cat.icon || 'Gamepad2');
    setSortOrder(cat.sort_order || 0);
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setColor('#DC2626');
    setIcon('Gamepad2');
    setSortOrder(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    const payload = {
      name,
      slug: slug || slugify(name),
      description,
      color,
      icon,
      sort_order: sortOrder
    };

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar categoria.');

      setNotification({
        type: 'success',
        text: editingId ? 'Categoria atualizada com sucesso!' : 'Nova categoria criada com sucesso!'
      });
      handleCancel();
      loadCategories();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Deseja excluir a categoria "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao excluir categoria.');

      setNotification({ type: 'success', text: 'Categoria excluída com sucesso.' });
      loadCategories();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <FolderTree className="w-7 h-7 text-red-500" />
          <span>Categorias &amp; Subcategorias</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Estruture os temas principais do BLOG FILIPEM2 (Games, Músicas, Filmes, Séries, Geek).
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
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#12141c] border border-neutral-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
            {editingId ? 'Editar Categoria' : 'Criar Nova Categoria'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Nome da Categoria *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingId) setSlug(slugify(e.target.value));
                }}
                placeholder="Ex: Games, Cinema, Animes..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Slug / URL Amigável</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ex: games"
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Descrição</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Resumo do que os leitores encontrarão nesta seção..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Cor Temática</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-mono uppercase text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Ordem de Exibição</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all"
              >
                {editingId ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </div>
          </form>
        </div>

        {/* Categories List Column */}
        <div className="lg:col-span-7 rounded-2xl bg-[#12141c] border border-neutral-800 shadow-xl overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              <span className="text-xs text-neutral-400">Carregando categorias...</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#161822] border-b border-neutral-800 text-neutral-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Cor</th>
                  <th className="py-3 px-4">Nome &amp; Slug</th>
                  <th className="py-3 px-4">Artigos</th>
                  <th className="py-3 px-4">Ordem</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className="inline-block w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: c.color }}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <strong className="text-white block">{c.name}</strong>
                      <span className="text-[11px] text-neutral-500 font-mono">/categoria/{c.slug}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-neutral-300">
                        {c.article_count || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400">
                      {c.sort_order}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
