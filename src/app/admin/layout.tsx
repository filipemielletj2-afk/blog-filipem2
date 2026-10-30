'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  Layers,
  Image as ImageIcon,
  MessageSquare,
  FileCode,
  Megaphone,
  Globe,
  Palette,
  Users,
  ShieldAlert,
  Database,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { label: 'Visão Geral', href: '/admin', icon: LayoutDashboard },
  { label: 'Artigos (CMS)', href: '/admin/artigos', icon: FileText },
  { label: 'Editor Visual de Páginas', href: '/admin/builder', icon: Layers, highlight: true },
  { label: 'Categorias', href: '/admin/categorias', icon: FolderTree },
  { label: 'Tags', href: '/admin/tags', icon: Tags },
  { label: 'Biblioteca de Mídia', href: '/admin/midia', icon: ImageIcon },
  { label: 'Comentários', href: '/admin/comentarios', icon: MessageSquare },
  { label: 'Páginas & Políticas', href: '/admin/paginas', icon: FileCode },
  { label: 'Publicidade & Monetização', href: '/admin/monetizacao', icon: Megaphone },
  { label: 'SEO & Indexação', href: '/admin/seo', icon: Globe },
  { label: 'Aparência & Temas', href: '/admin/aparencia', icon: Palette },
  { label: 'Usuários & Permissões', href: '/admin/usuarios', icon: Users },
  { label: 'Logs de Auditoria', href: '/admin/logs', icon: ShieldAlert },
  { label: 'Backup & Restauração', href: '/admin/backup', icon: Database }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const rawPathname = usePathname();
  const pathname = rawPathname || '';
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          window.location.href = '/admin/login';
          return;
        }
        const data = await res.json();
        if (!data.user) {
          window.location.href = '/admin/login';
          return;
        }
        setUser(data.user);
        setLoading(false);
      } catch {
        window.location.href = '/admin/login';
      }
    };

    checkAuth();
  }, [pathname, isLoginPage]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0b0e] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-neutral-400">
            {loading ? 'Carregando Painel Administrativo...' : 'Redirecionando para login seguro...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0e] flex flex-col text-slate-100">
      {/* Top Mobile Bar */}
      <div className="lg:hidden bg-[#101217] border-b border-neutral-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
          <span className="font-black text-sm text-white">ADMIN FILIPEM2</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-neutral-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#101217] border-r border-neutral-800 flex flex-col justify-between transform transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo & Brand Header */}
          <div className="p-5 border-b border-neutral-800/80">
            <Link href="/" target="_blank" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center text-red-500 font-black text-xs">
                M2
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black tracking-wider text-white group-hover:text-red-400 transition-colors">
                  BLOG FILIPEM2
                </span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
                  Painel de Controle
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : item.highlight
                      ? 'bg-red-950/40 text-red-400 hover:bg-red-950/70 border border-red-900/40'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded">
                      NOVO
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer User Info */}
          <div className="p-4 border-t border-neutral-800/80 bg-[#0c0d12]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-xs shrink-0">
                    {user?.name?.[0] || 'A'}
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">{user?.name}</span>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block truncate">{user?.role}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Encerrar Sessão"
                className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0a0b0e] flex flex-col">
          {/* Top Desktop Navigation */}
          <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-[#101217] border-b border-neutral-800">
            <div className="flex items-center space-x-2 text-xs text-neutral-400">
              <span>Administração</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
              <span className="text-white font-semibold capitalize">
                {pathname.replace('/admin', '').replace('/', '') || 'Visão Geral'}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                target="_blank"
                className="px-3.5 py-1.5 rounded-lg border border-neutral-700 hover:border-neutral-500 text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>Ver Portal no Ar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </header>

          {/* Security Alert: Default credentials in use */}
          {user?.isDefaultPassword && (
            <div className="bg-amber-950/90 border-b border-amber-800/90 px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200 text-xs shadow-lg">
              <div className="flex items-center gap-2.5 font-medium">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  <strong className="text-amber-300 font-bold">Aviso de Segurança Crítico:</strong> Sua conta ainda está utilizando a senha padrão. Para impedir qualquer tentativa de invasão, altere sua senha e e-mail agora!
                </span>
              </div>
              <Link
                href="/admin/usuarios"
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider shrink-0 transition-all shadow-md"
              >
                Trocar Senha Agora
              </Link>
            </div>
          )}

          <div className="p-4 sm:p-8 flex-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
