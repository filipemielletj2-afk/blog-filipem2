'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Loader2, BookOpen, ArrowRight } from 'lucide-react';
import { formatDateBR } from '@/lib/utils';

interface SearchModalProps {
  onClose: () => void;
}

export default function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/articles?search=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        setResults(data.articles || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#12141a] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-800">
          <Search className="w-5 h-5 text-neutral-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Pesquisar por notícias, jogos, filmes, séries, tecnologia..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-neutral-500 focus:outline-none text-base"
          />
          {loading && <Loader2 className="w-5 h-5 text-red-500 animate-spin mr-2 shrink-0" />}
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg shrink-0"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {query.trim().length >= 2 && results.length === 0 && !loading && (
            <div className="py-12 text-center text-neutral-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-neutral-600" />
              <p className="text-base font-medium text-neutral-300">Nenhum resultado encontrado para &quot;{query}&quot;</p>
              <p className="text-xs text-neutral-500 mt-1">Tente buscar por outras palavras-chave ou categorias.</p>
            </div>
          )}

          {results.map((art) => (
            <Link
              key={art.id}
              href={`/artigo/${art.slug}`}
              onClick={onClose}
              className="flex items-center p-3 rounded-xl hover:bg-neutral-800/80 transition-colors group"
            >
              {art.cover_image && (
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 mr-3.5 bg-neutral-900">
                  <img
                    src={art.cover_image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 text-xs mb-1">
                  <span
                    className="px-2 py-0.5 rounded font-semibold text-[11px]"
                    style={{ backgroundColor: `${art.category_color}22`, color: art.category_color }}
                  >
                    {art.category_name}
                  </span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-neutral-400 text-[11px]">{formatDateBR(art.published_at)}</span>
                </div>
                <h4 className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                  {art.title}
                </h4>
                <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                  {art.excerpt}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-red-400 ml-2 shrink-0 transition-colors" />
            </Link>
          ))}

          {query.trim().length >= 2 && results.length > 0 && (
            <div className="pt-3 border-t border-neutral-800 text-center">
              <Link
                href={`/busca?q=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-red-500 hover:text-red-400"
              >
                <span>Ver todos os resultados na página de busca</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
