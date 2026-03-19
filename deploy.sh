#!/bin/bash

# 1. Descargar cambios
echo "📥 Bajando cambios de git..."
git pull origin mundial

# 2. Instalar dependencias (por si hubo cambios en package.json)
echo "📦 Instalando dependencias..."
npm install

# 3. Construir el proyecto
echo "🔨 Construyendo aplicación..."
npm run build

# Verificamos si el build fue exitoso antes de reiniciar
if [ $? -eq 0 ]; then
  echo "✅ Build exitoso. Reiniciando servidor..."
  
  # 4. Reiniciar PM2
  # 'reload' intenta 0 downtime si está en modo cluster. Si falla, usa 'restart'.
  pm2 reload web-mundial || pm2 restart web-mundial
  
  echo "🚀 ¡Despliegue completado!"
else
  echo "❌ Error en el build. No se reinició el servidor."
  exit 1
fi
