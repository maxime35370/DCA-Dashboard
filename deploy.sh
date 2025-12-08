#!/bin/bash

# Script de déploiement DCA Dashboard

echo "🚀 Déploiement DCA Dashboard"
echo "=============================="
echo ""

# Vérifier que Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI n'est pas installé"
    echo "📦 Installation..."
    npm install -g firebase-tools
fi

# Vérifier que l'utilisateur est connecté
echo "🔐 Vérification de la connexion Firebase..."
firebase login:list &> /dev/null

if [ $? -ne 0 ]; then
    echo "🔑 Connexion à Firebase..."
    firebase login
fi

# Build de l'application
echo ""
echo "🏗️  Build de l'application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Échec du build"
    exit 1
fi

echo "✅ Build réussi !"

# Déploiement
echo ""
echo "🚀 Déploiement sur Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Déploiement réussi !"
    echo "🌐 Votre application est en ligne !"
    echo ""
    firebase hosting:channel:list
else
    echo "❌ Échec du déploiement"
    exit 1
fi
