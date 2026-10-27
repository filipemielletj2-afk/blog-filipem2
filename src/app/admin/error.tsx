'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-800 text-red-500 flex items-center justify-center shadow-lg shadow-red-600/20">
        <AlertCircle className="w-7 h-7" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">Ops, ocorreu uma instabilidade temporária</h2>
        <p className="text-xs text-neutral-400 mt-1 max-w-md">
          {error?.message || 'Não foi possível carregar este módulo. Tente recarregar ou desativar bloqueadores de anúncios caso esteja na área de publicidade.'}
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Tentar Novamente</span>
      </button>
    </div>
  );
}
