'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Moon, Sun, Menu, X, Shield, ChevronRight } from 'lucide-react';
import SearchModal from './SearchModal';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  categories?: Array<{ name: string; slug: string; color?: string }>;
  siteTitle?: string;
}

export default function Header({ categories = [], siteTitle = 'BLOG FILIPEM2' }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Check saved theme
    const savedTheme = localStorage.getItem('filipem2_theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
      document.documentElement.classList.add('light-theme');
      document.body?.classList.add('light-theme');
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    if (isLightMode) {
      document.documentElement.classList.remove('light-theme');
      document.body?.classList.remove('light-theme');
      localStorage.setItem('filipem2_theme', 'dark');
      setIsLightMode(false);
    } else {
      document.documentElement.classList.add('light-theme');
      document.body?.classList.add('light-theme');
      localStorage.setItem('filipem2_theme', 'light');
      setIsLightMode(true);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 border-b ${
          isLightMode
            ? (isScrolled ? 'bg-white/95 backdrop-blur-md border-slate-200 shadow-md' : 'bg-white border-slate-200')
            : (isScrolled ? 'bg-[#0c0d10]/95 backdrop-blur-md border-neutral-800 shadow-xl' : 'bg-[#0c0d10] border-neutral-800/60')
        }`}
      >
        {/* Top mini bar */}
        <div
          className={`hidden lg:block border-b py-1.5 text-xs transition-colors ${
            isLightMode ? 'bg-slate-100/80 border-slate-200 text-slate-600' : 'bg-[#070709] border-neutral-900 text-neutral-400'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5 text-red-600 font-semibold tracking-wider text-[11px]">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                PORTAL OFICIAL
              </span>
              <span className={isLightMode ? 'text-slate-300' : 'text-neutral-600'}>•</span>
              <span className={isLightMode ? 'text-slate-600' : 'text-neutral-400'}>
                Notícias, análises e cultura geek atualizadas diariamente
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/sobre" className={`transition-colors ${isLightMode ? 'text-slate-600 hover:text-red-600' : 'hover:text-red-400'}`}>
                Sobre Nós
              </Link>
              <Link href="/contato" className={`transition-colors ${isLightMode ? 'text-slate-600 hover:text-red-600' : 'hover:text-red-400'}`}>
                Contato
              </Link>
              <Link
                href="/admin"
                className={`flex items-center space-x-1 font-semibold transition-colors ${
                  isLightMode ? 'text-red-600 hover:text-red-700' : 'text-neutral-500 hover:text-red-400'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Painel Admin</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Header bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 relative flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full transform transition-transform group-hover:scale-105 duration-300">
                  <polygon points="50,10 88,32 88,68 50,90 12,68 12,32" fill={isLightMode ? '#f1f5f9' : '#171922'} stroke="#DC2626" strokeWidth="4" />
                  <path d="M 32 35 L 68 35 L 60 48 L 42 48 L 38 58 L 56 58 L 50 70 L 28 70 Z" fill="#DC2626" />
                  <circle cx="70" cy="65" r="4" fill={isLightMode ? '#DC2626' : '#FFFFFF'} />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold tracking-[0.25em] text-red-600 uppercase leading-none">
                  Portal &amp; Magazine
                </span>
                <span className={`text-xl sm:text-2xl font-black tracking-tight transition-colors ${
                  isLightMode ? 'text-slate-900 group-hover:text-red-600' : 'text-white group-hover:text-red-100'
                }`}>
                  BLOG FILIPE<span className="text-red-600">M2</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <Link
                href="/"
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isLightMode
                    ? 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                Início
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categoria/${cat.slug}`}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isLightMode
                      ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Language Selector */}
              <LanguageSelector />

              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className={`p-2.5 rounded-lg transition-colors ${
                  isLightMode
                    ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                }`}
                title="Pesquisar artigos (Ctrl+K)"
                aria-label="Pesquisar"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-lg transition-colors ${
                  isLightMode
                    ? 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-neutral-800/70'
                }`}
                title={isLightMode ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
                aria-label="Alternar Tema"
              >
                {isLightMode ? <Moon className="w-5 h-5 text-indigo-600" /> : <Sun className="w-5 h-5 text-amber-400" />}
              </button>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2.5 rounded-lg transition-colors ${
                  isLightMode
                    ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                }`}
                aria-label="Menu Principal"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-b px-4 pt-3 pb-6 space-y-1 animate-fadeIn ${
            isLightMode ? 'bg-white border-slate-200' : 'bg-[#0e1015] border-neutral-800'
          }`}>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 text-base font-medium rounded-lg ${
                isLightMode ? 'text-slate-900 hover:bg-slate-100' : 'text-white hover:bg-neutral-800'
              }`}
            >
              <span>Início</span>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 text-base font-medium rounded-lg ${
                  isLightMode ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <span>{cat.name}</span>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </Link>
            ))}
            <div className={`pt-3 pb-2 px-3 border-t flex items-center justify-between ${isLightMode ? 'border-slate-200' : 'border-neutral-800'}`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${isLightMode ? 'text-slate-600' : 'text-neutral-400'}`}>
                Idioma de Leitura:
              </span>
              <LanguageSelector compact />
            </div>

            <div className={`pt-4 border-t flex flex-col space-y-2 ${isLightMode ? 'border-slate-200' : 'border-neutral-800'}`}>
              <Link
                href="/sobre"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-sm ${isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-neutral-400 hover:text-white'}`}
              >
                Sobre o Blog
              </Link>
              <Link
                href="/contato"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-sm ${isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-neutral-400 hover:text-white'}`}
              >
                Fale Conosco
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-700 flex items-center space-x-1.5 font-semibold"
              >
                <Shield className="w-4 h-4" />
                <span>Acessar Painel Administrativo</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
