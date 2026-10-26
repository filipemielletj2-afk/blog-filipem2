'use client';

import React, { useState } from 'react';
import { Database, Download, Upload, CheckCircle2, AlertCircle, Loader2, ShieldCheck, FileJson } from 'lucide-react';

export default function AdminBackupPage() {
  const [downloading, setDownloading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDownloadBackup = () => {
    setDownloading(true);
    window.location.href = '/api/backup';
    setTimeout(() => setDownloading(false), 2000);
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Atenção: A importação irá sobrescrever configurações e seções do construtor visual. Deseja prosseguir?')) {
      e.target.value = '';
      return;
    }

    setImporting(true);
    setNotification(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao importar backup.');

      setNotification({ type: 'success', text: 'Backup restaurado com sucesso!' });
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Database className="w-7 h-7 text-red-500" />
          <span>Backups &amp; Segurança dos Dados</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Exporte cópias integrais de artigos, layout, páginas legais e configurações para salvaguarda.
        </p>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
              : 'bg-red-950/80 border border-red-800 text-red-400'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-800 text-red-500 flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Exportar Backup Completo (JSON)</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Gera um arquivo estruturado com todos os artigos, categorias, tags, páginas legais e configurações do construtor de páginas.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            disabled={downloading}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileJson className="w-4 h-4" />}
            <span>Baixar Arquivo de Backup</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-800 text-blue-500 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Restaurar Configurações e Seções</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Importe um arquivo de backup previamente exportado para recuperar dados e estilos do portal.
            </p>
          </div>

          <label className="w-full py-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{importing ? 'Processando Restauração...' : 'Selecionar Arquivo JSON'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>

        {/* SQLite Native Backup Instructions */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-[#101218] border border-neutral-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Backup Físico do Banco de Dados SQLite</span>
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            O banco de dados relacional deste portal é armazenado com alta performance no arquivo físico local:
            <code className="text-red-400 font-mono bg-neutral-900 px-2 py-0.5 rounded ml-1">
              data/filipem2.sqlite
            </code>.
            Para fazer um backup integral a frio em servidores ou em ambiente de produção, basta copiar o arquivo <code className="text-neutral-300 font-mono">data/filipem2.sqlite</code> e a pasta <code className="text-neutral-300 font-mono">public/uploads/</code> para um local seguro ou nuvem.
          </p>
        </div>
      </div>
    </div>
  );
}
