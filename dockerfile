# Usa una versión reciente de Node.js
FROM node:18

# Instala herramientas de construcción y bibliotecas necesarias
RUN apt-get update && apt-get install -y \
    build-essential \
    python3

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala todas las dependencias (incluidas las de producción y desarrollo)
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto en el que corre la aplicación (ajusta si tu API usa un puerto diferente)
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "run", "dev:api"]
