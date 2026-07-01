# Stage 1 — Build Angular
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build -- --configuration=production

# Stage 2 — Serve avec nginx
FROM nginx:alpine
# Copier les fichiers compilés
COPY --from=build /app/dist/gestion-projet-frontend /usr/share/nginx/html
# Copier la config nginx si elle existe
COPY nginx.conf /etc/nginx/conf.d/default.conf 2>/dev/null || true
# Copier l'entrypoint qui applique le fix localhost:8088
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
# Utiliser notre entrypoint au lieu de celui par défaut
ENTRYPOINT ["/docker-entrypoint.sh"]
