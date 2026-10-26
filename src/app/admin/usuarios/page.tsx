'use client';

import React, { useState, useEffect } from 'react';
import { Users, Lock, Save, CheckCircle2, AlertCircle, Loader2, ShieldCheck, User } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data || []);

      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData?.user) {
        setCurrentUser(meData.user);
        setName(meData.user.name || '');
        setEmail(meData.user.email || '');
        setAvatar(meData.user.avatar || '');
        setBio(meData.user.bio || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, avatar, bio })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar dados.');

      setNotification({ type: 'success', text: 'Dados e credenciais de segurança atualizados com sucesso!' });
      setPassword('');
      loadUsers();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Users className="w-7 h-7 text-red-500" />
          <span>Usuários, Redação &amp; Segurança</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Gerencie acessos ao painel administrativo e atualize suas credenciais com criptografia forte.
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
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Form Column */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#12141c] border border-neutral-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-500" />
            <span>Editar Meu Perfil &amp; Senha de Acesso</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">E-mail Administrativo</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Nova Senha (Deixe em branco se não desejar alterar)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres fortes"
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Foto de Perfil (URL do Avatar)</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">Biografia do Autor (Exibida ao final dos artigos)</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500 leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Atualizar Meu Perfil</span>
              </button>
            </div>
          </form>
        </div>

        {/* Users List Column */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#12141c] border border-neutral-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
            Equipe com Acesso ao Painel ({users.length})
          </h3>

          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-neutral-700" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white text-xs font-bold">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <strong className="text-white text-xs block">{u.name}</strong>
                    <span className="text-[11px] text-neutral-400 font-mono">{u.email}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded bg-red-950/80 border border-red-800 text-red-400 text-[10px] font-mono font-bold uppercase">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
