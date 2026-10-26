'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Save, CheckCircle2, AlertCircle, Loader2, Sparkles, Code } from 'lucide-react';

export default function AdminAdsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Ad slot states
  const [adHeaderEnabled, setAdHeaderEnabled] = useState(false);
  const [adHeaderCode, setAdHeaderCode] = useState('');

  const [adSidebarEnabled, setAdSidebarEnabled] = useState(true);
  const [adSidebarCode, setAdSidebarCode] = useState('');

  const [adArticleEnabled, setAdArticleEnabled] = useState(true);
  const [adArticleCode, setAdArticleCode] = useState('');

  const [adFooterEnabled, setAdFooterEnabled] = useState(false);
  const [adFooterCode, setAdFooterCode] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setAdHeaderEnabled(data.ad_header_enabled === '1');
      setAdHeaderCode(data.ad_header_code || '');
      setAdSidebarEnabled(data.ad_sidebar_enabled === '1');
      setAdSidebarCode(data.ad_sidebar_code || '');
      setAdArticleEnabled(data.ad_article_enabled === '1');
      setAdArticleCode(data.ad_article_code || '');
      setAdFooterEnabled(data.ad_footer_enabled === '1');
      setAdFooterCode(data.ad_footer_code || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    const payload = {
      ad_header_enabled: adHeaderEnabled ? '1' : '0',
      ad_header_code: adHeaderCode,
      ad_sidebar_enabled: adSidebarEnabled ? '1' : '0',
      ad_sidebar_code: adSidebarCode,
      ad_article_enabled: adArticleEnabled ? '1' : '0',
      ad_article_code: adArticleCode,
      ad_footer_enabled: adFooterEnabled ? '1' : '0',
      ad_footer_code: adFooterCode
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Erro ao salvar espaços publicitários.');

      setNotification({ type: 'success', text: 'Espaços publicitários e monetização atualizados no site!' });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        <span className="text-xs text-neutral-400">Carregando painel de publicidade...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-7 h-7 text-red-500" />
            <span>Publicidade &amp; Monetização</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Configure banners, Google AdSense, publieditoriais ou links afiliados em locais estratégicos do site.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Salvar Espaços</span>
        </button>
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

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slot 1: Header Ad */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-white">Banner Superior (Cabeçalho)</h3>
              <p className="text-[11px] text-neutral-400">Exibido no topo de todas as páginas</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={adHeaderEnabled}
                onChange={(e) => setAdHeaderEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Código HTML / Script do Anúncio (Google AdSense ou Imagem)
            </label>
            <textarea
              rows={4}
              value={adHeaderCode}
              onChange={(e) => setAdHeaderCode(e.target.value)}
              placeholder="<script async src='https://pagead2.googlesyndication.com...'></script> ou <a href='...'><img src='...' /></a>"
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Slot 2: Sidebar Ad */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-white">Banner da Barra Lateral (Sidebar)</h3>
              <p className="text-[11px] text-neutral-400">Dimensão ideal: 300x250 (Retângulo Médio)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={adSidebarEnabled}
                onChange={(e) => setAdSidebarEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Código HTML / Script do Anúncio
            </label>
            <textarea
              rows={4}
              value={adSidebarCode}
              onChange={(e) => setAdSidebarCode(e.target.value)}
              placeholder="Cole aqui o código do anúncio lateral..."
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Slot 3: In-Article Ad */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-white">Anúncio Dentro dos Artigos</h3>
              <p className="text-[11px] text-neutral-400">Posicionado no meio da leitura do texto</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={adArticleEnabled}
                onChange={(e) => setAdArticleEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Código HTML / Script do Anúncio
            </label>
            <textarea
              rows={4}
              value={adArticleCode}
              onChange={(e) => setAdArticleCode(e.target.value)}
              placeholder="Cole aqui o código do banner in-article..."
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Slot 4: Footer Ad */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-white">Banner Inferior (Rodapé)</h3>
              <p className="text-[11px] text-neutral-400">Exibido antes do rodapé de encerramento</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={adFooterEnabled}
                onChange={(e) => setAdFooterEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Código HTML / Script do Anúncio
            </label>
            <textarea
              rows={4}
              value={adFooterCode}
              onChange={(e) => setAdFooterCode(e.target.value)}
              placeholder="Cole aqui o código do banner de rodapé..."
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
