# GUIA PASSO A PASSO: COLOCAR O BLOG FILIPEM2 ONLINE NA NUVEM E NO GOOGLE

Existem duas coisas fundamentais quando você diz *"colocar online no Google como se usasse um servidor"*:
1. **Hospedar o site em um servidor na nuvem (Cloud)** para ele ficar no ar 24h por dia, com link público que qualquer pessoa no mundo possa acessar.
2. **Cadastrar o site no mecanismo de busca do Google (Google Search Console)** para que os seus artigos e o nome **BLOG FILIPEM2** apareçam nas pesquisas do Google.

Abaixo estão os passos detalhados e fáceis para você escolher a melhor opção.

---

## 🚀 PARTE 1: HOSPEDAR EM UM SERVIDOR NA NUVEM

Você tem duas excelentes opções para o servidor:

---

### OPÇÃO A: No Google Cloud (Google Compute Engine — Servidor Virtual Real)
*Essa é a opção oficial diretamente nos servidores do Google. O Google Cloud oferece uma máquina virtual na camada gratuita (Always Free).*

1. **Acesse o Google Cloud Console:**
   - Entre em [console.cloud.google.com](https://console.cloud.google.com/) com sua conta Google.
   - Crie um novo projeto chamado `blog-filipem2`.

2. **Criar a Máquina Virtual (Servidor):**
   - No menu lateral esquerdo, vá em **Compute Engine** > **Instâncias de VM**.
   - Clique em **Criar Instância**.
   - Escolha o nome: `servidor-blog`.
   - Região: Escolha `us-central1` (que faz parte da camada gratuita) ou `southamerica-east1` (São Paulo, com menor latência para o Brasil).
   - Tipo de máquina: `e2-micro` (gratuita na camada Always Free) ou `e2-small` / `e2-medium` (para maior capacidade).
   - Disco de Inicialização: Escolha **Ubuntu 24.04 LTS** com 30GB.
   - Na seção **Firewall**, marque:
     - ✅ **Permitir tráfego HTTP**
     - ✅ **Permitir tráfego HTTPS**
   - Clique em **Criar**.

3. **Acessar o Terminal do Servidor:**
   - Na lista de instâncias, clique no botão **SSH** ao lado do seu servidor. Uma janela preta de terminal se abrirá no seu navegador.

4. **Instalar o Node.js e Git no Servidor:**
   Execute os seguintes comandos no terminal SSH:
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
   sudo apt install -y nodejs git
   ```

5. **Colocar os Arquivos do Blog no Servidor:**
   Você pode subir o código para o GitHub (veja na Parte 2) e clonar direto no servidor:
   ```bash
   git clone https://github.com/SEU_USUARIO/blog-filipem2.git
   cd blog-filipem2
   npm install
   npm run build
   ```

6. **Deixar o Site Rodando 24h sem Fechar (Usando PM2):**
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "blog-filipem2" -- start
   pm2 startup
   pm2 save
   ```

7. **Configurar a Porta 80 (HTTP) com Nginx:**
   ```bash
   sudo apt install nginx -y
   sudo nano /etc/nginx/sites-available/default
   ```
   Substitua o conteúdo por:
   ```nginx
   server {
       listen 80 default_server;
       listen [::]:80 default_server;
       server_name _;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Salve (`Ctrl + O`, `Enter` e `Ctrl + X`) e reinicie o Nginx:
   ```bash
   sudo system-nginx restart nginx
   sudo systemctl restart nginx
   ```
   **Pronto!** Ao acessar o **IP Externo** da sua VM no navegador, o BLOG FILIPEM2 estará no ar!

---

### OPÇÃO B: Na Nuvem Simplificada (Render ou Railway — A Mais Fácil, em 5 Minutos)
*Se você não quiser gerenciar Linux, comandos de terminal ou Nginx, esta opção automatiza tudo e te dá um link seguro `https://...` com certificado SSL grátis.*

1. **Suba seu projeto no GitHub:**
   - Crie uma conta em [github.com](https://github.com).
   - Crie um repositório privado ou público chamado `blog-filipem2`.
   - No seu computador, envie os arquivos do blog para lá:
     ```powershell
     git remote add origin https://github.com/SEU_USUARIO/blog-filipem2.git
     git branch -M main
     git push -u origin main
     ```

2. **Conectar ao Render:**
   - Acesse [render.com](https://render.com) e crie uma conta gratuita.
   - Clique em **New +** > **Web Service**.
   - Conecte sua conta do GitHub e escolha o repositório `blog-filipem2`.
   - Preencha:
     - **Name:** `blog-filipem2`
     - **Runtime:** `Node`
     - **Build Command:** `npm run build`
     - **Start Command:** `npm start`
   - Na seção **Disks** (Discos Persistentes):
     - Adicione um disco montado em `/app/data` (para o banco de dados SQLite persistir).
   - Clique em **Create Web Service**.

Em poucos minutos, o Render te dará um link público como:
👉 `https://blog-filipem2.onrender.com`

---

## 🔍 PARTE 2: COLOCAR O SITE NOS RESULTADOS DE BUSCA DO GOOGLE

Assim que o site estiver online (seja pelo IP do Google Cloud, pelo Render ou com seu domínio próprio):

### 1. Acessar o Google Search Console
- Acesse [search.google.com/search-console](https://search.google.com/search-console).
- Faça login com sua conta do Google.
- Clique em **Adicionar Propriedade**.
- Escolha **Prefixo do URL** e insira a URL do seu site (ex: `https://blogfilipem2.com.br` ou o link do seu servidor).

### 2. Verificar a Propriedade
- O Google fornecerá uma tag HTML (exemplo: `<meta name="google-site-verification" content="CÓDIGO_AQUI" />`).
- Acesse o seu painel em: `SEU_SITE/admin/seo`.
- Cole o código no campo **Google Search Console (Tag de Verificação HTML)** e clique em **Salvar Configurações**.
- Volte no Search Console e clique no botão **Verificar**.

### 3. Enviar o Sitemap XML
- No menu esquerdo do Search Console, clique em **Sitemaps**.
- No campo para adicionar, digite apenas: `sitemap.xml`.
- Clique em **Enviar**.

O robô do Google (*Googlebot*) começará a rastrear todas as suas categorias, notícias e artigos e os exibirá nas pesquisas de quem busca por novidades de games, filmes, músicas e tecnologia!

---

## 🌐 PARTE 3: USAR UM DOMÍNIO PRÓPRIO (ex: `blogfilipem2.com.br`)

Se você quiser um endereço com nome profissional em vez de um IP ou link genérico:
1. Registre o domínio no [Registro.br](https://registro.br) (custa cerca de R$ 40/ano).
2. Na área de DNS do Registro.br, crie um apontamento do tipo **A** apontando para o IP do seu servidor.
3. Se estiver usando o Nginx no Google Cloud, ative o certificado HTTPS gratuito com:
   ```bash
   sudo certbot --nginx -d blogfilipem2.com.br -d www.blogfilipem2.com.br
   ```
4. Se estiver usando o Render, basta ir em **Settings** > **Custom Domains** e digitar `blogfilipem2.com.br`. Ele ativa o certificado SSL/HTTPS automaticamente!
