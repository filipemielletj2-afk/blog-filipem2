# CHECKLIST DE LANÇAMENTO — BLOG FILIPEM2

Antes de abrir o portal publicamente para o tráfego de visitantes na internet, recomendamos realizar a seguinte checagem das configurações personalizadas:

---

### 1. Segurança & Credenciais
- [ ] **Alterar a Senha Inicial do Administrador**:
  - Acesse `/admin/login` com as credenciais padrão (`admin@filipem2.com` / `admin123456`).
  - Vá até a aba **Usuários & Permissões** (`/admin/usuarios`).
  - Defina uma nova senha forte (mínimo de 8 a 12 caracteres com números e símbolos) e atualize seu e-mail pessoal.
- [ ] **Configurar JWT_SECRET no arquivo `.env` de produção**:
  - Altere a variável `JWT_SECRET` para uma chave aleatória e segura.

---

### 2. Identidade & Redes Sociais
- [ ] **Configurar Links de Redes Sociais**:
  - Acesse `/admin/aparencia`.
  - Preencha os links dos seus canais reais de YouTube, X/Twitter, Instagram, Discord e Twitch.
- [ ] **Definir Paleta de Cores e Bordas Preferidas**:
  - No mesmo menu, experimente as cores temáticas e o arredondamento dos cards para deixar o site com o estilo visual exato da sua preferência.

---

### 3. SEO & Mecanismos de Busca
- [ ] **Definir o Domínio Canônico Oficial**:
  - Em `/admin/seo`, defina a **URL Canônica Base** (ex: `https://blogfilipem2.com.br`).
- [ ] **Vincular o Google Search Console**:
  - Cole sua meta tag de verificação no campo indicado em `/admin/seo`.
  - Envie o endereço do sitemap: `https://blogfilipem2.com.br/sitemap.xml`.
- [ ] **Vincular Google Analytics 4 (Opcional)**:
  - Caso utilize medições de audiência, insira seu ID do GA4 (`G-XXXXXXXXXX`).

---

### 4. Conteúdo & Páginas Legais (LGPD)
- [ ] **Revisar Dados de Contato nas Páginas Legais**:
  - Acesse `/admin/paginas`.
  - Verifique as páginas **Sobre Nós**, **Contato**, **Política de Privacidade** e **Termos de Uso**.
  - Confirme se os canais de contato refletem exatamente os meios pelos quais você deseja ser contatado por leitores e anunciantes.
- [ ] **Publicar as Primeiras Matérias Próprias**:
  - Acesse `/admin/artigos/novo` e comece a cadastrar suas matérias, novidades de jogos, trailers e críticas musicais.

---

### 5. Monetização & Publicidade (Quando Desejar Ativar)
- [ ] **Configurar Blocos de Anúncios**:
  - Acesse `/admin/publicidade`.
  - Ative as áreas que desejar monetizar (Cabeçalho, Barra Lateral, In-Article ou Rodapé) e cole seus scripts do Google AdSense ou banners diretos de patrocinadores e links afiliados.

---

Com este checklist concluído, seu portal **BLOG FILIPEM2** estará 100% pronto para receber visitantes de todo o Brasil e do mundo com máxima segurança, velocidade e impacto visual!
