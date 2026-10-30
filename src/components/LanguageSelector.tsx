'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Globe, Check, ChevronDown, Search, Sparkles } from 'lucide-react';

export interface LanguageOption {
  code: string;
  name: string;
  native: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'pt', name: 'Português', native: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en', name: 'English', native: 'English (US/UK)', flag: '🇺🇸' },
  { code: 'es', name: 'Español', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', native: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', native: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', native: '日本語 (Japonês)', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', native: '한국어 (Coreano)', flag: '🇰🇷' },
  { code: 'zh-CN', name: '中文', native: '简体中文 (Chinês)', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', native: 'Русский (Russo)', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', native: 'العربية (Árabe)', flag: '🇸🇦' },
  { code: 'nl', name: 'Nederlands', native: 'Nederlands (Holandês)', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', native: 'Polski (Polonês)', flag: '🇵🇱' },
  { code: 'tr', name: 'Türkçe', native: 'Türkçe (Turco)', flag: '🇹🇷' },
  { code: 'hi', name: 'हिन्दी', native: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'sv', name: 'Svenska', native: 'Svenska (Sueco)', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk', native: 'Norsk (Norueguês)', flag: '🇳🇴' },
  { code: 'da', name: 'Dansk', native: 'Dansk (Dinamarquês)', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', native: 'Suomi (Finlandês)', flag: '🇫🇮' },
  { code: 'el', name: 'Ελληνικά', native: 'Ελληνικά (Grego)', flag: '🇬🇷' },
  { code: 'id', name: 'Bahasa Indonesia', native: 'Indonésio', flag: '🇮🇩' },
  { code: 'vi', name: 'Tiếng Việt', native: 'Vietnamita', flag: '🇻🇳' },
  { code: 'th', name: 'ไทย', native: 'Tailandês', flag: '🇹🇭' },
  { code: 'uk', name: 'Українська', native: 'Ucraniano', flag: '🇺🇦' },
  { code: 'cs', name: 'Čeština', native: 'Tcheco', flag: '🇨🇿' },
  { code: 'ro', name: 'Română', native: 'Romeno', flag: '🇷🇴' },
  { code: 'hu', name: 'Magyar', native: 'Húngaro', flag: '🇭🇺' },
  { code: 'he', name: 'עברית', native: 'Hebraico', flag: '🇮🇱' },
  { code: 'ms', name: 'Bahasa Melayu', native: 'Malaio', flag: '🇲🇾' },
  { code: 'tl', name: 'Filipino', native: 'Filipino / Tagalog', flag: '🇵🇭' }
];

interface LanguageSelectorProps {
  compact?: boolean;
}

export default function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentLang, setCurrentLang] = useState('pt');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize Google Translate Script
  useEffect(() => {
    // Read existing cookie if present
    const getSavedLang = () => {
      const match = document.cookie.match(/googtrans=\/pt\/([^;]+)/);
      return match ? match[1] : 'pt';
    };

    setCurrentLang(getSavedLang());

    // Window callback for Google Translate API
    (window as any).googleTranslateElementInit = () => {
      try {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'pt',
            autoDisplay: false,
            layout: (window as any).google.translate.TranslateElement.InlineLayout?.SIMPLE
          },
          'google_translate_element'
        );
      } catch (err) {
        console.error('Erro ao inicializar Google Translate:', err);
      }
    };

    // Inject Google Translate script if not present
    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);
    setSearchTerm('');

    const setCookie = (name: string, value: string, days = 365) => {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      const host = window.location.hostname;
      document.cookie = `${name}=${value}; expires=${expires}; path=/;`;
      document.cookie = `${name}=${value}; expires=${expires}; path=/; domain=${host};`;
      if (host.includes('.')) {
        const rootDomain = host.substring(host.indexOf('.'));
        document.cookie = `${name}=${value}; expires=${expires}; path=/; domain=${rootDomain};`;
      }
    };

    const clearCookie = (name: string) => {
      const host = window.location.hostname;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;
      if (host.includes('.')) {
        const rootDomain = host.substring(host.indexOf('.'));
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${rootDomain};`;
      }
    };

    if (langCode === 'pt') {
      clearCookie('googtrans');
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = 'pt';
        select.dispatchEvent(new Event('change'));
      }
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return;
    }

    // Set translation cookie to trigger Google Translate
    setCookie('googtrans', `/pt/${langCode}`);

    // Try triggering change event directly on Google's combo select
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    } else {
      // If select not ready yet, reload so the cookie takes effect
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  const currentOption = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  const filteredLanguages = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.native.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Hidden element for Google Translate script */}
      <div id="google_translate_element" style={{ display: 'none' }} aria-hidden="true" />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-xl border transition-all text-xs font-bold ${
          compact
            ? 'px-2.5 py-1.5 bg-neutral-900/80 border-neutral-700/80 hover:border-red-500 text-neutral-200'
            : 'px-3 py-2 bg-neutral-900 border-neutral-700 hover:border-red-500 text-white shadow-sm'
        }`}
        title="Escolha o idioma de leitura / Select language"
        aria-label="Selecionar Idioma"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none" role="img" aria-label={currentOption.name}>
          {currentOption.flag}
        </span>
        <span className="uppercase tracking-wider text-[11px] font-black">
          {currentOption.code.toUpperCase()}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-red-500' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 max-h-96 rounded-2xl bg-[#12141c] border border-neutral-800 shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Search */}
          <div className="p-3 bg-neutral-950/80 border-b border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-red-500" />
                <span>Traduzir Portal</span>
              </span>
              <span className="text-[10px] text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 font-mono">
                {LANGUAGES.length} idiomas
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar idioma / Search..."
                className="w-full bg-[#0a0b0e] border border-neutral-800 focus:border-red-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Languages List */}
          <div className="overflow-y-auto flex-1 p-1.5 space-y-0.5 max-h-64 scrollbar-thin scrollbar-thumb-neutral-800">
            {filteredLanguages.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-500">
                Nenhum idioma encontrado.
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-red-600/20 text-white font-bold border border-red-600/40'
                        : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0 leading-none" role="img" aria-label={lang.name}>
                        {lang.flag}
                      </span>
                      <div className="truncate">
                        <span className="block truncate font-medium text-white">
                          {lang.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 block truncate">
                          {lang.native}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-red-500 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-neutral-950/60 border-t border-neutral-800 text-[10px] text-neutral-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-red-500" />
              <span>Tradução instantânea com IA</span>
            </span>
            <span className="font-mono text-neutral-600">v2.0</span>
          </div>
        </div>
      )}
    </div>
  );
}
