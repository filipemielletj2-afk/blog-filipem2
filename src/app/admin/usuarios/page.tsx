'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  User,
  Mail,
  Send,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  Key,
  Link2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react';

const APPS_SCRIPT_SNIPPET = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // 1. Envio de Notificacoes Oficiais por E-mail (100% Gratis e Seguro)
    if (data.action === "send_email" || data.action === "notification") {
      var recipient = data.to || "filipemielletj2@gmail.com";
      var subject = data.subject || "[BLOG FILIPEM2] Notificacao do Portal";
      var htmlBody = data.html || data.text || "Nova notificacao do blog";
      
      MailApp.sendEmail({
        to: recipient,
        subject: subject,
        htmlBody: htmlBody,
        name: "BLOG FILIPEM2"
      });
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "E-mail de notificacao enviado para " + recipient
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Backup Automatico no Google Drive
    var retentionDays = data.retention_days || 7;
    var folderName = "BLOG_FILIPEM2_BACKUPS";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    
    var now = new Date();
    var timeStr = Utilities.formatDate(now, "America/Sao_Paulo", "yyyy-MM-dd_HH-mm-ss");
    var fileName = "backup-" + timeStr + ".json";
    folder.createFile(fileName, JSON.stringify(data.snapshot, null, 2), MimeType.PLAIN_TEXT);
    
    // 3. Salva e atualiza o arquivo de Senha e Credenciais no Google Drive
    if (data.snapshot && data.snapshot.admin_access) {
      var credFiles = folder.getFilesByName("SENHA_E_ACESSO_ADMIN.txt");
      var credContent = "========================================================\n" +
        "   BLOG FILIPEM2 - CREDENCIAIS DE ACESSO AO PAINEL\n" +
        "========================================================\n\n" +
        "Link de Acesso: https://blogfilipem2.site/admin\n" +
        "E-mail do Administrador: " + (data.snapshot.admin_access.email || "filipemielletj2@gmail.com") + "\n" +
        "Senha de Acesso: " + (data.snapshot.admin_access.password || "admin123456") + "\n\n" +
        "Ultima sincronizacao: " + timeStr + " (Horario de Brasilia)\n\n" +
        "IMPORTANTE: Este arquivo e atualizado automaticamente sempre que\n" +
        "voce altera sua senha no painel administrativo do portal.\n" +
        "Guarde este arquivo e proteja sua conta Google!";
      if (credFiles.hasNext()) {
        credFiles.next().setContent(credContent);
      } else {
        folder.createFile("SENHA_E_ACESSO_ADMIN.txt", credContent, MimeType.PLAIN_TEXT);
      }
    }
    
    var cutoff = new Date(now.getTime() - (retentionDays * 24 * 60 * 60 * 1000));
    var files = folder.getFiles();
    var purgedCount = 0;
    while (files.hasNext()) {
      var f = files.next();
      if (f.getName().startsWith("backup-") && f.getDateCreated() < cutoff) {
        f.setTrashed(true);
        purgedCount++;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Backup e senha salvos no Google Drive!",
      file: fileName,
      credentials_saved: true,
      purged_old_backups: purgedCount
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var folderName = "BLOG_FILIPEM2_BACKUPS";
    var folders = DriveApp.getFoldersByName(folderName);
    if (!folders.hasNext()) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Nenhum backup encontrado" })).setMimeType(ContentService.MimeType.JSON);
    }
    var folder = folders.next();
    var files = folder.getFiles();
    var latestFile = null;
    var latestDate = 0;
    while (files.hasNext()) {
      var f = files.next();
      if (f.getName().startsWith("backup-") && f.getDateCreated().getTime() > latestDate) {
        latestDate = f.getDateCreated().getTime();
        latestFile = f;
      }
    }
    if (!latestFile) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Nenhum arquivo" })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(latestFile.getBlob().getDataAsString()).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [savedPassword, setSavedPassword] = useState('admin123456');
  const [showSavedPassword, setShowSavedPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [copiedSavedPassword, setCopiedSavedPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadingAvatar(true);
    setNotification(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt_text', 'Logo / Avatar do Autor');

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao fazer upload da imagem.');

      if (data.media?.url) {
        setAvatar(data.media.url);
        setNotification({
          type: 'success',
          text: 'Imagem da logo enviada com sucesso! Clique em "Atualizar Meu Perfil" abaixo para salvar as predefinições.'
        });
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Email notification channels state
  const [notificationEmail, setNotificationEmail] = useState('filipemielletj2@gmail.com');
  const [gdriveUrl, setGdriveUrl] = useState('');
  const [resendApiKey, setResendApiKey] = useState('');
  const [savingEmailConfig, setSavingEmailConfig] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailTestFeedback, setEmailTestFeedback] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    loadUsers();
    loadEmailSettings();
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
        if (meData.user.savedPassword) {
          setSavedPassword(meData.user.savedPassword);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmailSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.admin_notification_email) setNotificationEmail(data.admin_notification_email);
        if (data.auto_backup_gdrive_url) setGdriveUrl(data.auto_backup_gdrive_url);
        if (data.resend_api_key) setResendApiKey(data.resend_api_key);
      }
    } catch (err) {
      console.error('Erro ao carregar settings:', err);
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

      if (password && password.trim().length >= 6) {
        setSavedPassword(password.trim());
      }

      setNotification({
        type: 'success',
        text: 'Perfil atualizado com sucesso! Sua senha foi salva e sincronizada com o Google Drive.'
      });
      setPassword('');
      loadUsers();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmailConfig(true);
    setEmailTestFeedback(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_notification_email: notificationEmail.trim(),
          auto_backup_gdrive_url: gdriveUrl.trim(),
          resend_api_key: resendApiKey.trim(),
          email_notifications_enabled: '1'
        })
      });

      if (!res.ok) throw new Error('Falha ao salvar configurações de e-mail.');

      setEmailTestFeedback({
        type: 'success',
        text: 'Configurações de canal de e-mail salvas com sucesso! Agora você pode testar o envio.'
      });
    } catch (err: any) {
      setEmailTestFeedback({ type: 'error', text: err.message });
    } finally {
      setSavingEmailConfig(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setEmailTestFeedback(null);

    try {
      const res = await fetch('/api/notifications/test', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setEmailTestFeedback({
          type: 'success',
          text: `E-mail de teste enviado com sucesso! Verifique sua caixa de entrada e spam em ${notificationEmail}.`
        });
      } else {
        setEmailTestFeedback({
          type: 'warning',
          text: data.message || data.error || 'Aviso no envio. Conecte a URL do Google Apps Script ou chave Resend.'
        });
      }
    } catch (err: any) {
      setEmailTestFeedback({
        type: 'error',
        text: 'Erro ao tentar disparar o teste: ' + err.message
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_SNIPPET);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const isGoogleUrlValid = Boolean(
    gdriveUrl && gdriveUrl.startsWith('https://script.google.com/macros/s/') && gdriveUrl.includes('/exec')
  );
  const isLibraryUrl = Boolean(
    gdriveUrl && (gdriveUrl.includes('/macros/library/') || gdriveUrl.includes('/edit') || (!gdriveUrl.includes('/exec') && gdriveUrl.includes('/d/')))
  );
  const isResendKeyValid = Boolean(resendApiKey && resendApiKey.trim().startsWith('re_'));
  const isChannelConnected = !isLibraryUrl && (isGoogleUrlValid || isResendKeyValid);

  const scriptIdMatch = gdriveUrl ? gdriveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) : null;
  const scriptDirectEditUrl = scriptIdMatch
    ? `https://script.google.com/d/${scriptIdMatch[1]}/edit`
    : 'https://script.google.com/home/projects';

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Users className="w-7 h-7 text-red-500" />
          <span>Usuários, Redação &amp; Notificações</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Gerencie acessos ao painel e configure o canal de envio para receber notificações no seu Gmail.
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
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres fortes"
                  className="w-full px-3 py-2 pr-10 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                  title={showNewPassword ? 'Ocultar senha' : 'Ver senha digitada'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Current Saved Password in Cloud / Drive Card */}
            <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sua Senha Atual Salva no Sistema / Drive:</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Guardada no Drive</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono text-xs flex items-center justify-between">
                  <span>{showSavedPassword ? savedPassword : '••••••••••••'}</span>
                  <button
                    type="button"
                    onClick={() => setShowSavedPassword(!showSavedPassword)}
                    className="text-neutral-400 hover:text-white transition-colors ml-2"
                    title={showSavedPassword ? 'Ocultar senha' : 'Exibir senha salva'}
                  >
                    {showSavedPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(savedPassword);
                    setCopiedSavedPassword(true);
                    setTimeout(() => setCopiedSavedPassword(false), 2500);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                  title="Copiar senha atual"
                >
                  {copiedSavedPassword ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-neutral-400 leading-normal">
                📁 Toda alteração de senha é salva no banco e enviada para o seu Google Drive na pasta <strong className="text-neutral-300">BLOG_FILIPEM2_BACKUPS</strong> no arquivo <strong className="text-amber-400">SENHA_E_ACESSO_ADMIN.txt</strong>.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-neutral-300">Foto de Perfil &amp; Logo (Arquivo Local ou URL)</label>
                <span className="text-[11px] text-neutral-400">
                  Arquivo local: <code className="text-red-400 font-mono">public/avatar.png</code>
                </span>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                {/* Avatar Preview */}
                <div className="w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-700 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name || 'Avatar'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                  ) : (
                    <User className="w-8 h-8 text-neutral-600" />
                  )}
                </div>

                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="/avatar.png ou /logo.png ou https://..."
                      className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                    />

                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarFileUpload}
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-red-600/30 shrink-0 disabled:opacity-50"
                      title="Escolher arquivo de imagem do seu computador"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{uploadingAvatar ? 'Enviando...' : 'Fazer Upload'}</span>
                    </button>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-neutral-500 font-medium">Predefinições rápidas:</span>
                    <button
                      type="button"
                      onClick={() => setAvatar('/avatar.png')}
                      className={`px-2 py-0.5 rounded-lg border transition-all ${
                        avatar === '/avatar.png'
                          ? 'bg-red-600/20 text-red-400 border-red-500/40 font-bold'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                      }`}
                    >
                      📁 /avatar.png (Arquivo Local)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatar('/logo.png')}
                      className={`px-2 py-0.5 rounded-lg border transition-all ${
                        avatar === '/logo.png'
                          ? 'bg-red-600/20 text-red-400 border-red-500/40 font-bold'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                      }`}
                    >
                      ⭐ /logo.png (Logo Oficial)
                    </button>
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-neutral-400 mt-1.5 block leading-relaxed">
                💡 <strong>Arquivo local pronto:</strong> Criamos o arquivo <code className="bg-black/60 px-1 py-0.5 rounded text-white font-mono">public/avatar.png</code> no seu projeto. Você pode colocar sua logo diretamente nessa pasta no seu computador ou clicar no botão <strong>&quot;Fazer Upload&quot;</strong> acima para selecionar a imagem direto do dispositivo.
              </span>
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

        {/* Right Column: Email Notifications & Team */}
        <div className="lg:col-span-6 space-y-6">
          {/* Email Notifications Configuration Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#12141c] via-[#161824] to-[#1a1528] border border-neutral-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Notificações do Site por E-mail
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase flex items-center gap-1.5 ${
                  isChannelConnected
                    ? 'bg-emerald-950 border border-emerald-600 text-emerald-400'
                    : 'bg-amber-950 border border-amber-600 text-amber-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isChannelConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {isChannelConnected ? 'Canal Conectado' : 'Aguardando Conexão'}
              </span>
            </div>

            {/* Explanation banner */}
            {!isChannelConnected ? (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs leading-relaxed space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Por que você ainda não recebeu os e-mails?</span>
                </div>
                <p>
                  Para o Gmail não bloquear as notificações como spam, seu portal precisa de um canal autorizado de entrega. 
                  A maneira mais fácil e 100% gratuita é usar o <strong>Google Apps Script</strong> da sua própria conta Google (<code className="bg-black/40 px-1 py-0.5 rounded text-white">filipemielletj2@gmail.com</code>). Leva apenas 1 minuto!
                </p>
                <button
                  type="button"
                  onClick={() => setShowTutorial(!showTutorial)}
                  className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-bold underline cursor-pointer pt-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{showTutorial ? 'Ocultar passo a passo' : 'Ver passo a passo de 1 minuto'}</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Seu canal de envio está conectado! Alertas serão entregues diretamente na sua caixa de entrada.</span>
              </div>
            )}

            {/* Step-by-step Tutorial */}
            {showTutorial && (
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700/80 space-y-3 text-xs text-neutral-300">
                <strong className="text-white block font-bold border-b border-neutral-800 pb-1.5 flex items-center justify-between">
                  <span>Passo a passo rápido (Google Apps Script Grátis):</span>
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all"
                  >
                    {copiedScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScript ? 'Copiado!' : '1. Copiar Código'}</span>
                  </button>
                </strong>
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-neutral-300">
                  <li>
                    Acesse <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-red-400 font-bold underline inline-flex items-center gap-0.5">script.google.com <ExternalLink className="w-3 h-3" /></a> com seu e-mail <code className="text-white bg-neutral-800 px-1 rounded">filipemielletj2@gmail.com</code>.
                  </li>
                  <li>Clique em <strong>Novo Projeto</strong> no canto superior esquerdo.</li>
                  <li>Apague o que estiver na tela e <strong>cole o código copiado</strong> no botão acima.</li>
                  <li>
                    No canto superior direito, clique em <strong>Implantar &rarr; Nova Implantação</strong>.
                  </li>
                  <li>
                    Selecione o tipo <strong>Aplicativo da Web</strong>. Em <em>"Quem tem acesso"</em>, selecione <strong>Qualquer pessoa</strong> (necessário para o blog enviar as notificações).
                  </li>
                  <li>Clique em <strong>Implantar</strong>, autorize o acesso da sua conta e copie o link final (<code className="text-white text-[11px]">https://script.google.com/macros/s/.../exec</code>).</li>
                  <li>Cole esse link no campo abaixo e clique em <strong>Salvar Canal de Notificação</strong>!</li>
                </ol>
              </div>
            )}

            {/* Email Settings Form */}
            <form onSubmit={handleSaveEmailConfig} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  E-mail de Destino das Notificações
                </label>
                <input
                  type="email"
                  required
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-red-500" />
                    <span>URL do Google Apps Script (Recomendado - 100% Grátis)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScript ? 'Código Copiado!' : 'Copiar Código'}</span>
                  </button>
                </div>
                <input
                  type="url"
                  value={gdriveUrl}
                  onChange={(e) => setGdriveUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Usado tanto para enviar e-mails direto no Gmail quanto para salvar backups no Google Drive.
                </span>

                {isLibraryUrl && (
                  <div className="mt-3 p-4 rounded-xl bg-red-950/80 border-2 border-red-500 text-red-100 text-xs space-y-2.5 leading-relaxed">
                    <div className="font-bold flex items-center gap-2 text-red-300 text-sm">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <span>Atenção: Você colou um link de &quot;Biblioteca&quot; ou &quot;Editor&quot;!</span>
                    </div>
                    <p className="text-white/90">
                      O link atual (<code className="bg-black/60 px-1 py-0.5 rounded text-red-300 font-mono text-[11px] break-all">{gdriveUrl}</code>) é um link interno do editor e <strong>não recebe chamadas externas</strong> para disparar e-mails.
                    </p>
                    <div className="p-3 bg-black/50 rounded-lg space-y-1.5 text-neutral-200">
                      <strong className="text-white block font-bold">Como pegar a URL correta no Google em 30 segundos:</strong>
                      <ol className="list-decimal list-inside space-y-1 text-neutral-300 text-[11px]">
                        <li>Abra seu script no botão vermelho abaixo.</li>
                        <li>No canto superior direito, clique no botão azul <strong>&quot;Implantar&quot;</strong> &rarr; <strong>&quot;Nova implantação&quot;</strong>.</li>
                        <li>Clique na engrenagem (ao lado de &quot;Selecione o tipo&quot;) e escolha <strong>&quot;Aplicativo da Web&quot;</strong>.</li>
                        <li>Em <em>&quot;Quem tem acesso&quot;</em>, escolha <strong>&quot;Qualquer pessoa&quot;</strong>.</li>
                        <li>Clique em <strong>&quot;Implantar&quot;</strong>, autorize sua conta Google e copie a <strong>URL do aplicativo da Web</strong> (ela sempre termina com <code className="text-emerald-400 font-bold">/exec</code>).</li>
                        <li>Cole o link copiado aqui neste campo e clique em <strong>Salvar Canal de Envio</strong>!</li>
                      </ol>
                    </div>
                    <div className="pt-1">
                      <a
                        href={scriptDirectEditUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-md shadow-red-600/30"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Abrir meu script no Google e gerar o link /exec</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ou Chave da API Resend (Opcional - re_...)</span>
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                />
                {resendApiKey && !resendApiKey.trim().startsWith('re_') && (
                  <span className="text-[11px] text-amber-400 mt-1 block">
                    ⚠️ A chave da Resend precisa começar com &quot;re_&quot;. Se você for usar apenas o Google Apps Script acima, pode apagar este campo.
                  </span>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-neutral-700 disabled:opacity-50"
                >
                  {testingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{testingEmail ? 'Testando Conexão...' : 'Enviar Teste Agora'}</span>
                </button>

                <button
                  type="submit"
                  disabled={savingEmailConfig}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
                >
                  {savingEmailConfig ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Salvar Canal de Envio</span>
                </button>
              </div>
            </form>

            {/* Test feedback */}
            {emailTestFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2 leading-relaxed ${
                  emailTestFeedback.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
                    : emailTestFeedback.type === 'warning'
                    ? 'bg-amber-950/80 border border-amber-800 text-amber-300'
                    : 'bg-red-950/80 border border-red-800 text-red-400'
                }`}
              >
                {emailTestFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{emailTestFeedback.text}</span>
              </div>
            )}
          </div>

          {/* Users List Card */}
          <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
              Equipe com Acesso ao Painel ({users.length})
            </h3>

            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border border-neutral-700 bg-neutral-950"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo.png';
                        }}
                      />
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
    </div>
  );
}
