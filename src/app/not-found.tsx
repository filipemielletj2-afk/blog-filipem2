import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#090a0f]">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-[#12141c] border border-neutral-800 shadow-2xl">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-500 text-3xl font-black">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Página Não Encontrada
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            O endereço que você tentou acessar não existe, foi removido ou está temporariamente indisponível.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/30"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
