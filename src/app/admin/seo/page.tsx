'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Save, CheckCircle2, AlertCircle, Loader2, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminSeoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // SEO Fields
  const [siteTitle, setSiteTitle] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [robotsTxt, setRobotsTxt] = useState('');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [googleSearchConsoleTag, setGoogleSearchConsoleTag] = useState('');

  useEffect(() => {
    loadSeoSettings();
  }, []);

  const loadSeoSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSiteTitle(data.site_title || 'BLOG FILIPEM2');
      setSiteDescription(data.site_description || '');
      setSiteUrl(data.site_url || 'https://blogfilipem2.com.br');
      setRobotsTxt(data.robots_txt_content || `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://blogfilipem2.com.br/sitemap.xml`);
      setGoogleAnalyticsId(data.google_analytics_id || '');
      setGoogleSearchConsoleTag(data.google_search_console_tag || '');
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
      site_title: siteTitle,
      site_description: siteDescription,
      site_url: siteUrl,
      robots_txt_content: robotsTxt,
      google_analytics_id: googleAnalyticsId,
      google_search_console_tag: googleSearchConsoleTag
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Erro ao salvar configurações de SEO.');

      setNotification({ type: 'success', text: 'Configurações de SEO e arquivo robots.txt atualizados!' });
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
        <span className="text-xs text-neutral-400">Carregando painel de SEO...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Globe className="w-7 h-7 text-red-500" />
            <span>SEO, Indexação &amp; Google</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Configuração técnica para mecanismos de busca, Schema.org, Sitemap XML e Robots.txt.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Salvar Configurações</span>
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

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Sitemap XML</span>
            <span className="text-emerald-400 font-bold text-xs bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
              ATIVO
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Atualizado dinamicamente a cada novo artigo publicado no portal.
          </p>
          <a
            href="/sitemap.xml"
            target="_blank"
            className="text-xs text-red-500 hover:text-red-400 font-semibold inline-flex items-center gap-1 pt-1"
          >
            <span>Visualizar /sitemap.xml</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Robots.txt</span>
            <span className="text-emerald-400 font-bold text-xs bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
              CONFIGURADO
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Instrui bots de busca a indexarem matérias e protegerem a área restrita.
          </p>
          <a
            href="/robots.txt"
            target="_blank"
            className="text-xs text-red-500 hover:text-red-400 font-semibold inline-flex items-center gap-1 pt-1"
          >
            <span>Visualizar /robots.txt</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Dados Estruturados</span>
            <span className="text-emerald-400 font-bold text-xs bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
              SCHEMA.ORG
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            JSON-LD para NewsArticle, WebSite, Breadcrumbs e Organization integrados.
          </p>
          <span className="text-[11px] text-neutral-500 block pt-1">
            Compatível com Rich Snippets do Google
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General SEO */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
            Identidade de SEO do Portal
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Título Padrão do Site (Default Title)</label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Descrição Geral do Portal (Meta Description)</label>
              <textarea
                rows={3}
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">URL Canônica Base (Domínio Oficial)</label>
              <input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://blogfilipem2.com.br"
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Analytics & Search Console */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
            Integrações com Google &amp; Métricas
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Google Search Console (Tag de Verificação HTML)
              </label>
              <input
                type="text"
                value={googleSearchConsoleTag}
                onChange={(e) => setGoogleSearchConsoleTag(e.target.value)}
                placeholder="Ex: google-site-verification=..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500"
              />
              <span className="text-[11px] text-neutral-500 mt-0.5 block">
                Insira o código fornecido pelo Search Console para validar a propriedade do domínio.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Google Analytics 4 (Measurement ID)
              </label>
              <input
                type="text"
                value={googleAnalyticsId}
                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Robots.txt Full Editor */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Editor do Arquivo Robots.txt
              </h3>
              <p className="text-[11px] text-neutral-400">
                Altere regras de rastreamento de mecanismos de busca em tempo real.
              </p>
            </div>
          </div>

          <textarea
            rows={6}
            value={robotsTxt}
            onChange={(e) => setRobotsTxt(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500 leading-relaxed"
          />
        </div>
      </form>
    </div>
  );
}
