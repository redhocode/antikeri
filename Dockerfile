# Stage 1: Build the application
FROM node:18 AS build

# Set working directory di dalam container
WORKDIR /app

# Menyalin package.json dan package-lock.json (atau yarn.lock) untuk instalasi dependensi
COPY package*.json ./

# Install dependencies aplikasi (termasuk dependensi development)
RUN npm install

# Menyalin semua file aplikasi ke dalam container
COPY . .

# Mengompilasi TypeScript ke JavaScript
RUN npm run build

# Stage 2: Prepare the production image
FROM node:18-slim

# Set working directory di dalam container
WORKDIR /app

# Menyalin hanya dependensi produksi dan hasil build dari stage sebelumnya
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

# Install only production dependencies
RUN npm install --production

# Menyalin file .env atau konfigurasi lainnya (Jika dibutuhkan)
COPY .env .env

# Menyediakan port yang digunakan oleh aplikasi
EXPOSE 3020

# Menjalankan aplikasi
CMD ["node", "dist/index.js"]
