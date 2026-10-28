'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  FileJson,
  RefreshCw,
  Cloud,
  CloudLightning,
  ExternalLink,
  Save,
  Check,
  Clock,
  Sparkles,
  Zap,
  Lock
} from 'lucide-react';

export default function AdminBackupPage() {
  const [downloading, setDownloading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cloud Auto-Sync State
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [autoBackupProvider, setAutoBackupProvider] = useState<'pantry' | 'custom'>('pantry');
  const [pantryId, setPantryId] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [testingSync, setTestingSync] = useState(false);

  useEffect(() => {
    loadAutoBackupConfig();
  }, []);

  const loadAutoBackupConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch('/api/backup/auto-sync');
      if (res.ok) {
        const data = await res.json();
        setAutoBackupEnabled(Boolean(data.enabled));
        setAutoBackupProvider(data.provider === 'custom' ? 'custom' : 'pantry');
        setPantryId(data.pantryId || '');
        setCustomUrl(data.customUrl || '');
        setLastSync(data.lastSync || null);
      }
    } catch (err) {
      console.error('Erro ao carregar configurações de sincronização:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

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

  const handleSaveAutoBackup = async () => {
    setSavingConfig(true);
    setNotification(null);
    try {
      const res = await fetch('/api/backup/auto-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          enabled: autoBackupEnabled,
          provider: autoBackupProvider,
          pantryId: pantryId.trim(),
          customUrl: customUrl.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar configurações.');

      setNotification({
        type: 'success',
        text: data.message || 'Configurações de sincronização salvas com sucesso!'
      });
      loadAutoBackupConfig();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleTestSync = async () => {
    if (autoBackupProvider === 'pantry' && !pantryId.trim()) {
      setNotification({ type: 'error', text: 'Por favor, insira o seu Pantry ID antes de testar a sincronização.' });
      return;
    }

    setTestingSync(true);
    setNotification(null);
    try {
      const res = await fetch('/api/backup/auto-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_sync',
          enabled: true,
          provider: autoBackupProvider,
          pantryId: pantryId.trim(),
          customUrl: customUrl.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao sincronizar com a nuvem.');

      setNotification({
        type: 'success',
        text: data.message || 'Backup na nuvem realizado com sucesso!'
      });
      setLastSync(new Date().toISOString());
      setAutoBackupEnabled(true);
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setTestingSync(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Database className="w-7 h-7 text-red-500" />
          <span>Backups &amp; Segurança dos Dados</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Exporte cópias manuais ou ative a sincronização automática em nuvem (Anti-Sleep) para nunca perder nenhum artigo.
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

      {/* CLOUD AUTO-BACKUP & ANTI-SLEEP SECTION */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#131622] via-[#0f1118] to-[#0a0b10] border border-neutral-800 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                <CloudLightning className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Sincronização Automática em Nuvem (Anti-Sleep)
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                      autoBackupEnabled && (pantryId || customUrl)
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                    }`}
                  >
                    {autoBackupEnabled && (pantryId || customUrl) ? 'Ativo & Protegido' : 'Desativado'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                  Toda vez que você salva ou altera um artigo ou layout, o site envia automaticamente uma cópia para a nuvem. Quando a hospedagem (Render) acorda da hibernação (sleep), ela restaura o último backup automaticamente antes de carregar o site!
                </p>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none bg-neutral-900/80 px-4 py-2.5 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-all self-start sm:self-auto">
              <input
                type="checkbox"
                checked={autoBackupEnabled}
                onChange={e => setAutoBackupEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 focus:ring-offset-neutral-900 accent-red-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {autoBackupEnabled ? 'Backup Automático Ativado' : 'Ativar Backup Automático'}
              </span>
            </label>
          </div>

          {loadingConfig ? (
            <div className="py-8 flex items-center justify-center gap-2 text-neutral-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
              <span>Carregando configurações de nuvem...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Provider Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                  Provedor de Armazenamento em Nuvem
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                  <button
                    type="button"
                    onClick={() => setAutoBackupProvider('pantry')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      autoBackupProvider === 'pantry'
                        ? 'bg-red-950/40 border-red-600/80 text-white shadow-lg shadow-red-950/50'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5 text-white">
                        <span>Pantry Cloud</span>
                        <span className="text-[10px] bg-red-600/20 text-red-400 px-1.5 py-0.5 rounded font-black">
                          Recomendado
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        100% Grátis, sem cartão, setup em 10 segundos
                      </div>
                    </div>
                    {autoBackupProvider === 'pantry' && <Check className="w-4 h-4 text-red-500 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAutoBackupProvider('custom')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      autoBackupProvider === 'custom'
                        ? 'bg-red-950/40 border-red-600/80 text-white shadow-lg shadow-red-950/50'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white">Webhook Personalizado</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        Endpoint REST / JSONBin próprio
                      </div>
                    </div>
                    {autoBackupProvider === 'custom' && <Check className="w-4 h-4 text-red-500 shrink-0" />}
                  </button>
                </div>
              </div>

              {/* Pantry Form */}
              {autoBackupProvider === 'pantry' && (
                <div className="space-y-4 max-w-2xl bg-neutral-950/50 p-5 rounded-2xl border border-neutral-800/80">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Pantry ID</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <a
                        href="https://getpantry.cloud"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Como pegar meu Pantry ID Grátis</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <input
                      type="text"
                      value={pantryId}
                      onChange={e => setPantryId(e.target.value)}
                      placeholder="Ex: 12345678-abcd-ef01-2345-6789abcdef01"
                      className="w-full bg-[#0d0e14] border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 font-mono transition-colors"
                    />
                  </div>

                  {/* Step-by-step Tutorial */}
                  <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 text-[11px] text-neutral-400 space-y-2">
                    <p className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Passo a passo rápido (Leva 15 segundos):</span>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-neutral-300">
                      <li>
                        Acesse{' '}
                        <a
                          href="https://getpantry.cloud"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-400 underline font-semibold"
                        >
                          getpantry.cloud
                        </a>
                        .
                      </li>
                      <li>Clique no botão amarelo <strong>&quot;Get Started&quot;</strong> e digite seu e-mail.</li>
                      <li>O site gerará instantaneamente o seu <strong>Pantry ID</strong>.</li>
                      <li>Copie o código e cole no campo acima!</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Custom Webhook Form */}
              {autoBackupProvider === 'custom' && (
                <div className="space-y-4 max-w-2xl bg-neutral-950/50 p-5 rounded-2xl border border-neutral-800/80">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white block">URL do Webhook REST</label>
                    <input
                      type="url"
                      value={customUrl}
                      onChange={e => setCustomUrl(e.target.value)}
                      placeholder="https://seu-servidor.com/api/backup-webhook"
                      className="w-full bg-[#0d0e14] border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 font-mono transition-colors"
                    />
                    <p className="text-[11px] text-neutral-500">
                      O sistema enviará uma requisição POST com o snapshot JSON integral de todos os artigos sempre que houver alteração.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons & Status */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveAutoBackup}
                  disabled={savingConfig || testingSync}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
                >
                  {savingConfig ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar Configuração</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleTestSync}
                  disabled={savingConfig || testingSync}
                  className="px-6 py-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {testingSync ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      <span>Testando Sincronização com a Nuvem...</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4 text-red-500" />
                      <span>Testar Sincronização Agora</span>
                    </>
                  )}
                </button>

                {lastSync && (
                  <div className="flex items-center gap-2 text-xs text-neutral-400 px-3 py-2 bg-neutral-900/60 rounded-xl border border-neutral-800 ml-auto">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      Última sincronização:{' '}
                      <strong className="text-white">
                        {new Date(lastSync).toLocaleString('pt-BR')}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Render Permanent Environment Tip */}
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-900/50 flex items-start gap-3 text-xs text-neutral-300">
                <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-blue-400">
                    Dica de Ouro para Persistência Total no Render:
                  </div>
                  <p className="leading-relaxed text-neutral-400">
                    Para que a configuração nunca se perca nem mesmo em novos Deploys no Render, adicione a variável de ambiente{' '}
                    <code className="text-white bg-black/40 px-1.5 py-0.5 rounded font-mono text-[11px]">
                      AUTO_BACKUP_PANTRY_ID
                    </code>{' '}
                    no painel do seu serviço no Render (aba <strong>Environment</strong>) com o seu Pantry ID. Dessa forma, seu blog fica 100% autônomo e à prova de sono!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MANUAL BACKUP SECTION (DOWNLOAD / UPLOAD JSON) */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-neutral-400" />
          <span>Backups Manuais em Arquivo (.json)</span>
        </h2>

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
              Sempre que publicar grandes lotes de novos artigos ou alterar o layout do portal, recomendamos clicar no botão <strong>&quot;Baixar Backup Completo&quot;</strong> acima. Esse arquivo é leve, fica no seu computador e permite restaurar todo o seu trabalho a qualquer momento com apenas 1 clique!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
