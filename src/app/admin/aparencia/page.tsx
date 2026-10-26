'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Save, CheckCircle2, Loader2, Sparkles, Sliders } from 'lucide-react';

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

      setNotification({ type: 'success', text: 'Identidade visual e temas atualizados no portal!' });
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
        <span className="text-xs text-neutral-400">Carregando painel de aparência...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Palette className="w-7 h-7 text-red-500" />
            <span>Aparência, Cores &amp; Tipografia</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Personalize a identidade visual exclusiva do BLOG FILIPEM2 com pré-visualização instantânea.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Salvar Aparência</span>
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

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Palette */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
            Paleta de Cores do Portal
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
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
            Tipografia &amp; Fontes
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
      </form>
    </div>
  );
}
