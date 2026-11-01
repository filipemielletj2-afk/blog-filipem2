'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';

interface NewsletterBoxProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  placeholder?: string;
}

export default function NewsletterBox({
  title = 'Boletim Semanal BLOG FILIPEM2',
  subtitle = 'Fique por dentro dos principais lançamentos de games, novidades musicais, filmes e tendências da cultura geek direto na sua caixa de entrada.',
  buttonText = 'Cadastrar Grátis',
  placeholder = 'Digite seu e-mail principal...'
}: NewsletterBoxProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao realizar inscrição.');

      setSubscribed(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao processar inscrição.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#191b26] to-[#0e1017] border border-neutral-800 p-8 sm:p-12 text-center shadow-2xl">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-red-950/80 border border-red-800 text-red-500 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {title}
          </h2>
          <p className="text-sm text-neutral-400">
            {subtitle}
          </p>

          {subscribed ? (
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2 max-w-md mx-auto">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Inscrição confirmada com sucesso! Em breve você receberá as novidades.</span>
            </div>
          ) : (
            <div className="space-y-3">
              <form onSubmit={handleSubmit} className="pt-2 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all shrink-0 disabled:opacity-60"
                >
                  {loading ? 'Cadastrando...' : buttonText}
                </button>
              </form>
              {errorMessage && (
                <p className="text-xs text-red-400 font-semibold">{errorMessage}</p>
              )}
            </div>
          )}

          <p className="text-[11px] text-neutral-500 flex items-center justify-center gap-1.5 pt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero spam. Cancele sua inscrição quando quiser. Conforme LGPD.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
