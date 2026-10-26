# GUIA DE MANUTENÇÃO, ATUALIZAÇÃO E HOSPEDAGEM — BLOG FILIPEM2

Este documento contém todas as instruções técnicas para operação, manutenção contínua, backups, conexão de domínio próprio e configuração do Google Search Console para o **BLOG FILIPEM2**.

---

## 1. Conexão de Domínio Próprio e Ativação de HTTPS

### Passo 1: Registro do Domínio
Recomendamos o registro através do [Registro.br](https://registro.br) para domínios `.com.br` ou plataformas como Cloudflare, Namecheap ou GoDaddy.

### Passo 2: Configuração dos Registros DNS
No painel do seu provedor de DNS (por exemplo, na Cloudflare ou Registro.br), crie os seguintes apontamentos:

| Tipo | Nome | Valor | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` (raiz) | `IP_DO_SEU_SERVIDOR` | Automático ou 3600 |
| **CNAME** | `www` | `blogfilipem2.com.br` | Automático ou 3600 |

### Passo 3: Certificado SSL/HTTPS Gratuito com Let's Encrypt
Se estiver usando uma VPS Ubuntu com Nginx, instale e execute o Certbot:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d blogfilipem2.com.br -d www.blogfilipem2.com.br
```

O Certbot configurará a renovação automática dos certificados HTTPS a cada 90 dias.

---

## 2. Configuração do Google Search Console & Envio do Sitemap

Para que o Google descubra, rastreie e indexe os artigos do portal rapidamente:

### Passo 1: Adicionar a Propriedade no Search Console
1. Acesse o [Google Search Console](https://search.google.com/search-console).
2. Clique em **"Adicionar Propriedade"**.
3. Escolha **"Prefixo do URL"** e digite `https://blogfilipem2.com.br`.

### Passo 2: Método de Verificação
- **Opção Recomendada (Meta Tag):**
  1. Copie o valor da tag fornecido pelo Google (ex: `google-site-verification=...`).
  2. Acesse seu painel administrativo em `http://localhost:3000/admin/seo` (ou no seu domínio).
  3. Cole o código no campo **"Google Search Console (Tag de Verificação HTML)"** e clique em **Salvar Configurações**.
  4. Volte ao Google Search Console e clique no botão **"Verificar"**.

### Passo 3: Envio do Sitemap XML
1. No menu lateral do Search Console, clique em **"Sitemaps"**.
2. No campo **"Adicionar novo sitemap"**, digite: `sitemap.xml`.
3. Clique em **"Enviar"**.
4. O Google passará a ler periodicamente a URL `https://blogfilipem2.com.br/sitemap.xml`, que lista automaticamente todos os artigos, categorias e páginas públicas.

---

## 3. Procedimento de Backup e Restauração de Desastres

### A. Backup Rápido pelo Painel
1. Acesse `/admin/backup`.
2. Clique no botão **"Baixar Arquivo de Backup"**.
3. O sistema gerará um arquivo `.json` completo contendo:
   - Todas as matérias e seus metadados.
   - Categorias e tags.
   - Páginas legais e institucionais.
   - Configurações do construtor visual de páginas.
   - Configurações de cores, fontes e SEO.

### B. Backup Físico do Banco SQLite e Mídias
Para uma cópia exata de nível de arquivo em servidores:
```bash
# Criar pasta de backups diários
mkdir -p /backups/filipem2

# Copiar banco de dados e uploads
cp /var/www/blog-filipem2/data/filipem2.sqlite /backups/filipem2/db-$(date +%F).sqlite
tar -czf /backups/filipem2/uploads-$(date +%F).tar.gz -C /var/www/blog-filipem2/public uploads
```

### C. Procedimento de Restauração
1. **Pelo Painel:** Na aba `/admin/backup`, selecione o arquivo `.json` no botão "Restaurar Configurações e Seções".
2. **Por Arquivo Físico:** Substitua o arquivo `data/filipem2.sqlite` pelo arquivo de backup e reinicie o processo com `pm2 restart blog-filipem2`.

---

## 4. Atualização e Manutenção do Código

Sempre que desejar aplicar atualizações no portal:

```bash
# 1. Puxar alterações mais recentes
git pull origin main

# 2. Atualizar dependências com segurança
npm install

# 3. Recompilar a aplicação Next.js
npm run build

# 4. Reiniciar o serviço de produção com zero downtime
pm2 reload blog-filipem2
```
