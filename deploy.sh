#!/usr/bin/env bash
# ============================================================================
# Build + push + deploy sur Azure AKS
# ============================================================================
# Usage : ./deploy.sh
# Pre-requis : az login + Docker
# ============================================================================
set -e

# Config a personnaliser
ACR_NAME=${ACR_NAME:-gestionprojetacr}
RG=${RG:-gestion-projet-rg}
AKS=${AKS:-gestion-projet-aks}
TAG=${TAG:-$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M)}

echo ">> Build & push backend (tag: $TAG)"
az acr build --registry "$ACR_NAME" \
    --image "gestion-projet-backend:$TAG" \
    --image "gestion-projet-backend:latest" \
    ./GestionProjet

echo ">> Build & push frontend (tag: $TAG)"
az acr build --registry "$ACR_NAME" \
    --image "gestion-projet-frontend:$TAG" \
    --image "gestion-projet-frontend:latest" \
    ./gestion-projet-frontend

echo ">> Recuperation du kubeconfig"
az aks get-credentials --resource-group "$RG" --name "$AKS" --overwrite-existing

echo ">> Mise a jour du Deployment backend"
kubectl set image deployment/gestion-projet-backend \
    backend="$ACR_NAME.azurecr.io/gestion-projet-backend:$TAG"

echo ">> Mise a jour du Deployment frontend (si present)"
kubectl set image deployment/gestion-projet-frontend \
    frontend="$ACR_NAME.azurecr.io/gestion-projet-frontend:$TAG" 2>/dev/null || \
    echo "   (deployment frontend non trouve, ignore)"

echo ">> Attente de la fin du rollout backend"
kubectl rollout status deployment/gestion-projet-backend --timeout=5m

echo ""
echo "=== Deploiement termine ==="
echo "Tag deploye : $TAG"
kubectl get pods
