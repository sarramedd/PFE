#!/bin/sh
# Fix permanent : remplace http://localhost:8088 dans tous les fichiers JS compilés
# S'exécute au démarrage du container avant nginx
echo "Applying API URL fix in compiled JS..."
find /usr/share/nginx/html -name "*.js" -exec sed -i "s|http://localhost:8088||g" {} \;
echo "Fix applied. Starting nginx..."
exec nginx -g "daemon off;"
