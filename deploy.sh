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
  
  # 4. Recargar PM2 (zero-downtime, toma nuevos archivos y .env)
  pm2 reload web-mundial
  pm2 reload goal-bot 2>/dev/null || echo "⚠️  goal-bot no está corriendo (inicia con: pm2 start ecosystem.config.cjs --only goal-bot)"
  pm2 reload fixture-sync 2>/dev/null || echo "⚠️  fixture-sync no está corriendo (inicia con: pm2 start ecosystem.config.cjs --only fixture-sync)"

  echo "🚀 ¡Despliegue completado!"
else
  echo "❌ Error en el build. No se reinició el servidor."
  exit 1
fi
