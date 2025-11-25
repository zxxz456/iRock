#!/bin/bash

# Script for kill the iRock application 
echo "========================================="
echo "   iRock App - Script de apagado"
echo "========================================="

# Get current user and set up paths
CURRENT_USER=$(whoami)
USER_HOME="/home/$CURRENT_USER"
PROJECT_DIR="$USER_HOME/iRock"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Colors for user friendly output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print messages
print_message() {
    echo -e "${GREEN}${NC} $1"
}

print_error() {
    echo -e "${RED}${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}${NC} $1"
}

# Check if running as root for certain operations
check_sudo() {
    if [ "$EUID" -ne 0 ]; then 
        print_warning "Algunas operaciones requieren sudo. Asegúrate de tener permisos."
    fi
}

# Bye nginx
echo ""
echo "-> Matando nginx..."
echo "---------------------------------------------"
sudo systemctl stop nginx
print_message "Nginx detenido"

# Bye gunicorn
echo ""
echo "-> Matando Gunicorn..."
echo "---------------------------------------------"
sudo systemctl stop irock.service
print_message "Gunicorn detenido"

# Bye clouflare tunnel (if any)
echo ""
echo "-> Matando Cloudflare Tunnel (si existe)..."
echo "---------------------------------------------"
sudo pkill cloudflared
print_message "Cloudflare Tunnel detenido (si existía)"

# Sanity checks
echo ""
echo "Verificando servicios..."
echo "---------------------------------------------"

# Gunicorn
if systemctl is-active --quiet irock.service; then
    print_error "Gunicorn está en ejecución"
else
    print_message "Gunicorn NO está en ejecución"
fi

# Nginx
if systemctl is-active --quiet nginx; then
    print_error "Nginx está en ejecución"
else
    print_message "Nginx NO está en ejecución"
fi

# PASO 9: Información final
echo ""
echo "========================================="
echo "   Todos los servicios detenidos"
echo "========================================="
echo ""
