'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Search,
  Check,
  Clock,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

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
      setSiteUrl(data.site_url || 'https://blogfilipem2.site');
      setRobotsTxt(data.robots_txt_content || `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://blogfilipem2.site/sitemap.xml`);
      setGoogleAnalyticsId(data.google_analytics_id || '');
      setGoogleSearchConsoleTag(data.google_search_console_tag || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cleanGoogleTag = (val: string) => {
    if (!val) return '';
    const match = val.match(/content=["']([^"']+)["']/i);
    if (match && match[1]) return match[1].trim();
    return val.replace(/<[^>]*>/g, '').replace(/["']/g, '').trim();
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
      google_analytics_id: googleAnalyticsId.trim(),
      google_search_console_tag: cleanGoogleTag(googleSearchConsoleTag)
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

      {/* GOOGLE SEARCH FAVICON & BRAND LOGO STATUS */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#131622] via-[#0f1118] to-[#0a0b10] border border-neutral-800 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Logo &amp; Ícone nos Resultados do Google (Favicon Search)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  ARQUIVOS ATIVOS
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Como seu site é exibido nos resultados de busca do Google e status dos arquivos de favicon.
              </p>
            </div>
          </div>

          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-200 text-xs font-bold inline-flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <span>Abrir Google Search Console</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </a>
        </div>

        {/* Live Search Snippet Simulator */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
            Prévia de Exibição no Google (Após Atualização do Cache):
          </span>
          <div className="p-4 sm:p-5 rounded-2xl bg-[#1c1e29]/70 border border-neutral-800 max-w-2xl font-sans">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white p-0.5 flex items-center justify-center shrink-0 shadow">
                <img
                  src="/icon-48x48.png"
                  alt="Logo FILIPEM2"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-white truncate">blogfilipem2.site</div>
                <div className="text-[11px] text-neutral-400 truncate">https://blogfilipem2.site</div>
              </div>
            </div>

            <div className="mt-2.5">
              <h4 className="text-[17px] font-semibold text-[#c58af9] hover:underline cursor-pointer leading-snug">
                {siteTitle} | O Portal Definitivo de Games, Séries e Cultura Geek
              </h4>
              <p className="text-[13px] text-neutral-300 mt-1 line-clamp-2 leading-relaxed">
                {siteDescription || 'Portal independente e profissional de jornalismo, análises e tendências sobre games, músicas, filmes, séries, tecnologia e cultura geek.'}
              </p>
            </div>
          </div>
        </div>

        {/* Technical Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Check className="w-4 h-4" />
              <span>favicon.ico</span>
            </div>
            <div className="text-[11px] text-neutral-400">Raiz 16/32/48px pronta</div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Check className="w-4 h-4" />
              <span>icon-48x48.png</span>
            </div>
            <div className="text-[11px] text-neutral-400">Exigido pelo Googlebot</div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Check className="w-4 h-4" />
              <span>icon-192x192.png</span>
            </div>
            <div className="text-[11px] text-neutral-400">Mobile &amp; Android HD</div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Check className="w-4 h-4" />
              <span>logo.png (512px)</span>
            </div>
            <div className="text-[11px] text-neutral-400">Schema.org Organização</div>
          </div>
        </div>

        {/* Cache explanation and tutorial */}
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200/90 space-y-2">
          <div className="font-bold text-amber-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Por que o Google ainda mostra o globo cinza?</span>
          </div>
          <p className="text-[12px] leading-relaxed text-amber-100/80">
            No resultado da pesquisa do Google, você pode notar que está escrito <strong>&quot;há 6 dias&quot;</strong>. Isso significa que o Google ainda está exibindo o resultado em memória cache gravado 6 dias atrás (antes dos ícones PNG/ICO serem criados). Todos os seus novos ícones já estão 100% ativos no servidor!
          </p>
          <div className="pt-1 text-[11px] text-amber-200 space-y-1">
            <span className="font-bold text-white block">Como acelerar a troca para o seu logo agora:</span>
            <ol className="list-decimal list-inside space-y-1 text-amber-100/90">
              <li>Acesse o <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="underline font-bold text-white">Google Search Console</a>.</li>
              <li>Cole <strong>https://blogfilipem2.site/</strong> na barra superior (&quot;Inspecione qualquer URL&quot;) e dê Enter.</li>
              <li>Clique no botão <strong>&quot;Solicitar Indexação&quot;</strong> para o Googlebot visitar o site e substituir o globo pelo seu logo!</li>
            </ol>
          </div>
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
                placeholder="https://blogfilipem2.site"
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
                onChange={(e) => setGoogleSearchConsoleTag(cleanGoogleTag(e.target.value))}
                placeholder="Cole a tag <meta ...> ou apenas o código"
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Você pode colar a tag inteira fornecida pelo Google (<code>&lt;meta name=&quot;google-site-verification&quot; content=&quot;...&quot; /&gt;</code>) ou apenas o código. O sistema formata automaticamente!
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
