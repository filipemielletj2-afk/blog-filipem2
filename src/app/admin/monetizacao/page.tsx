'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Code,
  DollarSign,
  FileText,
  ExternalLink,
  HelpCircle,
  ShoppingBag,
  Globe,
  Flame,
  Copy,
  Check,
  Tag
} from 'lucide-react';

export default function AdminMonetizacaoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Google AdSense auto ads state
  const [googleAdsenseId, setGoogleAdsenseId] = useState('');
  const [adsTxt, setAdsTxt] = useState('');

  // Amazon Associates state
  const [amazonAffiliateTag, setAmazonAffiliateTag] = useState('blogfilipem2-20');
  const [amazonBoxEnabled, setAmazonBoxEnabled] = useState(true);
  const [amazonQuery, setAmazonQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

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
      setGoogleAdsenseId(data.google_adsense_id || '');
      setAdsTxt(data.ads_txt || '');
      setAmazonAffiliateTag(data.amazon_affiliate_tag || 'blogfilipem2-20');
      setAmazonBoxEnabled(data.amazon_box_enabled !== '0');
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

    // Clean Google AdSense ID if user typed ca-pub or just numbers
    let cleanedAdsense = googleAdsenseId.trim();
    if (cleanedAdsense && !cleanedAdsense.startsWith('ca-pub-') && cleanedAdsense.startsWith('pub-')) {
      cleanedAdsense = 'ca-' + cleanedAdsense;
    }

    const payload = {
      google_adsense_id: cleanedAdsense,
      ads_txt: adsTxt,
      amazon_affiliate_tag: amazonAffiliateTag.trim() || 'blogfilipem2-20',
      amazon_box_enabled: amazonBoxEnabled ? '1' : '0',
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

      if (!res.ok) throw new Error('Erro ao salvar configurações de monetização.');

      setNotification({ type: 'success', text: 'Monetização, Amazon Afiliados e Google AdSense atualizados com sucesso!' });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Generate Amazon affiliate link on the fly
  const generateAmazonLink = (input: string) => {
    const tag = amazonAffiliateTag.trim() || 'blogfilipem2-20';
    if (!input.trim()) {
      return `https://www.amazon.com.br/?tag=${tag}`;
    }
    const clean = input.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      const separator = clean.includes('?') ? '&' : '?';
      return `${clean}${separator}tag=${tag}`;
    }
    return `https://www.amazon.com.br/s?k=${encodeURIComponent(clean)}&tag=${tag}`;
  };

  const generatedLink = generateAmazonLink(amazonQuery);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        <span className="text-xs text-neutral-400">Carregando painel de monetização...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-7 h-7 text-emerald-500" />
            <span>Monetização &amp; Publicidade</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Configure Google AdSense, Amazon Associados e banners patrocinados para gerar receita com seu público.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Salvar Alterações</span>
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

      {/* Seção 1: Amazon Associados (Oficial) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#12141c] via-[#161a24] to-[#12141c] border border-amber-500/40 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Amazon Associados (Brasil)</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  Ativo no Site
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Ganhe comissões de até 15% por cada produto, jogo ou console comprado por recomendação do seu blog.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-300 font-semibold">Box nos Artigos:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={amazonBoxEnabled}
                onChange={(e) => setAmazonBoxEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tracking ID Configuration */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-200 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Seu ID de Associado Amazon (Tracking Tag)</span>
              </label>
              <input
                type="text"
                value={amazonAffiliateTag}
                onChange={(e) => setAmazonAffiliateTag(e.target.value)}
                placeholder="Ex: blogfilipem2-20"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/50 text-[11px] text-amber-300/90 leading-relaxed">
              ✨ <strong>Automação Ativa:</strong> Qualquer link da Amazon colocado dentro das suas matérias receberá automaticamente sua tag <code className="text-white font-mono bg-black/40 px-1 py-0.5 rounded">tag={amazonAffiliateTag}</code>, garantindo que você nunca perca uma comissão!
            </div>
          </div>

          {/* Gerador Instantâneo de Link */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-neutral-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Gerador Rápido de Link Afiliado</span>
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={amazonQuery}
                onChange={(e) => setAmazonQuery(e.target.value)}
                placeholder="Digite o nome do produto ou cole um link (Ex: PlayStation 5)"
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-neutral-800 text-[11px] text-neutral-400 font-mono select-all"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-md"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 2: Google AdSense Integrado */}
      <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Google AdSense (Anúncios Automáticos)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono">
                  Oficial Google
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                O Google insere anúncios inteligentes automaticamente nos melhores pontos do seu site sem quebrar o layout.
              </p>
            </div>
          </div>
          <a
            href="https://adsense.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
          >
            <span>Painel AdSense</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-200 mb-1">
              ID de Editor do Google AdSense (Client ID)
            </label>
            <div className="relative">
              <input
                type="text"
                value={googleAdsenseId}
                onChange={(e) => setGoogleAdsenseId(e.target.value)}
                placeholder="Ex: ca-pub-2978439169182708"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
              Seu ID oficial atual: <code className="text-blue-400 font-mono font-bold">ca-pub-2978439169182708</code>. O script oficial do Google já está injetado no cabeçalho de todas as páginas.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-neutral-200">
                Arquivo ads.txt (Obrigatório para Aprovação do AdSense)
              </label>
              <a
                href="/ads.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                <span>Ver /ads.txt online</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <textarea
              rows={3}
              value={adsTxt}
              onChange={(e) => setAdsTxt(e.target.value)}
              placeholder="google.com, pub-2978439169182708, DIRECT, f08c47fec0942fa0"
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Linha ativa em <code className="text-emerald-400">https://blogfilipem2.site/ads.txt</code> pronta para verificação pelo Google.
            </p>
          </div>
        </div>
      </div>

      {/* Seção 3: Banners Manuais (HTML / Imagens / Scripts) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-red-500" />
            <span>Espaços Publicitários Customizados (Banners &amp; Parcerias)</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Você também pode colocar banners diretos de patrocinadores, blocos de anúncios manuais ou links de afiliados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slot 1: Header Ad */}
          <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-white">Banner Superior (Cabeçalho)</h3>
                <p className="text-[11px] text-neutral-400">Exibido no topo da página inicial (728x90)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={adHeaderEnabled}
                  onChange={(e) => setAdHeaderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Código HTML / Script / Imagem com Link
              </label>
              <textarea
                rows={4}
                value={adHeaderCode}
                onChange={(e) => setAdHeaderCode(e.target.value)}
                placeholder="<a href='https://link-afiliado...' target='_blank'><img src='...' /></a>"
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Slot 2: Sidebar Ad */}
          <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-white">Banner Lateral (Sidebar)</h3>
                <p className="text-[11px] text-neutral-400">Exibido na coluna lateral (300x250)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={adSidebarEnabled}
                  onChange={(e) => setAdSidebarEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Código HTML / Script / Imagem com Link
              </label>
              <textarea
                rows={4}
                value={adSidebarCode}
                onChange={(e) => setAdSidebarCode(e.target.value)}
                placeholder="Cole aqui o banner lateral ou código da sua rede de anúncios..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Slot 3: In-Article Ad */}
          <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-white">Anúncio Dentro dos Artigos</h3>
                <p className="text-[11px] text-neutral-400">Exibido logo abaixo do texto da matéria (Alta Conversão)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={adArticleEnabled}
                  onChange={(e) => setAdArticleEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Código HTML / Script / Imagem com Link
              </label>
              <textarea
                rows={4}
                value={adArticleCode}
                onChange={(e) => setAdArticleCode(e.target.value)}
                placeholder="Cole aqui o banner que aparecerá em todos os artigos..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Slot 4: Footer Ad */}
          <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-white">Banner Inferior (Rodapé)</h3>
                <p className="text-[11px] text-neutral-400">Exibido antes do rodapé em todas as páginas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={adFooterEnabled}
                  onChange={(e) => setAdFooterEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Código HTML / Script / Imagem com Link
              </label>
              <textarea
                rows={4}
                value={adFooterCode}
                onChange={(e) => setAdFooterCode(e.target.value)}
                placeholder="Cole aqui o banner de encerramento..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Seção 4: Outros Programas de Afiliados */}
      <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span>Outros Programas de Afiliados Recomendados</span>
        </h3>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Você também pode cadastrar parcerias diretas nestas plataformas:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <span className="text-xs font-black text-orange-400 uppercase tracking-wider block">Shopee / Mercado Livre</span>
            <p className="text-[11px] text-neutral-400">
              Produtos geek, action figures, camisetas de animes e acessórios gamer. Comissões pagas direto na sua conta bancária.
            </p>
            <a
              href="https://afiliados.shopee.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-400 hover:text-orange-300"
            >
              <span>Afiliados Shopee</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">Nuuvem / Games PC</span>
            <p className="text-[11px] text-neutral-400">
              Chaves digitais de lançamentos de jogos para PC e consoles com desconto oficial. Perfeito para notícias de jogos.
            </p>
            <a
              href="https://www.nuuvem.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
            >
              <span>Portal Nuuvem</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
