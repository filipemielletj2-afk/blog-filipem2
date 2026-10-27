'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Portal error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-800 text-red-500 flex items-center justify-center shadow-lg shadow-red-600/20">
        <AlertCircle className="w-7 h-7" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">Ops, algo inesperado aconteceu</h2>
        <p className="text-xs text-neutral-400 mt-1 max-w-md">
          {error?.message || 'Houve uma falha ao renderizar a página. Clique abaixo para tentar novamente.'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Recarregar</span>
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Início</span>
        </Link>
      </div>
    </div>
  );
}
