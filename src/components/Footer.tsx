import React from 'react';
import Link from 'next/link';
import { Shield, ArrowUp, Heart } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

interface FooterProps {
  categories?: Array<{ name: string; slug: string }>;
  footerText?: string;
}

export default function Footer({ categories = [], footerText }: FooterProps) {
  return (
    <footer className="bg-[#08090b] border-t border-neutral-800/80 text-neutral-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 relative flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <polygon points="50,10 88,32 88,68 50,90 12,68 12,32" fill="#171922" stroke="#DC2626" strokeWidth="4" />
                  <path d="M 32 35 L 68 35 L 60 48 L 42 48 L 38 58 L 56 58 L 50 70 L 28 70 Z" fill="#DC2626" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                BLOG FILIPE<span className="text-red-600">M2</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed pr-6">
              Portal independente e profissional de jornalismo, análises e tendências sobre games, músicas, filmes, séries, tecnologia e cultura geek. Informação de qualidade, transparência e paixão pelo entretenimento.
            </p>
            <div className="flex items-center space-x-3 text-xs text-neutral-500 pt-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Servidores 100% operacionais</span>
              <span>•</span>
              <span>LGPD Compliant</span>
            </div>
          </div>

          {/* Categories Col */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white border-l-2 border-red-600 pl-2.5">
              Categorias
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/categoria/games" className="hover:text-red-400 transition-colors">Games &amp; Consoles</Link>
              </li>
              <li>
                <Link href="/categoria/musicas" className="hover:text-red-400 transition-colors">Músicas &amp; Festivais</Link>
              </li>
              <li>
                <Link href="/categoria/filmes" className="hover:text-red-400 transition-colors">Filmes &amp; Cinema</Link>
              </li>
              <li>
                <Link href="/categoria/series" className="hover:text-red-400 transition-colors">Séries &amp; Streaming</Link>
              </li>
              <li>
                <Link href="/categoria/cultura-geek-tecnologia" className="hover:text-red-400 transition-colors">Geek &amp; Tecnologia</Link>
              </li>
            </ul>
          </div>

          {/* Institutional Col */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white border-l-2 border-red-600 pl-2.5">
              Institucional
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sobre" className="hover:text-red-400 transition-colors">Sobre Nós</Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-red-400 transition-colors">Fale Conosco</Link>
              </li>
              <li>
                <Link href="/correcoes" className="hover:text-red-400 transition-colors">Política de Correções</Link>
              </li>
              <li>
                <Link href="/publicidade" className="hover:text-red-400 transition-colors">Publicidade &amp; Parcerias</Link>
              </li>
              <li>
                <Link href="/admin" className="text-neutral-500 hover:text-red-400 transition-colors flex items-center space-x-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Painel do Administrador</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / LGPD Col */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white border-l-2 border-red-600 pl-2.5">
              Políticas &amp; LGPD
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacidade" className="hover:text-red-400 transition-colors">Política de Privacidade</Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-red-400 transition-colors">Política de Cookies</Link>
              </li>
              <li>
                <Link href="/termos" className="hover:text-red-400 transition-colors">Termos de Uso</Link>
              </li>
              <li>
                <Link href="/direitos-autorais" className="hover:text-red-400 transition-colors">Direitos Autorais (DMCA)</Link>
              </li>
              <li>
                <Link href="/sitemap.xml" target="_blank" className="hover:text-red-400 transition-colors">Sitemap XML</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 mt-10 border-t border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>
            {footerText || '© 2026 BLOG FILIPEM2. Todos os direitos reservados.'}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400">Idioma:</span>
              <LanguageSelector compact />
            </div>
            <span>Desenvolvido com excelência técnica para a comunidade geek.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
