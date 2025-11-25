#!/bin/bash

# Script for deploying the iRock application with Nginx and Gunicorn 
# (for local with Cloudflare Tunnel)
# prereequisites: nodejs, npm, python3, pip, virtualenv, nginx, cloudflared
# To install cloudflared:
# cd /tmp
# wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
# sudo dpkg -i cloudflared-linux-amd64.deb
# To install python and nginx:
# sudo apt update
# sudo apt install -y python3-pip python3-venv nginx
# To install nodejs and npm:
# curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
# sudo apt install -y nodejs
echo "========================================="
echo "   iRock App - Script de configuración inicial"
echo "========================================="

# Get current user and set up paths
CURRENT_USER=$(whoami)
USER_HOME="/home/$CURRENT_USER"
PROJECT_DIR="$USER_HOME/irock"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Colors for user friendly output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print messages
print_message() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if running as root for certain operations
check_sudo() {
    if [ "$EUID" -ne 0 ]; then 
        print_warning "Algunas operaciones requieren sudo. Asegúrate de tener permisos."
    fi
}

# Set python env
echo ""
echo "-> Configurando entorno virtual de Python..."
echo "---------------------------------------------"

cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_message "Entorno virtual creado"
else
    print_message "Entorno virtual ya existe"
fi

source venv/bin/activate

# Install reqs
pip install -r requirements.txt

print_message "Dependencias Python instaladas"

# Set django
echo ""
echo "-> Configurando Django..."
echo "---------------------------------------------"

# static files
python3 manage.py collectstatic --noinput

print_message "Archivos estáticos recolectados"

# migrate
python3 manage.py migrate

print_message "Migraciones aplicadas"

deactivate

# Build frontend
echo ""
echo "-> Compilando React..."
echo "---------------------------------------------"

cd "$FRONTEND_DIR"

# check package.json
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json en el frontend"
    exit 1
fi

# Build
npm run build

print_message "Frontend compilado exitosamente en /dist"

# Set Gunicorn
echo ""
echo "-> Configurando Gunicorn..."
echo "---------------------------------------------"

# LOGS DIR
sudo mkdir -p /var/log/gunicorn
sudo chown -R "$CURRENT_USER":www-data /var/log/gunicorn

# PID DIR
sudo mkdir -p /var/run/gunicorn
sudo chown -R "$CURRENT_USER":www-data /var/run/gunicornn/gunicorn

# Copy irock.service
sudo cp "$PROJECT_DIR/irock.service" /etc/systemd/system/

# Rload systemd
sudo systemctl daemon-reload

# enable and start service
sudo systemctl enable irock.service
sudo systemctl restart irock.service

print_message "Servicio Gunicorn configurado y en ejecución"

# Set Nginx
echo ""
echo "-> Configurando Nginx..."
echo "---------------------------------------------"

# configuration ln
sudo ln -sf "$PROJECT_DIR/nginx_irock.conf" /etc/nginx/sites-available/irock
sudo ln -sf /etc/nginx/sites-available/irock /etc/nginx/sites-enabled/

# Remove default configuration if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Check if nginx config is ok, if so restart nginx, else exit with error
if [ $? -eq 0 ]; then
    print_message "Configuración de Nginx válida"
    # Restart Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    print_message "Nginx configurado y en ejecución"
else
    print_error "Error en la configuración de Nginx"
    exit 1
fi

# Set firewall (optional)
echo ""
echo "-> Configurando firewall..."
echo "---------------------------------------------"

if command -v ufw &> /dev/null; then
    sudo ufw allow 'Nginx Full'
    sudo ufw allow OpenSSH
    print_message "Firewall configurado"
else
    print_warning "UFW no está instalado. Considera configurar el firewall manualmente."
fi

# Sanity checks
echo ""
echo "Verificando servicios..."
echo "---------------------------------------------"

# Gunicorn
if systemctl is-active --quiet irock.service; then
    print_message "Gunicorn está en ejecución"
else
    print_error "Gunicorn NO está en ejecución"
    echo "Ejecuta: sudo systemctl status irock.service para más detalles"
fi

# Nginx
if systemctl is-active --quiet nginx; then
    print_message "Nginx está en ejecución"
else
    print_error "Nginx NO está en ejecución"
    echo "Ejecuta: sudo systemctl status nginx para más detalles"
fi

# PASO 9: Información final
echo ""
echo "========================================="
print_message "   Despliegue Completado"
echo "========================================="
echo ""
