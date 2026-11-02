'use client';

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Save,
  CheckCircle2,
  Loader2,
  Sparkles,
  Sliders,
  Play,
  Columns,
  Rows,
  Maximize2,
  Zap,
  Split,
  Cpu,
  Gauge,
  ShieldOff,
  Check,
  Layers,
  Clock,
  Eye,
  Film
} from 'lucide-react';

interface TransitionOption {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  icon: any;
  recommendation?: boolean;
}

const transitionStyles: TransitionOption[] = [
  {
    id: 'slices_vertical',
    name: 'Fatias Verticais Neon (Elementor)',
    badge: '★ RECOMENDADO - ESTILO TUTORIAL',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
    description: '5 colunas verticais escalonadas com corte de laser neon e logo central pulsante. Efeito idêntico ao tutorial Elementor.',
    icon: Columns,
    recommendation: true
  },
  {
    id: 'slices_horizontal',
    name: 'Persianas Horizontais (Venetian)',
    badge: 'ESTILO PERSIANA',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    description: '5 barras horizontais varrendo da esquerda com lâmina de luz lateral brilhante e movimento escalonado.',
    icon: Rows
  },
  {
    id: 'curtain_vertical',
    name: 'Cortina Veludo Suave (Smooth Wipe)',
    badge: 'FLUIDO & ELEGANTE',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    description: 'Folha monolítica escura ultra-suave com borda superior de laser neon que sobe e revela o novo artigo.',
    icon: Maximize2
  },
  {
    id: 'curtain_lateral',
    name: 'Swipe Lateral Cyberpunk',
    badge: 'ALTA VELOCIDADE',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    description: 'Corte horizontal veloz varrendo a tela da esquerda para a direita com feixe luminoso de laser na ponta.',
    icon: Zap
  },
  {
    id: 'curtain_split',
    name: 'Portas de Aço Dupla (Split Doors)',
    badge: 'EFEITO CINEMATOGRÁFICO',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    description: 'Duas portas que deslizam das laterais, colidem no centro com linha de energia e se abrem para os lados.',
    icon: Split
  },
  {
    id: 'zoom_fade',
    name: 'Dissolução Cinematográfica & Blur',
    badge: 'MODERNO & SUAVE',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    description: 'Escurecimento suave com desfoque de fundo (backdrop-blur), halo radial de luz e aproximação suave do emblema.',
    icon: Sparkles
  },
  {
    id: 'cyberpunk_glitch',
    name: 'Scanline Sci-Fi & Grid Hacker',
    badge: 'GAMER & TECH',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    description: 'Grelha digital com feixe de laser escaneando a tela verticalmente e miras holográficas futuristas.',
    icon: Cpu
  },
  {
    id: 'minimal_topbar',
    name: 'Barra Neon Minimalista (YouTube)',
    badge: 'ULTRA LEVE',
    badgeColor: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/40',
    description: 'Não cobre a tela nem atrapalha a leitura. Apenas uma linha laser acelerada no topo do navegador.',
    icon: Gauge
  },
  {
    id: 'disabled',
    name: 'Instantâneo (Sem Transição)',
    badge: 'NATIVO DIRETO',
    badgeColor: 'bg-neutral-800 text-neutral-400 border-neutral-700',
    description: 'Nenhum efeito ou overlay visual. Navegação padrão instantânea direta do navegador.',
    icon: ShieldOff
  }
];

export default function AdminAppearancePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Appearance fields
  const [primaryColor, setPrimaryColor] = useState('#DC2626');
  const [headingFont, setHeadingFont] = useState('Space Grotesk');
  const [bodyFont, setBodyFont] = useState('Inter');
  const [borderRadius, setBorderRadius] = useState('0.75rem');
  const [footerText, setFooterText] = useState('');

  // Page Transitions State
  const [transitionEffect, setTransitionEffect] = useState('slices_vertical');
  const [transitionSpeed, setTransitionSpeed] = useState<'fast' | 'normal' | 'cinematic'>('normal');
  const [transitionShowLogo, setTransitionShowLogo] = useState(true);

  // Social Links
  const [socialYoutube, setSocialYoutube] = useState('');
  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialDiscord, setSocialDiscord] = useState('');
  const [socialTwitch, setSocialTwitch] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setPrimaryColor(data.theme_primary_color || '#DC2626');
      setHeadingFont(data.theme_font_heading || 'Space Grotesk');
      setBodyFont(data.theme_font_body || 'Inter');
      setBorderRadius(data.theme_border_radius || '0.75rem');
      setFooterText(data.footer_text || '');

      setTransitionEffect(data.page_transition_effect || 'slices_vertical');
      setTransitionSpeed((data.page_transition_speed as any) || 'normal');
      setTransitionShowLogo(data.page_transition_show_logo !== '0');

      let socials: any = {};
      try {
        socials = JSON.parse(data.social_links_json || '{}');
      } catch {}
      setSocialYoutube(socials.youtube || '');
      setSocialTwitter(socials.twitter || '');
      setSocialInstagram(socials.instagram || '');
      setSocialDiscord(socials.discord || '');
      setSocialTwitch(socials.twitch || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestPreview = (effectId: string) => {
    window.dispatchEvent(
      new CustomEvent('preview-transition', {
        detail: {
          effect: effectId,
          speed: transitionSpeed,
          showLogo: transitionShowLogo
        }
      })
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    const payload = {
      theme_primary_color: primaryColor,
      theme_font_heading: headingFont,
      theme_font_body: bodyFont,
      theme_border_radius: borderRadius,
      footer_text: footerText,
      page_transition_effect: transitionEffect,
      page_transition_speed: transitionSpeed,
      page_transition_show_logo: transitionShowLogo ? '1' : '0',
      social_links_json: JSON.stringify({
        youtube: socialYoutube,
        twitter: socialTwitter,
        instagram: socialInstagram,
        discord: socialDiscord,
        twitch: socialTwitch
      })
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Erro ao salvar aparência.');

      // Notify the active CurtainTransition component in memory immediately
      window.dispatchEvent(
        new CustomEvent('update-transition-settings', {
          detail: {
            effect: transitionEffect,
            speed: transitionSpeed,
            showLogo: transitionShowLogo
          }
        })
      );

      setNotification({
        type: 'success',
        text: 'Transição de página e preferências visuais salvas com sucesso!'
      });
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
        <span className="text-xs text-neutral-400">Carregando painel de aparência &amp; transições...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Palette className="w-7 h-7 text-red-500" />
            <span>Aparência, Temas &amp; Transições de Página</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Escolha e teste animações cinematográficas de carregamento, personalize cores e tipografia do BLOG FILIPEM2.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Salvar Alterações</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
              : 'bg-red-950/80 border border-red-800 text-red-400'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* SECTION 1: PAGE TRANSITIONS GALLERY & CONTROLS */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-96 h-48 bg-red-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-red-600/10 text-red-500 border border-red-600/20">
                <Film className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-black text-white tracking-wide">
                Galeria de Transições de Página (Page Transitions)
              </h2>
            </div>
            <p className="text-xs text-neutral-400">
              Clique em <strong className="text-red-400">▶ Testar Prévia</strong> para ver a animação acontecer na sua tela agora mesmo antes de salvar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTestPreview(transitionEffect)}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-bold flex items-center gap-2 transition-all hover:border-red-500/50 shadow"
            >
              <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>Testar Transição Atual</span>
            </button>
          </div>
        </div>

        {/* Global Controls: Speed & Logo Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-[#0a0b10] border border-neutral-800/80">
          {/* Speed Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-red-400" />
              <span>Velocidade da Animação:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'fast', label: '⚡ Rápida', time: '280ms' },
                { id: 'normal', label: '⚖ Equilibrada', time: '440ms (Padrão)' },
                { id: 'cinematic', label: '🎬 Cinema', time: '700ms' }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setTransitionSpeed(s.id as any)}
                  className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all border ${
                    transitionSpeed === s.id
                      ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <div className="leading-tight">{s.label}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{s.time}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Logo Toggle */}
          <div className="space-y-2 flex flex-col justify-center">
            <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-red-400" />
              <span>Exibição de Logotipo:</span>
            </label>
            <label className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors">
              <input
                type="checkbox"
                checked={transitionShowLogo}
                onChange={(e) => setTransitionShowLogo(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-neutral-800 border-neutral-700 cursor-pointer"
              />
              <span className="text-xs text-neutral-300 font-medium select-none">
                Exibir Logo Central com Aura Pulsante e badge "CARREGANDO"
              </span>
            </label>
          </div>
        </div>

        {/* Transition Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {transitionStyles.map((item) => {
            const Icon = item.icon;
            const isSelected = transitionEffect === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setTransitionEffect(item.id)}
                className={`relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                  isSelected
                    ? 'bg-neutral-900/90 border-red-500 shadow-xl shadow-red-600/20 ring-1 ring-red-500/50'
                    : 'bg-[#0e1017] border-neutral-800 hover:border-neutral-700 hover:bg-[#13151f]'
                }`}
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                            : 'bg-neutral-800/80 text-neutral-400 group-hover:text-red-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                          {item.name}
                        </h3>
                        <span
                          className={`inline-block mt-1 text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-neutral-800/60 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestPreview(item.id);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-neutral-800/90 hover:bg-red-600 hover:text-white text-neutral-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-neutral-700/80 hover:border-red-500 shadow-sm"
                  >
                    <Play className="w-3 h-3 text-red-400 group-hover:text-white fill-current" />
                    <span>Testar Prévia</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTransitionEffect(item.id);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-red-600/20 text-red-400 border-red-500/50'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {isSelected ? '✓ Selecionado' : 'Selecionar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: PALETTE & TYPOGRAPHY & SOCIALS */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Palette */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2 flex items-center gap-2">
            <Palette className="w-4 h-4 text-red-500" />
            <span>Paleta de Cores do Portal</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-300 mb-2">Cor Primária de Destaque</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-36 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono uppercase"
                />
              </div>

              <div className="flex gap-2.5 mt-3">
                {[
                  { name: 'Vermelho Filipem2', hex: '#DC2626' },
                  { name: 'Carmim Neon', hex: '#E11D48' },
                  { name: 'Roxo Cyber', hex: '#8B5CF6' },
                  { name: 'Azul Elétrico', hex: '#3B82F6' },
                  { name: 'Esmeralda Gamer', hex: '#10B981' },
                  { name: 'Âmbar Retrô', hex: '#F59E0B' }
                ].map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setPrimaryColor(preset.hex)}
                    title={preset.name}
                    className="w-7 h-7 rounded-full border-2 border-neutral-700 hover:scale-110 transition-transform shadow-md"
                    style={{ backgroundColor: preset.hex }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1.5">Estilo das Bordas &amp; Cards</label>
              <select
                value={borderRadius}
                onChange={(e) => setBorderRadius(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
              >
                <option value="0.375rem">Suave (6px)</option>
                <option value="0.75rem">Moderno Elegante (12px - Recomendado)</option>
                <option value="1.25rem">Arredondado Cyberpunk (20px)</option>
                <option value="0rem">Quadrado Retrô (0px)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span>Tipografia &amp; Fontes</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1.5">Fonte dos Títulos (Headings)</label>
              <select
                value={headingFont}
                onChange={(e) => setHeadingFont(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
              >
                <option value="Space Grotesk">Space Grotesk (Moderna, Geek, Futurista)</option>
                <option value="Inter">Inter (Limpa, Editorial, Alta Legibilidade)</option>
                <option value="system-ui">Sistema Nativo (Ultra Rápida)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1.5">Fonte do Texto dos Artigos</label>
              <select
                value={bodyFont}
                onChange={(e) => setBodyFont(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
              >
                <option value="Inter">Inter (Padrão ouro para leitura digital)</option>
                <option value="system-ui">System Sans-Serif</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Texto de Copyright do Rodapé</label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* Social Networks Links */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
            Redes Sociais Oficiais &amp; Comunidade
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Canal do YouTube</label>
              <input
                type="url"
                value={socialYoutube}
                onChange={(e) => setSocialYoutube(e.target.value)}
                placeholder="https://youtube.com/@..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Perfil no X (Twitter)</label>
              <input
                type="url"
                value={socialTwitter}
                onChange={(e) => setSocialTwitter(e.target.value)}
                placeholder="https://x.com/..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Instagram Oficial</label>
              <input
                type="url"
                value={socialInstagram}
                onChange={(e) => setSocialInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Servidor no Discord</label>
              <input
                type="url"
                value={socialDiscord}
                onChange={(e) => setSocialDiscord(e.target.value)}
                placeholder="https://discord.gg/..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Transmissões na Twitch</label>
              <input
                type="url"
                value={socialTwitch}
                onChange={(e) => setSocialTwitch(e.target.value)}
                placeholder="https://twitch.tv/..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="lg:col-span-2 flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-red-600/30 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Salvar Todas as Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
}
