# Étape 1 : build Angular
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN  npm run build

# Étape 2 : serveur nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/gestion-projet-frontend /usr/share/nginx/html

EXPOSE 80