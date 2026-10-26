'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Dúvida ou Sugestão Geral');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, honeypot })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar mensagem.');

      setStatus({ type: 'success', text: data.message || 'Mensagem enviada com sucesso!' });
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-8 border-t border-neutral-800 space-y-6">
      <div className="flex items-center space-x-2 text-white font-bold text-lg">
        <Mail className="w-5 h-5 text-red-500" />
        <h3>Formulário de Contato Direto</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot */}
        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex={-1}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Seu Nome *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Seu E-mail *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Assunto da Mensagem *</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-red-500"
          >
            <option value="Dúvida ou Sugestão Geral">Dúvida ou Sugestão Geral</option>
            <option value="Sugestão de Pauta / Novidade">Sugestão de Pauta / Novidade</option>
            <option value="Publicidade e Parcerias Comerciais">Publicidade e Parcerias Comerciais</option>
            <option value="Correção Editorial">Correção Editorial</option>
            <option value="Privacidade e Proteção de Dados (LGPD)">Privacidade e Proteção de Dados (LGPD)</option>
            <option value="Notificação de Direitos Autorais / DMCA">Notificação de Direitos Autorais / DMCA</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Mensagem *</label>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Detalhe sua mensagem, link ou proposta com clareza..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500"
          />
        </div>

        {status && (
          <div
            className={`p-3.5 rounded-xl flex items-center gap-2 text-xs font-medium ${
              status.type === 'success'
                ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-400'
                : 'bg-red-950/70 border border-red-800 text-red-400'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{status.text}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <span>Enviando...</span> : <><span>Enviar Mensagem</span><Send className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      </form>
    </div>
  );
}
