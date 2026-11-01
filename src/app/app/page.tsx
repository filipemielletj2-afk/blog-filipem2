'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  Lock,
  Key,
  Smartphone,
  Monitor,
  Download,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  Laptop
} from 'lucide-react';

export default function DedicatedAppPage() {
  const [keyInput, setKeyInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if key is in query params
    const params = new URLSearchParams(window.location.search);
    const keyParam = params.get('key') || params.get('secret');

    // Capture PWA install prompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Try auto-unlock if key exists in query or localStorage
    const savedKey = keyParam || localStorage.getItem('filipem2_master_gateway_key');
    if (savedKey) {
      unlockWithKey(savedKey);
    } else {
      setLoading(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const unlockWithKey = async (keyToTest: string) => {
    setVerifying(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/gateway/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: keyToTest.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsUnlocked(true);
        localStorage.setItem('filipem2_master_gateway_key', keyToTest.trim());
      } else {
        setErrorMsg(data.error || 'Chave de acesso incorreta.');
        setIsUnlocked(false);
      }
    } catch (err: any) {
      setErrorMsg('Falha ao verificar chave: ' + err.message);
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  };

  const handleManualUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    unlockWithKey(keyInput.trim());
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'Para instalar no seu tablet ou celular:\n1. Toque nos 3 pontinhos do navegador\n2. Selecione "Adicionar à tela de início" ou "Instalar Aplicativo".'
      );
    }
  };

  const handleDownloadWindowsLauncher = () => {
    const batContent = `@echo off
title BLOG FILIPEM2 - Painel Administrativo Exclusivo
echo ========================================================
echo  INICIANDO APLICATIVO EXCLUSIVO BLOG FILIPEM2
echo ========================================================
echo.
set APP_URL=https://blogfilipem2.site/app?key=miellet-admin-secret-2026

REM 1. Tentar abrir no Microsoft Edge em modo Standalone App
where msedge >nul 2>nul
if %errorlevel% equ 0 (
    start msedge --app="%APP_URL%" --window-size=1360,880
    exit
)

REM 2. Tentar abrir no Google Chrome em modo Standalone App
where chrome >nul 2>nul
if %errorlevel% equ 0 (
    start chrome --app="%APP_URL%" --window-size=1360,880
    exit
)

REM 3. Fallback Navegador Padrao
start "" "%APP_URL%"
exit
`;
    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BLOG-FILIPEM2-ADMIN.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-neutral-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-black text-white shadow-lg shadow-red-600/30">
            F
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-500 block">
              APLICATIVO EXCLUSIVO
            </span>
            <h1 className="text-lg font-black text-white tracking-wide">
              BLOG FILIPEM2
            </h1>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase flex items-center gap-1.5 ${
            isUnlocked
              ? 'bg-emerald-950 border border-emerald-700 text-emerald-400'
              : 'bg-red-950 border border-red-800 text-red-400'
          }`}
        >
          {isUnlocked ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          <span>{isUnlocked ? 'Dispositivo Autorizado' : 'Acesso Protegido'}</span>
        </span>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto w-full py-10">
        {!isUnlocked ? (
          /* Locked State: Enter Master Key */
          <div className="p-8 rounded-3xl bg-[#12141c] border border-neutral-800 shadow-2xl space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-500 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Painel Oculto e Protegido
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
                Este portal foi completamente camuflado. Visitantes comuns recebem erro 404. Digite sua Chave Mestra para liberar este dispositivo:
              </p>
            </div>

            <form onSubmit={handleManualUnlock} className="space-y-4 max-w-md mx-auto text-left">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-red-500" />
                  <span>Sua Chave Mestra de Acesso</span>
                </label>
                <input
                  type="password"
                  required
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="miellet-admin-secret-2026"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500 shadow-inner"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Desbloquear Meu Acesso</span>
              </button>
            </form>
          </div>
        ) : (
          /* Unlocked State: App Launch & Install Options */
          <div className="space-y-6">
            {/* Primary Action: Go to Admin */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#12141c] via-[#171926] to-[#1e1322] border border-neutral-800 shadow-2xl space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-700/80 text-emerald-400 shadow-lg shadow-emerald-950/50">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                  Acesso Exclusivo Concedido
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Bem-vindo, Filipe!
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-lg mx-auto">
                  Seu dispositivo está registrado com chave de segurança válida por 30 dias. O painel administrativo está liberado exclusivamente para você.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/admin"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/40 hover:scale-[1.02] transition-all"
                >
                  <span>Abrir Meu Painel Administrativo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Install Options Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#12141c] border border-neutral-800 shadow-xl space-y-6">
              <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Instalar este Aplicativo no seu Dispositivo</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Abra o painel com 1 toque direto da sua área de trabalho ou tela do tablet.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tablet / Mobile Option */}
                <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-400 flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <strong className="text-white text-sm block">No Tablet / Celular (Android)</strong>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Toque no botão abaixo ou abra o menu do navegador (3 pontinhos) e toque em <strong>&quot;Instalar Aplicativo&quot;</strong>. O ícone oficial aparecerá na tela inicial do seu tablet!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleInstallApp}
                    className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-neutral-700"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                    <span>{isInstalled ? 'Aplicativo Já Instalado' : 'Instalar no Tablet'}</span>
                  </button>
                </div>

                {/* PC / Windows Option */}
                <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800 text-blue-400 flex items-center justify-center">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <strong className="text-white text-sm block">No Computador (Windows)</strong>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Baixe o atalho executável para a sua Área de Trabalho. Ele abre o painel em janela isolada de aplicativo, sem barra de URL e já autenticado!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadWindowsLauncher}
                    className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-neutral-700"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Baixar Atalho para Windows (.bat)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-6 border-t border-neutral-900 text-center text-xs text-neutral-500">
        &copy; {new Date().getFullYear()} BLOG FILIPEM2 &bull; Sistema de Acesso Exclusivo &bull; Segurança de Nível Militar
      </footer>
    </div>
  );
}
