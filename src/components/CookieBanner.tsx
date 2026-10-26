'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, Check, X, Settings2 } from 'lucide-react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [prefAnalytics, setPrefAnalytics] = useState(true);
  const [prefMarketing, setPrefMarketing] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('filipem2_cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      'filipem2_cookie_consent',
      JSON.stringify({ essential: true, analytics: true, marketing: true, date: new Date().toISOString() })
    );
    setVisible(false);
    setShowPreferences(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem(
      'filipem2_cookie_consent',
      JSON.stringify({ essential: true, analytics: false, marketing: false, date: new Date().toISOString() })
    );
    setVisible(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(
      'filipem2_cookie_consent',
      JSON.stringify({ essential: true, analytics: prefAnalytics, marketing: prefMarketing, date: new Date().toISOString() })
    );
    setVisible(false);
    setShowPreferences(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-gradient-to-t from-black via-[#0c0d10] to-[#0c0d10]/95 border-t border-neutral-800 shadow-2xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-red-950/60 border border-red-800/60 rounded-xl text-red-500 shrink-0">
              <Cookie className="w-6 h-6" />
            </div>
            <div className="text-sm">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                Sua Privacidade e Controle de Cookies (LGPD)
              </h4>
              <p className="text-neutral-400 mt-1 leading-relaxed max-w-3xl">
                O <strong>BLOG FILIPEM2</strong> utiliza cookies essenciais para o funcionamento seguro do site e cookies anônimos para aprimorar sua experiência de navegação e desempenho das páginas, em estrita conformidade com a Lei Federal nº 13.709/2018 (LGPD).
                Você pode conferir todos os detalhes em nossa{' '}
                <Link href="/privacidade" className="text-red-400 underline hover:text-red-300">
                  Política de Privacidade
                </Link>{' '}
                e na{' '}
                <Link href="/cookies" className="text-red-400 underline hover:text-red-300">
                  Política de Cookies
                </Link>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowPreferences(true)}
              className="px-4 py-2.5 rounded-xl border border-neutral-700 hover:border-neutral-500 bg-neutral-900/80 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              <span>Gerenciar</span>
            </button>
            <button
              onClick={handleAcceptEssential}
              className="px-4 py-2.5 rounded-xl border border-neutral-700 hover:border-neutral-500 bg-neutral-900 text-neutral-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Apenas Essenciais
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all"
            >
              Aceitar Todos
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#14161f] border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Cookie className="w-5 h-5 text-red-500" />
                Preferências de Privacidade
              </h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-3.5 bg-neutral-900/70 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-white">Cookies Estritamente Necessários</h5>
                  <p className="text-xs text-neutral-400 mt-0.5">Essenciais para a segurança, autenticação e funcionamento das páginas.</p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded">Sempre Ativo</span>
              </div>

              <div className="p-3.5 bg-neutral-900/70 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-white">Cookies de Desempenho e Estatísticas</h5>
                  <p className="text-xs text-neutral-400 mt-0.5">Métricas de leitura e tempo de carregamento de forma agregada e anônima.</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefAnalytics}
                  onChange={(e) => setPrefAnalytics(e.target.checked)}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>

              <div className="p-3.5 bg-neutral-900/70 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-white">Cookies de Preferências Estéticas</h5>
                  <p className="text-xs text-neutral-400 mt-0.5">Lembram sua escolha de Modo Claro ou Modo Escuro no dispositivo.</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefMarketing}
                  onChange={(e) => setPrefMarketing(e.target.checked)}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Salvar Preferências
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
