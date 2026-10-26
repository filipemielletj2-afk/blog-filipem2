'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Eye,
  Save,
  CheckCircle2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Settings2,
  Monitor,
  Tablet,
  Smartphone,
  Play,
  Flame,
  Grid,
  Mail,
  Code,
  Sparkles,
  Palette,
  Loader2,
  Check,
  RotateCcw
} from 'lucide-react';

interface Section {
  id?: number;
  type: string;
  title: string;
  subtitle: string;
  config_json: any;
  sort_order: number;
  is_active: number;
}

const AVAILABLE_BLOCKS = [
  {
    type: 'hero_featured',
    name: 'Hero Destaque Triplo',
    desc: '1 card gigante de destaque com 2 cards secundários empilhados.',
    icon: Flame,
    defaultConfig: { layout: 'hero_with_side_stack', limit: 3, showBadge: true }
  },
  {
    type: 'breaking_ticker',
    name: 'Letreiro de Notícias em Alta',
    desc: 'Barra horizontal animada com manchetes urgentes.',
    icon: Sparkles,
    defaultConfig: { badgeText: 'EM ALTA', limit: 5 }
  },
  {
    type: 'category_grid',
    name: 'Grade de Artigos por Categoria',
    desc: 'Grade de 3 colunas filtrada por categoria temática (Games, Música, etc.).',
    icon: Grid,
    defaultConfig: { categorySlug: 'games', limit: 3, columns: 3 }
  },
  {
    type: 'video_showcase',
    name: 'Vitrine de Vídeos e Trailers',
    desc: 'Player de alta definição com título, descrição e link de streaming.',
    icon: Play,
    defaultConfig: {
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoTitle: 'Novo Trailer Épico em Alta Definição',
      videoDescription: 'Confira a prévia oficial comentada pela nossa equipe.'
    }
  },
  {
    type: 'newsletter',
    name: 'Caixa de Inscrição VIP / Newsletter',
    desc: 'Formulário elegante para captura de e-mails em conformidade com LGPD.',
    icon: Mail,
    defaultConfig: {
      buttonText: 'Cadastrar Gratuitamente',
      placeholder: 'Seu melhor e-mail...',
      accentColor: '#DC2626'
    }
  },
  {
    type: 'custom_html',
    name: 'Bloco de Texto & HTML Livre',
    desc: 'Insira qualquer conteúdo formatado, aviso editorial ou widget personalizado.',
    icon: Code,
    defaultConfig: {
      html: '<div class="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center"><h3 class="text-xl font-bold text-white">Bloco Personalizado</h3><p class="text-sm text-neutral-400 mt-2">Adicione textos, avisos ou códigos especiais.</p></div>'
    }
  }
];

export default function VisualBuilderPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'sections' | 'add' | 'styles'>('sections');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Global styling state
  const [primaryColor, setPrimaryColor] = useState('#DC2626');
  const [borderRadius, setBorderRadius] = useState('0.75rem');

  useEffect(() => {
    loadBuilderData();
  }, []);

  const loadBuilderData = async () => {
    setLoading(true);
    try {
      // Fetch categories for dropdowns
      const catRes = await fetch('/api/categories');
      const cats = await catRes.json();
      setCategories(cats || []);

      // Fetch builder sections
      const secRes = await fetch('/api/builder?page=home&state=published');
      const data = await secRes.json();

      const parsed = (data || []).map((s: any) => ({
        ...s,
        config_json: typeof s.config_json === 'string' ? JSON.parse(s.config_json) : (s.config_json || {})
      }));

      setSections(parsed);
      if (parsed.length > 0) setSelectedSectionIndex(0);

      // Fetch settings
      const setRes = await fetch('/api/settings');
      const settings = await setRes.json();
      if (settings.theme_primary_color) setPrimaryColor(settings.theme_primary_color);
      if (settings.theme_border_radius) setBorderRadius(settings.theme_border_radius);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = (template: typeof AVAILABLE_BLOCKS[0]) => {
    const newSection: Section = {
      type: template.type,
      title: template.name,
      subtitle: template.desc,
      config_json: { ...template.defaultConfig },
      sort_order: sections.length + 1,
      is_active: 1
    };

    const updated = [...sections, newSection];
    setSections(updated);
    setSelectedSectionIndex(updated.length - 1);
    setActiveTab('sections');
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setSections(updated);
    setSelectedSectionIndex(index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setSections(updated);
    setSelectedSectionIndex(index + 1);
  };

  const handleDuplicate = (index: number) => {
    const item = sections[index];
    const duplicated: Section = {
      ...item,
      id: undefined,
      title: `${item.title} (Cópia)`,
      config_json: JSON.parse(JSON.stringify(item.config_json)),
      sort_order: sections.length + 1
    };
    const updated = [...sections.slice(0, index + 1), duplicated, ...sections.slice(index + 1)];
    setSections(updated);
    setSelectedSectionIndex(index + 1);
  };

  const handleDelete = (index: number) => {
    if (confirm('Tem certeza que deseja remover esta seção do layout?')) {
      const updated = sections.filter((_, i) => i !== index);
      setSections(updated);
      setSelectedSectionIndex(updated.length > 0 ? Math.max(0, index - 1) : null);
    }
  };

  const handleUpdateConfig = (key: string, value: any) => {
    if (selectedSectionIndex === null) return;
    const updated = [...sections];
    updated[selectedSectionIndex] = {
      ...updated[selectedSectionIndex],
      config_json: {
        ...updated[selectedSectionIndex].config_json,
        [key]: value
      }
    };
    setSections(updated);
  };

  const handleSaveAndPublish = async () => {
    setSaving(true);
    setNotification(null);
    try {
      // 1. Save Builder layout
      const res = await fetch('/api/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: 'home',
          action: 'save_and_publish',
          sections,
          publish: true
        })
      });

      if (!res.ok) throw new Error('Erro ao publicar layout.');

      // 2. Save styling options
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme_primary_color: primaryColor,
          theme_border_radius: borderRadius
        })
      });

      setNotification({ type: 'success', text: 'Layout e estilos publicados no portal ao vivo com sucesso!' });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const selectedSection = selectedSectionIndex !== null ? sections[selectedSectionIndex] : null;

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        <span className="text-xs text-neutral-400">Carregando Construtor Visual de Páginas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Builder Control Bar */}
      <div className="p-4 rounded-2xl bg-[#12141c] border border-neutral-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-red-950 border border-red-800 text-red-500">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>Editor Visual de Páginas</span>
              <span className="text-[10px] bg-red-600 text-white font-mono px-2 py-0.5 rounded font-bold">
                PÁGINA INICIAL
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Arraste, reorganize, edite blocos e publique alterações instantâneas sem código.
            </p>
          </div>
        </div>

        {/* Viewport switch & Publish Actions */}
        <div className="flex items-center space-x-3">
          {/* Viewport toggles */}
          <div className="hidden sm:flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 text-neutral-400">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-lg transition-colors ${viewport === 'desktop' ? 'bg-neutral-800 text-white' : 'hover:text-white'}`}
              title="Visão Computador"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-lg transition-colors ${viewport === 'tablet' ? 'bg-neutral-800 text-white' : 'hover:text-white'}`}
              title="Visão Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-lg transition-colors ${viewport === 'mobile' ? 'bg-neutral-800 text-white' : 'hover:text-white'}`}
              title="Visão Celular"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSaveAndPublish}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publicando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Publicar Alterações no Site</span>
              </>
            )}
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
              : 'bg-red-950/80 border border-red-800 text-red-400'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Main Studio Grid: Left Sidebar (Tools & Sections), Right (Live Visual Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Sections & Config Inspector */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tabs */}
          <div className="flex border-b border-neutral-800 bg-[#12141c] p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('sections')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'sections' ? 'bg-red-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Seções ({sections.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'add' ? 'bg-red-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Bloco</span>
            </button>
            <button
              onClick={() => setActiveTab('styles')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'styles' ? 'bg-red-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Cores &amp; Tema</span>
            </button>
          </div>

          {/* TAB 1: SECTIONS LIST & INSPECTOR */}
          {activeTab === 'sections' && (
            <div className="space-y-4">
              {/* Sections list cards */}
              <div className="p-4 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-2 max-h-[380px] overflow-y-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-1 block mb-2">
                  Ordem de Exibição na Página
                </span>
                {sections.map((sec, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedSectionIndex(idx)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedSectionIndex === idx
                        ? 'bg-neutral-800/90 border-red-500 shadow-md'
                        : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="font-mono text-xs text-neutral-500 font-bold w-4">
                        0{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{sec.title || sec.type}</h4>
                        <span className="text-[10px] text-neutral-400 font-mono block uppercase">
                          Tipo: {sec.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                        title="Subir seção"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === sections.length - 1}
                        className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                        title="Descer seção"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(idx)}
                        className="p-1 text-neutral-400 hover:text-white"
                        title="Duplicar seção"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(idx)}
                        className="p-1 text-neutral-400 hover:text-red-400"
                        title="Excluir seção"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inspector for Selected Section */}
              {selectedSection && (
                <div className="p-5 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Settings2 className="w-4 h-4 text-red-500" />
                      Propriedades da Seção Selecionada
                    </h3>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">
                      {selectedSection.type}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Título da Seção</label>
                      <input
                        type="text"
                        value={selectedSection.title || ''}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[selectedSectionIndex!].title = e.target.value;
                          setSections(updated);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Subtítulo / Descrição</label>
                      <input
                        type="text"
                        value={selectedSection.subtitle || ''}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[selectedSectionIndex!].subtitle = e.target.value;
                          setSections(updated);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* Specific configs depending on block type */}
                    {selectedSection.type === 'category_grid' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-300 mb-1">Filtrar por Categoria</label>
                          <select
                            value={selectedSection.config_json.categorySlug || ''}
                            onChange={(e) => handleUpdateConfig('categorySlug', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
                          >
                            <option value="">Todas as Categorias (Geral)</option>
                            {categories.map((c) => (
                              <option key={c.slug} value={c.slug}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-300 mb-1">Quantidade de Cards</label>
                          <select
                            value={selectedSection.config_json.limit || 3}
                            onChange={(e) => handleUpdateConfig('limit', parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
                          >
                            <option value={3}>3 Artigos</option>
                            <option value={6}>6 Artigos</option>
                            <option value={9}>9 Artigos</option>
                          </select>
                        </div>
                      </>
                    )}

                    {selectedSection.type === 'video_showcase' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-300 mb-1">URL de Incorporação do Vídeo (YouTube Embed)</label>
                          <input
                            type="text"
                            value={selectedSection.config_json.videoUrl || ''}
                            onChange={(e) => handleUpdateConfig('videoUrl', e.target.value)}
                            placeholder="https://www.youtube.com/embed/..."
                            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-300 mb-1">Título do Vídeo</label>
                          <input
                            type="text"
                            value={selectedSection.config_json.videoTitle || ''}
                            onChange={(e) => handleUpdateConfig('videoTitle', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </>
                    )}

                    {selectedSection.type === 'breaking_ticker' && (
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">Texto do Crachá</label>
                        <input
                          type="text"
                          value={selectedSection.config_json.badgeText || 'EM ALTA'}
                          onChange={(e) => handleUpdateConfig('badgeText', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                    )}

                    {selectedSection.type === 'custom_html' && (
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">HTML Personalizado</label>
                        <textarea
                          rows={5}
                          value={selectedSection.config_json.html || ''}
                          onChange={(e) => handleUpdateConfig('html', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD BLOCK LIBRARY */}
          {activeTab === 'add' && (
            <div className="p-4 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white block pb-2 border-b border-neutral-800">
                Biblioteca de Blocos Disponíveis
              </span>

              <div className="space-y-2.5">
                {AVAILABLE_BLOCKS.map((tpl) => {
                  const Icon = tpl.icon;
                  return (
                    <div
                      key={tpl.type}
                      onClick={() => handleAddBlock(tpl)}
                      className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-500 hover:bg-neutral-800/80 cursor-pointer transition-all flex items-start gap-3 group"
                    >
                      <div className="p-2.5 rounded-xl bg-neutral-800 group-hover:bg-red-600 text-neutral-300 group-hover:text-white transition-colors shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                          {tpl.name}
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">
                          {tpl.desc}
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-neutral-500 group-hover:text-red-400 shrink-0 self-center" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: THEME STYLES */}
          {activeTab === 'styles' && (
            <div className="p-5 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white block pb-2 border-b border-neutral-800">
                Personalização Visual do Site
              </span>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-2">Cor Primária do Portal</label>
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
                      className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono uppercase"
                    />
                  </div>

                  <div className="flex gap-2 mt-2">
                    {['#DC2626', '#E11D48', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setPrimaryColor(preset)}
                        className="w-6 h-6 rounded-full border-2 border-neutral-700 hover:scale-110 transition-transform"
                        style={{ backgroundColor: preset }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1.5">Arredondamento das Bordas</label>
                  <select
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                  >
                    <option value="0.375rem">Suave (6px)</option>
                    <option value="0.75rem">Moderno (12px - Padrão)</option>
                    <option value="1.25rem">Arredondado Cyber (20px)</option>
                    <option value="0rem">Quadrado Gamer Retrô (0px)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Live Canvas Mockup */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400 px-2">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-neutral-500" />
              <span>Pré-visualização Interativa em Tempo Real</span>
            </span>
            <span className="font-mono text-[11px] text-neutral-500 uppercase">
              Modo: {viewport}
            </span>
          </div>

          <div
            className={`mx-auto bg-[#0a0b0e] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
              viewport === 'mobile'
                ? 'max-w-sm'
                : viewport === 'tablet'
                ? 'max-w-xl'
                : 'w-full'
            }`}
          >
            {/* Mock browser header */}
            <div className="bg-[#14161f] px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-600/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600/80"></div>
              </div>
              <div className="px-3 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400 font-mono">
                blogfilipem2.com.br
              </div>
              <div className="w-10"></div>
            </div>

            {/* Canvas Body */}
            <div className="p-4 space-y-6 max-h-[750px] overflow-y-auto">
              {sections.map((sec, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedSectionIndex(idx);
                    setActiveTab('sections');
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedSectionIndex === idx
                      ? 'border-red-500 bg-red-950/10 ring-2 ring-red-500/30'
                      : 'border-neutral-800 bg-[#12141c]/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      {sec.type}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Posição #{idx + 1}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">{sec.title}</h4>
                  {sec.subtitle && (
                    <p className="text-xs text-neutral-400 line-clamp-1 mb-2">{sec.subtitle}</p>
                  )}

                  {/* Visual preview dummy according to type */}
                  {sec.type === 'hero_featured' && (
                    <div className="h-32 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs text-neutral-500">
                      [Layout Hero Destaque Principal + Pilha de Notícias]
                    </div>
                  )}

                  {sec.type === 'category_grid' && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-16 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[10px] text-neutral-500">Card 1</div>
                      <div className="h-16 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[10px] text-neutral-500">Card 2</div>
                      <div className="h-16 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[10px] text-neutral-500">Card 3</div>
                    </div>
                  )}

                  {sec.type === 'video_showcase' && (
                    <div className="h-28 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs text-neutral-400 gap-2">
                      <Play className="w-4 h-4 text-red-500" />
                      <span>{sec.config_json.videoTitle || 'Vídeo Showcase Oficial'}</span>
                    </div>
                  )}

                  {sec.type === 'newsletter' && (
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400">
                      [Caixa de Newsletter &amp; Inscrição LGPD]
                    </div>
                  )}

                  {sec.type === 'breaking_ticker' && (
                    <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-red-500">{sec.config_json.badgeText || 'EM ALTA'}</span>
                      <span className="text-[11px] text-neutral-300 truncate">Manchetes automáticas em tempo real</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
