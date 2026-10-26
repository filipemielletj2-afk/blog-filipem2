'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { formatDateBR } from '@/lib/utils';

interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

interface CommentsSectionProps {
  articleId: number;
  allowComments: boolean;
  initialComments: Comment[];
}

export default function CommentsSection({
  articleId,
  allowComments,
  initialComments
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-bot honeypot
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!allowComments) {
    return (
      <section className="pt-8 border-t border-neutral-800">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400">
          Os comentários estão desativados para esta publicação.
        </div>
      </section>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !content) {
      setStatusMsg({ type: 'error', text: 'Por favor, preencha todos os campos.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article_id: articleId,
          author_name: name,
          author_email: email,
          content,
          honeypot
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao publicar comentário.');

      // Add to local state immediately
      setComments([
        {
          id: data.id || Date.now(),
          author_name: name,
          content,
          created_at: new Date().toISOString()
        },
        ...comments
      ]);

      setName('');
      setEmail('');
      setContent('');
      setStatusMsg({ type: 'success', text: 'Seu comentário foi publicado com sucesso!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pt-8 border-t border-neutral-800 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-red-500" />
          Comentários da Comunidade ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#14161f] border border-neutral-800 space-y-4 shadow-xl">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          Deixe sua Opinião
        </h4>
        <p className="text-xs text-neutral-400">
          Seu e-mail não será publicado. Comentários estão sujeitos a moderação e diretrizes de respeito.
        </p>

        {/* Hidden Honeypot */}
        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Seu Nome / Apelido *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Gamer"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Seu E-mail (Privado) *</label>
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
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Comentário *</label>
          <textarea
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="O que você achou desta matéria? Escreva com respeito e clareza..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500 leading-relaxed"
          />
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-400'
                : 'bg-red-950/70 border border-red-800 text-red-400'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <span>Enviando...</span> : <><span>Enviar Comentário</span><Send className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#12141c] border border-neutral-800 text-neutral-500 text-sm">
            Nenhum comentário publicado ainda. Seja o primeiro a comentar!
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="p-4 sm:p-5 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-red-400">
                    <User className="w-4 h-4" />
                  </div>
                  <strong className="text-sm text-white">{c.author_name}</strong>
                </div>
                <span className="text-[11px] text-neutral-500">{formatDateBR(c.created_at)}</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 pl-9 leading-relaxed">
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
