'use client';

import React, { useState } from 'react';
import { Database, Download, Upload, CheckCircle2, AlertCircle, Loader2, ShieldCheck, FileJson, RefreshCw } from 'lucide-react';

export default function AdminBackupPage() {
  const [downloading, setDownloading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDownloadBackup = async () => {
    setDownloading(true);
    setNotification(null);
    try {
      const res = await fetch('/api/backup');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Falha ao gerar o arquivo de backup.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().slice(0, 10);
      a.download = `blog-filipem2-backup-${today}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      setNotification({
        type: 'success',
        text: 'Arquivo de backup baixado com sucesso! Guarde este arquivo em seu computador como cópia de segurança.'
      });
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Erro ao baixar arquivo de backup.' });
    } finally {
      setDownloading(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Atenção: A restauração irá sincronizar todos os artigos, categorias, páginas e configurações contidas no arquivo de backup. Deseja prosseguir?')) {
      e.target.value = '';
      return;
    }

    setImporting(true);
    setNotification(null);

    try {
      const text = await file.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error('O arquivo selecionado não é um arquivo JSON válido.');
      }

      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao restaurar backup.');

      setNotification({
        type: 'success',
        text: data.message || 'Backup restaurado com sucesso! Todos os artigos e dados estão sincronizados.'
      });
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
          Exporte cópias integrais de artigos, categorias, layout, páginas legais e configurações para salvaguarda permanente.
        </p>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
              : 'bg-red-950/80 border border-red-800 text-red-400'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-800 text-red-500 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Exportar Backup Completo (JSON)</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Baixa um arquivo com todos os seus <strong>artigos, textos, categorias, tags, páginas e seções</strong> do portal. Ideal para guardar no seu computador ou pen-drive.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadBackup}
            disabled={downloading}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gerando Arquivo de Backup...</span>
              </>
            ) : (
              <>
                <FileJson className="w-4 h-4" />
                <span>Baixar Backup Completo</span>
              </>
            )}
          </button>
        </div>

        {/* Import Card */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-800 text-blue-500 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Restaurar / Importar Dados</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Envie um arquivo de backup baixado anteriormente para recuperar instantaneamente artigos, títulos, categorias e configurações.
              </p>
            </div>
          </div>

          <label className="w-full py-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all">
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                <span>Importando e Sincronizando...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Selecionar Arquivo de Backup (.json)</span>
              </>
            )}
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportBackup}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>

        {/* Info Box */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-[#101218] border border-neutral-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Dica de Segurança e Preservação de Conteúdo</span>
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Sempre que publicar grandes lotes de novos artigos ou alterar o layout do portal, recomendamos clicar no botão <strong>"Baixar Backup Completo"</strong> acima. Esse arquivo é leve, fica no seu computador e permite restaurar todo o seu trabalho a qualquer momento com apenas 1 clique!
          </p>
        </div>
      </div>
    </div>
  );
}
