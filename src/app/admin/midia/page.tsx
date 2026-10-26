'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Copy,
  Trash2,
  Check,
  Loader2,
  FileText,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [altText, setAltText] = useState('');
  const [credit, setCredit] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadMedia();
  }, [search]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      let url = '/api/media';
      if (search) url += `?search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();
      setMediaList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setNotification(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt_text', altText);
    formData.append('credit', credit);

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar imagem.');

      setNotification({ type: 'success', text: `Imagem "${file.name}" enviada com sucesso!` });
      setAltText('');
      setCredit('');
      loadMedia();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir esta imagem da biblioteca?')) return;

    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir mídia.');
      setMediaList(mediaList.filter((m) => m.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <ImageIcon className="w-7 h-7 text-red-500" />
          <span>Biblioteca de Mídia &amp; Uploads</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Faça upload seguro de imagens, consulte links diretos e gerencie créditos de direitos autorais.
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

      {/* Upload Box */}
      <div className="p-6 rounded-2xl bg-[#12141c] border border-dashed border-neutral-700 hover:border-red-500 transition-colors">
        <div className="max-w-xl mx-auto space-y-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-red-950/80 border border-red-800 text-red-500 flex items-center justify-center">
            {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {uploading ? 'Processando e salvando imagem...' : 'Fazer Upload de Nova Imagem'}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Formatos aceitos: JPG, PNG, WebP, GIF, SVG, AVIF (Máximo de 10MB)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Texto Alternativo (Alt Text para Acessibilidade/SEO)</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Ex: Personagem segurando espada futurista..."
                className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Crédito / Licença da Imagem</label>
              <input
                type="text"
                value={credit}
                onChange={(e) => setCredit(e.target.value)}
                placeholder="Ex: Foto por João / Divulgação"
                className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-red-600/30 transition-all">
              <Upload className="w-4 h-4" />
              <span>Selecionar Arquivo no Computador</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Arquivos Armazenados ({mediaList.length})
          </h3>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou crédito..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
            <span className="text-xs text-neutral-400">Carregando mídia...</span>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#12141c] border border-neutral-800 text-neutral-500 text-xs">
            Nenhuma imagem enviada ainda. Faça o primeiro upload acima!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaList.map((m) => (
              <div
                key={m.id}
                className="group p-2 rounded-2xl bg-[#12141c] border border-neutral-800 hover:border-neutral-700 flex flex-col justify-between space-y-2"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-black relative">
                  <img src={m.url} alt={m.alt_text || m.original_name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block truncate" title={m.original_name}>
                    {m.original_name}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">
                    {(m.size / 1024).toFixed(0)} KB • {m.mime_type.split('/')[1]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
                  <button
                    onClick={() => handleCopyUrl(m.url, m.id)}
                    className="p-1 text-neutral-400 hover:text-white rounded"
                    title="Copiar link"
                  >
                    {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1 text-neutral-400 hover:text-red-400 rounded"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
