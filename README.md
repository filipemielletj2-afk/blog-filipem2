# BLOG FILIPEM2 — Portal de Notícias, Games, Cinema, Música e Cultura Geek

O **BLOG FILIPEM2** é um portal completo, moderno e profissional de notícias, análises, artigos e tendências sobre games, músicas, filmes, séries, tecnologia e cultura geek.

Desenvolvido com arquitetura moderna fullstack em **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** e banco de dados relacional **SQLite nativo (Node 24 `node:sqlite`)**, o projeto une velocidade máxima de carregamento, Server-Side Rendering (SSR) otimizado para o Google, painel administrativo privado com autenticação criptográfica e um **Construtor Visual de Páginas (Page Builder)** em tempo real.

---

## 🚀 Como Iniciar o Projeto Localmente

### 1. Pré-requisitos
- **Node.js**: Versão 20+ ou 24+
- **npm** ou **pnpm**

### 2. Instalação e Execução
Na raiz do projeto (`c:\Users\filip\Downloads\web site FILIPEM2`):

```bash
# 1. Instalar as dependências (caso ainda não tenha feito)
npm install

# 2. Rodar em modo de desenvolvimento
npm run dev

# 3. Ou compilar e rodar em modo de produção
npm run build
npm start
```

Abra seu navegador em:
- **Portal Público:** `http://localhost:3000`
- **Painel Administrativo:** `http://localhost:3000/admin`

---

## 🔐 Credenciais de Acesso ao Painel

- **URL de Login:** `http://localhost:3000/admin/login`
- **E-mail:** `admin@filipem2.com`
- **Senha:** `admin123456`

*(Após o primeiro login, altere sua senha e informações na seção **Usuários & Permissões**).*

---

## 🛠️ Principais Recursos Implementados

### 1. Identidade Visual Exclusiva
- Estilo tecnológico, geek e retrô-futurista com cortes angulares e detalhes em neon.
- Logotipo oficial em vetor SVG (`/public/logo.svg`) e Favicon (`/public/favicon.svg`).
- Paleta configurável com **Vermelho Filipem2 (`#DC2626`)**, preto profundo (`#0A0A0C`), cinza escuro (`#14161F`) e branco.
- Suporte nativo a **Modo Escuro e Modo Claro** com botão de alternância no cabeçalho e persistência local.
- Tipografia moderna com **Space Grotesk** e **Inter**.
- Totalmente responsivo para celulares, tablets e computadores.

### 2. Painel Administrativo Completo (`/admin`)
- **Visão Geral:** Métricas consolidadas de artigos, leituras totais, comentários e atalhos rápidos.
- **Editor Visual de Páginas (`/admin/builder`):**
  - Adição de blocos: Hero Destaque Triplo, Letreiro Urgente, Grade por Categoria, Vídeo Showcase, Newsletter VIP, Banner Publicitário e HTML Livre.
  - Reorganização de seções (Subir / Descer / Mover).
  - Duplicação e exclusão de blocos.
  - Alternância de visão Desktop / Tablet / Celular com tela de pré-visualização.
  - Publicação de alterações no site com 1 clique.
- **CMS de Artigos (`/admin/artigos`):**
  - Criação e edição com título, subtítulo, slug amigável e excerpt.
  - Barra de formatação visual (H2, H3, Negrito, Itálico, Citação, Iframe de Vídeo).
  - Imagem de capa com legenda e créditos de direitos autorais.
  - Gestão de tags dinâmicas e seleção de categorias.
  - Tabela de Fontes e Referências Jornalísticas verificadas.
  - Simulador visual de resultados do Google (SERP Preview).
- **Categorias & Subcategorias (`/admin/categorias`):**
  - Gestão de Games, Músicas, Filmes, Séries, Geek & Tecnologia com cores e ícones próprios.
- **Biblioteca de Mídia (`/admin/midia`):**
  - Upload seguro de fotos (JPG, PNG, WebP, GIF, SVG, AVIF até 10MB) com geração de link e preenchimento de Alt Text e Créditos.
- **Moderação de Comentários (`/admin/comentarios`):**
  - Aprovação, marcação de spam e exclusão de comentários.
- **Páginas & Políticas LGPD (`/admin/paginas`):**
  - Edição de textos institucionais e termos legais.
- **Publicidade & Monetização (`/admin/publicidade`):**
  - Controle de 4 áreas de anúncios (Cabeçalho, Barra Lateral, In-Article e Rodapé).
- **SEO & Indexação (`/admin/seo`):**
  - Editor dinâmico do `robots.txt`, verificação do Google Search Console e GA4.
- **Logs de Auditoria (`/admin/logs`):**
  - Registro de logins, publicações e alterações com IP e data.
- **Backups (`/admin/backup`):**
  - Exportação e importação de backups em JSON e orientações para backup do SQLite.

### 3. SEO Técnico & Boas Práticas
- **URLs Amigáveis:** `/artigo/[slug]`, `/categoria/[slug]`, `/tag/[slug]`.
- **Sitemap XML Automático:** Disponível em `/sitemap.xml`, gerado dinamicamente a partir dos artigos e categorias.
- **Robots.txt Configurável:** Disponível em `/robots.txt`.
- **Metatags Open Graph & Twitter Cards:** Geradas dinamicamente com título, imagem de compartilhamento e descrição.
- **Dados Estruturados Schema.org:** JSON-LD para `NewsArticle`, `BlogPosting`, `BreadcrumbList`, `Organization` e `WebSite` com SearchAction.
- **Redirecionamento 301 Automático:** Ao renomear um slug de artigo, o sistema registra o redirecionamento.

### 4. Políticas Legais & LGPD
- **Banner de Consentimento de Cookies:** Com opções para "Aceitar Todos", "Apenas Essenciais" e "Gerenciar Preferências".
- **Páginas Legais Completas:**
  1. `/privacidade` — Política de Privacidade conforme Lei nº 13.709/2018 (LGPD).
  2. `/cookies` — Política de Cookies detalhada.
  3. `/termos` — Termos de Uso do portal.
  4. `/direitos-autorais` — Política de Direitos Autorais e procedimento de Notificação e Retirada (DMCA).
  5. `/contato` — Formulário interativo de contato.
  6. `/sobre` — Missão editorial e valores.
  7. `/correcoes` — Política de Correções e Atualizações editoriais.
  8. `/publicidade` — Transparência sobre publieditoriais e links afiliados.

---

## 🌐 Instruções de Hospedagem em Produção

O projeto foi construído para ser hospedado facilmente em qualquer servidor com Node.js ou plataforma PaaS moderna.

### Opção 1: VPS Ubuntu (Hostinger, DigitalOcean, Hetzner, AWS)
1. Instale o Node.js 20+ ou 24:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
2. Clone o repositório na VPS:
   ```bash
   git clone <URL_DO_REPOSITORIO> /var/www/blog-filipem2
   cd /var/www/blog-filipem2
   npm install
   npm run build
   ```
3. Use o PM2 para manter a aplicação rodando em segundo plano:
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "blog-filipem2" -- start
   pm2 startup
   pm2 save
   ```
4. Configure o Nginx como proxy reverso e ative HTTPS gratuito com Certbot:
   ```nginx
   server {
       server_name blogfilipem2.com.br www.blogfilipem2.com.br;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```
   Ative o certificado SSL:
   ```bash
   sudo certbot --nginx -d blogfilipem2.com.br -d www.blogfilipem2.com.br
   ```

### Opção 2: Railway ou Render
1. Conecte seu repositório GitHub.
2. Build Command: `npm run build`
3. Start Command: `npm start`
4. Crie um volume persistente mapeado para a pasta `/app/data` para que o banco de dados `filipem2.sqlite` seja preservado a cada deploy.

---

## 🔒 Checklist de Segurança Implementado
- Senhas protegidas com hashing criptográfico `scrypt` com salt exclusivo de 16 bytes.
- Proteção contra ataques de força bruta no login com limitação de taxa por IP.
- Cookies de sessão HTTP-Only com proteção SameSite.
- Sanitização de conteúdos HTML permitidos com whitelist estrita de tags e atributos para prevenir Cross-Site Scripting (XSS).
- Prevenção contra SQL Injection via consultas parametrizadas do `node:sqlite`.
- Honeypot anti-spam nos formulários de contato e comentários.
- Validação de tipos MIME e limite de tamanho para uploads de mídia.
- Registro de logs de auditoria em ações administrativas.

---

## 📄 Licença e Direitos
© 2026 BLOG FILIPEM2. Todos os direitos reservados.
Desenvolvido com excelência técnica para amantes de games, cinema, música e cultura geek.
