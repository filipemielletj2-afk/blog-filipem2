#!/bin/bash
# ========================================================
# BLOG FILIPEM2 - SCRIPT DE INSTALAÇÃO AUTOMÁTICA EM SERVIDOR
# Compatível com Ubuntu 22.04 / 24.04 LTS (Google Cloud, AWS, DigitalOcean)
# ========================================================

set -e

echo "🚀 [1/6] Atualizando pacotes do sistema..."
sudo apt update -y && sudo apt upgrade -y

echo "📦 [2/6] Instalando dependências básicas (Git, Curl, Nginx)..."
sudo apt install -y curl git nginx build-essential

echo "⚡ [3/6] Instalando Node.js v24..."
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

echo "📂 [4/6] Configurando aplicação em /var/www/blog-filipem2..."
sudo mkdir -p /var/www/blog-filipem2
sudo chown -R $USER:$USER /var/www/blog-filipem2

# Se o repositório foi passado como argumento
if [ -n "$1" ]; then
    echo "Clonando do repositório $1..."
    git clone "$1" /var/www/blog-filipem2
fi

cd /var/www/blog-filipem2

echo "🔨 [5/6] Instalando dependências e compilando o Next.js..."
npm install
npm run build

# Iniciar com PM2
pm2 delete blog-filipem2 || true
pm2 start npm --name "blog-filipem2" -- start
pm2 startup | tail -n 1 | sudo bash || true
pm2 save

echo "🌐 [6/6] Configurando Nginx para a porta 80..."
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo systemctl restart nginx

PUBLIC_IP=$(curl -s ifconfig.me || echo "SEU-IP")

echo "========================================================"
echo "🎉 BLOG FILIPEM2 INSTALADO E NO AR COM SUCESSO!"
echo "👉 Acesse no seu navegador: http://$PUBLIC_IP"
echo "👉 Painel Administrativo:  http://$PUBLIC_IP/admin"
echo "👉 Login: admin@filipem2.com  |  Senha: admin123456"
echo "========================================================"
