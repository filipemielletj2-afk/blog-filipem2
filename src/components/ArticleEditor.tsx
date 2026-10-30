'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Link as LinkIcon,
  Video,
  Globe,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Plus,
  Trash2,
  Heading,
  Bold,
  Italic,
  Quote,
  List,
  ExternalLink,
  Upload,
  X,
  Check,
  FolderOpen
} from 'lucide-react';
import { slugify } from '@/lib/utils';

interface ArticleEditorProps {
  initialData?: any;
  articleId?: number;
}

export default function ArticleEditor({ initialData, articleId }: ArticleEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [customSlugEdited, setCustomSlugEdited] = useState(Boolean(initialData?.slug));
  const [content, setContent] = useState(initialData?.content || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || '');
  const [coverCaption, setCoverCaption] = useState(initialData?.cover_caption || '');
  const [coverSource, setCoverSource] = useState(initialData?.cover_source || '');
  const [categoryId, setCategoryId] = useState<number>(initialData?.category_id || 1);
  const [status, setStatus] = useState(initialData?.status || 'published');
  const [featured, setFeatured] = useState(Boolean(initialData?.featured));
  const [allowComments, setAllowComments] = useState(initialData?.allow_comments !== 0);

  // Tags
  const [tags, setTags] = useState<string[]>(initialData?.tags?.map((t: any) => t.name) || []);
  const [tagInput, setTagInput] = useState('');

  // Sources & References
  const [sources, setSources] = useState<Array<{ title: string; url: string }>>(() => {
    try {
      return initialData?.sources_json ? JSON.parse(initialData.sources_json) : [];
    } catch {
      return [];
    }
  });
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');

  // SEO
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || '');
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonical_url || '');
  const [ogImage, setOgImage] = useState(initialData?.og_image || '');

  // UI state
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Media & File Upload state
  const [imageError, setImageError] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploadingInModal, setUploadingInModal] = useState(false);
  const [modalMode, setModalMode] = useState<'cover' | 'content'>('cover');

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((cats) => {
        setCategories(cats || []);
        if (!initialData && cats?.length > 0) {
          setCategoryId(cats[0].id);
        }
      });
  }, [initialData]);

  const loadMedia = async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      setMediaItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const openMediaModal = (mode: 'cover' | 'content') => {
    setModalMode(mode);
    setMediaModalOpen(true);
    loadMedia();
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setNotification(null);
    setImageError(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt_text', coverCaption || title || file.name);
      formData.append('credit', coverSource || '');

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar imagem.');

      setCoverImage(data.media.url);
      setNotification({
        type: 'success',
        text: `Arquivo "${file.name}" enviado e definido como Imagem de Capa com sucesso!`
      });
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Falha no envio do arquivo.' });
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleModalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingInModal(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt_text', file.name);

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar arquivo.');

      loadMedia();

      if (modalMode === 'content') {
        insertFormatting(
          `\n<figure class="my-6">\n  <img src="${data.media.url}" alt="${file.name}" class="rounded-2xl w-full shadow-lg" />\n  <figcaption class="text-xs text-neutral-400 text-center mt-2">${file.name}</figcaption>\n</figure>\n`
        );
        setMediaModalOpen(false);
        setNotification({ type: 'success', text: `Imagem "${file.name}" inserida no corpo da matéria!` });
      } else {
        setCoverImage(data.media.url);
        setImageError(false);
        setMediaModalOpen(false);
        setNotification({ type: 'success', text: `Imagem "${file.name}" definida como Capa com sucesso!` });
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar arquivo.');
    } finally {
      setUploadingInModal(false);
      e.target.value = '';
    }
  };

  const handleInsertVideo = () => {
    const rawUrl = prompt('Cole aqui o link do vídeo do YouTube (ex: https://youtu.be/... ou https://youtube.com/watch?v=...):');
    if (!rawUrl || !rawUrl.trim()) return;

    const trimmed = rawUrl.trim();
    insertFormatting(`\n\n${trimmed}\n\n`);
    setNotification({
      type: 'success',
      text: 'Vídeo do YouTube inserido! Ele será exibido automaticamente como player interativo no artigo.'
    });
  };

  const handleSelectMedia = (item: any) => {
    if (modalMode === 'content') {
      insertFormatting(
        `\n<figure class="my-6">\n  <img src="${item.url}" alt="${item.alt_text || item.original_name || 'Imagem'}" class="rounded-2xl w-full shadow-lg" />\n  ${item.alt_text ? `<figcaption class="text-xs text-neutral-400 text-center mt-2">${item.alt_text}</figcaption>` : ''}\n</figure>\n`
      );
      setMediaModalOpen(false);
      setNotification({ type: 'success', text: `Imagem inserida no corpo da matéria!` });
    } else {
      setCoverImage(item.url);
      setImageError(false);
      if (item.alt_text && !coverCaption) setCoverCaption(item.alt_text);
      if (item.credit && !coverSource) setCoverSource(item.credit);
      setMediaModalOpen(false);
      setNotification({ type: 'success', text: `Imagem definida como Capa com sucesso!` });
    }
  };

  const handleContentPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        setNotification({ type: 'success', text: 'Enviando imagem colada da área de transferência...' });

        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('alt_text', 'Imagem anexada');

          const res = await fetch('/api/media', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (res.ok && data.media?.url) {
            insertFormatting(
              `\n<figure class="my-6">\n  <img src="${data.media.url}" alt="Imagem" class="rounded-2xl w-full shadow-lg" />\n</figure>\n`
            );
            setNotification({ type: 'success', text: 'Imagem colada enviada e inserida no texto com sucesso!' });
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!customSlugEdited) {
      setSlug(slugify(val));
    }
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSource = () => {
    if (!newSourceTitle || !newSourceUrl) return;
    setSources([...sources, { title: newSourceTitle.trim(), url: newSourceUrl.trim() }]);
    setNewSourceTitle('');
    setNewSourceUrl('');
  };

  const handleRemoveSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  // Content formatting toolbar helpers
  const insertFormatting = (before: string, after: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${before}${selected}${after}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
  };

  const handleSave = async (forceStatus?: string) => {
    if (!title.trim() || !content.trim()) {
      setNotification({ type: 'error', text: 'O título e o conteúdo são obrigatórios.' });
      return;
    }

    setLoading(true);
    setNotification(null);

    const payload = {
      title,
      subtitle,
      slug,
      content,
      excerpt: excerpt || title,
      cover_image: coverImage,
      cover_caption: coverCaption,
      cover_source: coverSource,
      category_id: categoryId,
      status: forceStatus || status,
      featured: featured ? 1 : 0,
      allow_comments: allowComments ? 1 : 0,
      tags,
      sources_json: JSON.stringify(sources),
      meta_title: metaTitle || `${title} | BLOG FILIPEM2`,
      meta_description: metaDescription || excerpt || title,
      canonical_url: canonicalUrl,
      og_image: ogImage || coverImage
    };

    try {
      const url = articleId ? `/api/articles/${articleId}` : '/api/articles';
      const method = articleId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar artigo.');

      setNotification({ type: 'success', text: 'Artigo salvo e sincronizado com o portal!' });

      if (!articleId && data.id) {
        router.push(`/admin/artigos/${data.id}/editar`);
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/admin/artigos')}
            className="p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-900 border border-neutral-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {articleId ? 'Editar Artigo' : 'Criar Nova Publicação'}
            </h1>
            <p className="text-xs text-neutral-400">
              Sistema de Gestão de Conteúdo (CMS) completo com SEO técnico.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {slug && (
            <a
              href={`/artigo/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visualizar no Site</span>
            </a>
          )}

          <button
            onClick={() => handleSave('draft')}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-200 text-xs font-bold transition-colors disabled:opacity-50"
          >
            Salvar Rascunho
          </button>

          <button
            onClick={() => handleSave('published')}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Publicar Imediatamente</span>
          </button>
        </div>
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

      {/* Editor Grid: Left Content Column & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 cols: Title, Content, Sources, Excerpt */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Title & Subtitle */}
          <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Título da Matéria *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ex: Análise Completa: Como os Novos Consoles Estão Mudando a Indústria..."
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-base font-bold focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Subtítulo / Linha Fina
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Breve resumo contextual que aparece logo abaixo do título principal..."
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                URL Amigável (Slug)
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-neutral-900 border border-r-0 border-neutral-700 rounded-l-xl text-xs text-neutral-500 font-mono">
                  /artigo/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setCustomSlugEdited(true);
                    setSlug(e.target.value);
                  }}
                  className="flex-1 px-3 py-2 rounded-r-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Rich Content Editor */}
          <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-neutral-800 gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Corpo da Matéria (HTML / Markdown Rico) *
              </label>

              {/* Toolbar Buttons */}
              <div className="flex flex-wrap items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-700">
                <button
                  type="button"
                  onClick={() => insertFormatting('<h2>', '</h2>')}
                  className="px-2 py-1 hover:bg-neutral-800 rounded text-xs text-neutral-300 font-bold"
                  title="Subtítulo H2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<h3>', '</h3>')}
                  className="px-2 py-1 hover:bg-neutral-800 rounded text-xs text-neutral-300 font-bold"
                  title="Intertítulo H3"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<strong>', '</strong>')}
                  className="p-1 hover:bg-neutral-800 rounded text-neutral-300"
                  title="Negrito"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<em>', '</em>')}
                  className="p-1 hover:bg-neutral-800 rounded text-neutral-300"
                  title="Itálico"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<blockquote>', '</blockquote>')}
                  className="p-1 hover:bg-neutral-800 rounded text-neutral-300"
                  title="Citação"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<p>', '</p>')}
                  className="px-2 py-1 hover:bg-neutral-800 rounded text-xs text-neutral-300"
                  title="Parágrafo"
                >
                  &para;
                </button>
                <button
                  type="button"
                  onClick={handleInsertVideo}
                  className="px-2 py-1 hover:bg-neutral-800 rounded text-xs text-neutral-300 font-bold flex items-center gap-1 border border-neutral-700"
                  title="Incorporar Vídeo do YouTube"
                >
                  <Video className="w-3.5 h-3.5 text-red-500" />
                  <span>+ Vídeo</span>
                </button>
                <button
                  type="button"
                  onClick={() => openMediaModal('content')}
                  className="px-2 py-1 hover:bg-neutral-800 rounded text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 border border-red-900/60"
                  title="Inserir Imagem / Arquivo no Texto"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>+ Imagem</span>
                </button>
              </div>
            </div>

            <textarea
              id="content-editor"
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handleContentPaste}
              placeholder="Escreva sua matéria jornalística aqui... Pode escrever naturalmente dando Enter entre parágrafos, que o portal organizará o espaçamento perfeitamente! Você também pode colar imagens (Ctrl+V) ou usar o botão '+ Imagem' acima."
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-sm focus:outline-none focus:border-red-500 leading-relaxed whitespace-pre-wrap"
            />
            <span className="text-[11px] text-neutral-400 mt-1.5 block">
              💡 <strong>Dica de formatação:</strong> Escreva naturalmente! Cada quebra de linha com <em>Enter</em> será automaticamente exibida como parágrafos elegantes e espaçados na matéria.
            </span>
          </div>

          {/* Sources and References (Prompt Requirement #8) */}
          <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-red-500" />
                Fontes e Referências Jornalísticas
              </h3>
              <span className="text-[10px] text-neutral-500">Transparência Editorial</span>
            </div>

            <div className="space-y-2">
              {sources.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
                  <div className="min-w-0 pr-2">
                    <strong className="text-white block truncate">{s.title}</strong>
                    <span className="text-neutral-500 font-mono text-[10px] truncate block">{s.url}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSource(idx)}
                    className="p-1 text-neutral-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2">
              <input
                type="text"
                placeholder="Nome da Fonte (ex: IGN Brasil)"
                value={newSourceTitle}
                onChange={(e) => setNewSourceTitle(e.target.value)}
                className="sm:col-span-5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
              />
              <input
                type="url"
                placeholder="https://..."
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                className="sm:col-span-5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handleAddSource}
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* SEO Accordion */}
          <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-500" />
                Configurações de SEO &amp; Indexação no Google
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">Schema.org NewsArticle</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Título SEO (Meta Title)</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={`${title || 'Título do Artigo'} | BLOG FILIPEM2`}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Descrição SEO (Meta Description)</label>
                <textarea
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Resumo otimizado de até 160 caracteres que aparecerá nos resultados de busca do Google..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Google SERP Simulator */}
              <div className="p-3.5 rounded-xl bg-[#0b0c10] border border-neutral-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-neutral-500">
                  Prévia nos Resultados do Google
                </span>
                <div className="text-xs text-emerald-400 font-mono truncate">
                  https://blogfilipem2.site/artigo/{slug || 'slug-do-artigo'}
                </div>
                <div className="text-sm font-medium text-blue-400 line-clamp-1 hover:underline cursor-pointer">
                  {metaTitle || `${title || 'Título da Notícia'} | BLOG FILIPEM2`}
                </div>
                <div className="text-xs text-neutral-400 line-clamp-2">
                  {metaDescription || excerpt || 'Notícia e análise completa sobre games, filmes, músicas e cultura geek.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Publishing Settings, Category, Tags, Cover */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publishing Box */}
          <div className="p-5 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-white block pb-2 border-b border-neutral-800">
              Opções de Publicação
            </span>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="published">Publicado no Ar</option>
                  <option value="draft">Rascunho Privado</option>
                  <option value="scheduled">Agendado</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Categoria Principal *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded"
                  />
                  <span className="text-neutral-300">Fixar como Matéria em Destaque (Hero)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded"
                  />
                  <span className="text-neutral-300">Permitir comentários dos leitores</span>
                </label>
              </div>
            </div>
          </div>

          {/* Cover Image Box */}
          <div className="p-5 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Imagem de Capa
              </span>
              {coverImage && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage('');
                    setImageError(false);
                  }}
                  className="text-[11px] text-neutral-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                  title="Remover Capa"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remover Capa</span>
                </button>
              )}
            </div>

            {/* Image Preview */}
            {coverImage && (
              <div className="rounded-xl overflow-hidden border border-neutral-800 bg-black aspect-video relative group">
                <img
                  src={coverImage}
                  alt="Capa"
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                  onLoad={() => setImageError(false)}
                />
                {imageError && (
                  <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center p-4 text-center">
                    <AlertCircle className="w-7 h-7 text-red-500 mb-1.5" />
                    <span className="text-xs font-bold text-white">Não foi possível carregar a imagem</span>
                    <p className="text-[11px] text-neutral-400 mt-1 max-w-xs leading-relaxed">
                      {coverImage.startsWith('blob:')
                        ? 'Links "blob:" são temporários da memória do navegador e não funcionam na internet. Por favor, envie o arquivo diretamente do seu computador no botão abaixo!'
                        : 'Verifique se o link está acessível ou selecione um arquivo do computador.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Direct File Upload from Computer */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Enviar Arquivo do Computador
              </label>
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-neutral-700 hover:border-red-500 rounded-xl cursor-pointer bg-neutral-900/60 hover:bg-neutral-900 transition-all text-center group">
                {uploadingCover ? (
                  <div className="flex items-center gap-2 py-2 text-neutral-300 text-xs font-medium">
                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    <span>Enviando arquivo para o site...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-red-500 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-white">Escolher Arquivo do Computador</span>
                    <span className="text-[11px] text-neutral-400 mt-0.5">JPG, PNG, WebP, GIF ou AVIF (até 10MB)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
                  disabled={uploadingCover}
                  onChange={handleCoverFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Media Library Selector Button */}
            <div>
              <button
                type="button"
                onClick={() => openMediaModal('cover')}
                className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-neutral-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <FolderOpen className="w-4 h-4 text-blue-400" />
                <span>Escolher da Biblioteca de Mídia</span>
              </button>
            </div>

            {/* External URL Option */}
            <div className="pt-2 border-t border-neutral-800/80">
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Ou cole uma URL / Link da Imagem
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => {
                  setCoverImage(e.target.value);
                  setImageError(false);
                }}
                placeholder="https://images.unsplash.com/... ou /uploads/..."
                className={`w-full px-3 py-2 rounded-xl bg-neutral-900 border text-white font-mono text-xs focus:outline-none ${
                  coverImage.startsWith('blob:')
                    ? 'border-red-500 text-red-400'
                    : 'border-neutral-700 focus:border-red-500'
                }`}
              />
              {coverImage.startsWith('blob:') && (
                <div className="mt-2 p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-[11px] text-red-300 leading-relaxed space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-red-200">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                    <span>Atenção: Link do tipo "blob:" detectado!</span>
                  </div>
                  <p>
                    Esse link temporário só existe na memória do seu navegador e ficará quebrado para os leitores. 
                    <strong> Salve a foto no seu computador e use o botão acima &quot;Escolher Arquivo do Computador&quot;!</strong>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Legenda da Imagem</label>
              <input
                type="text"
                value={coverCaption}
                onChange={(e) => setCoverCaption(e.target.value)}
                placeholder="Ex: Foto de divulgação oficial da produtora."
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Crédito / Fonte da Foto</label>
              <input
                type="text"
                value={coverSource}
                onChange={(e) => setCoverSource(e.target.value)}
                placeholder="Ex: Divulgação / PlayStation Studios"
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Tags Box */}
          <div className="p-5 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white block pb-2 border-b border-neutral-800">
              Tags &amp; Tópicos
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Digite a tag e pressione Enter..."
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 flex items-center gap-1.5"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-neutral-500 hover:text-red-400 text-xs"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Media Selection Modal */}
      {mediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12141c] border border-neutral-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {modalMode === 'cover' ? 'Selecionar Imagem de Capa' : 'Inserir Imagem no Conteúdo'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Selecione uma imagem já enviada ou faça o upload de um novo arquivo do seu computador.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMediaModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Upload Bar */}
            <div className="p-4 bg-neutral-950/60 border-b border-neutral-800 flex items-center justify-between gap-3">
              <span className="text-xs text-neutral-300 font-medium">
                Deseja enviar outra imagem agora?
              </span>
              <label className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all">
                {uploadingInModal ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando arquivo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload de Novo Arquivo</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
                  disabled={uploadingInModal}
                  onChange={handleModalFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Modal Media Grid */}
            <div className="flex-1 overflow-y-auto p-5">
              {loadingMedia ? (
                <div className="py-12 flex flex-col items-center justify-center text-neutral-400 text-xs gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                  <span>Carregando biblioteca de mídia...</span>
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-neutral-800">
                  <ImageIcon className="w-10 h-10 text-neutral-600 mb-2" />
                  <span className="text-xs font-bold text-white">Nenhuma imagem na biblioteca ainda</span>
                  <p className="text-[11px] text-neutral-500 mt-1 max-w-xs">
                    Use o botão &quot;Upload de Novo Arquivo&quot; acima para enviar suas fotos e ilustrações!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectMedia(item)}
                      className="group relative rounded-xl overflow-hidden border border-neutral-800 hover:border-red-500 bg-neutral-900 cursor-pointer transition-all aspect-video flex items-center justify-center"
                    >
                      <img
                        src={item.url}
                        alt={item.alt_text || item.original_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                        <span className="text-[10px] font-bold text-white truncate block">
                          {item.original_name || 'Imagem'}
                        </span>
                        <span className="text-[9px] text-red-400 font-semibold mt-0.5">
                          {modalMode === 'cover' ? 'Clique para usar como Capa' : 'Clique para inserir no Texto'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500 bg-neutral-950/40">
              <span>{mediaItems.length} arquivo(s) disponível(is)</span>
              <button
                type="button"
                onClick={() => setMediaModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
