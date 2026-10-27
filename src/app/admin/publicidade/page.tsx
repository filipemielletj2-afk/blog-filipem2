'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPublicidadeRedirect() {
  const router = useRouter();

  useEffect(() => {
    window.location.replace('/admin/monetizacao');
  }, []);

  return (
    <div className="py-20 flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs text-neutral-400">Carregando painel de monetização...</span>
    </div>
  );
}
