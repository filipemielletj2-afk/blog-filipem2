'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, Loader2, Clock, Globe } from 'lucide-react';
import { formatDateTimeBR } from '@/lib/utils';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-red-500" />
            <span>Registro de Atividades &amp; Logs de Auditoria</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Rastreamento de ações administrativas, tentativas de acesso e alterações no portal.
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar Logs</span>
        </button>
      </div>

      <div className="rounded-2xl bg-[#12141c] border border-neutral-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <span className="text-xs text-neutral-400">Carregando logs de auditoria...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-xs text-neutral-500">
            Nenhum evento registrado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#161822] border-b border-neutral-800 text-neutral-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Data / Hora</th>
                  <th className="py-3 px-4">Ação</th>
                  <th className="py-3 px-4">Detalhes</th>
                  <th className="py-3 px-4">Usuário</th>
                  <th className="py-3 px-4">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-400">
                      {formatDateTimeBR(log.created_at)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-red-400 font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-300 font-sans max-w-md break-words">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-400 font-sans">
                      {log.user_name || 'Sistema / Visitante'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-500 text-[11px]">
                      {log.ip_address || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
