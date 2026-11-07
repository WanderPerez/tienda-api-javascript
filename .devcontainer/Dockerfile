FROM node:22-slim

USER root

# 1. Instalar dependencias del sistema
RUN apt-get update -qq && \
    apt-get install -y chromium libnss3 curl && \
    rm -rf /var/lib/apt/lists/*

# 2. Actualizar npm a la última versión globalmente
RUN npm install -g npm@latest

# 3. Instalar http-server globalmente como root
RUN npm install -g http-server

# 4. Volver al usuario normal del contenedor
USER root