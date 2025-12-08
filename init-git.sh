#!/bin/bash

# Script d'initialisation Git pour DCA Dashboard

echo "🚀 Initialisation du dépôt Git..."

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "🎉 Initial commit - DCA Dashboard avec Firebase

- Structure du projet React
- Intégration Firebase (Firestore + Auth)
- Hooks personnalisés (useAuth, useConfig, useCryptos)
- Composant Dashboard complet
- Sauvegarde automatique en temps réel
- Gestion des paliers de prix
- Récupération des prix via CoinGecko API
- Documentation complète (README + QUICKSTART)"

echo "✅ Dépôt Git initialisé !"
echo ""
echo "📝 Prochaines étapes :"
echo "1. Créez un repo sur GitHub"
echo "2. Ajoutez le remote :"
echo "   git remote add origin https://github.com/VOTRE_USERNAME/dca-dashboard.git"
echo "3. Pushez le code :"
echo "   git branch -M main"
echo "   git push -u origin main"
