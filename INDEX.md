# 📋 Index des fichiers du projet DCA Dashboard

## 📦 Contenu de l'archive

```
dca-dashboard/
│
├── 📄 README.md                    # Documentation principale
├── 📄 QUICKSTART.md                # Guide démarrage rapide (5 min)
├── 📄 SETUP.md                     # Guide d'installation détaillé
├── 📄 ARCHITECTURE.md              # Architecture technique
│
├── 🔧 package.json                 # Dépendances npm
├── 📝 .gitignore                   # Fichiers à ignorer par Git
├── 📝 .env.example                 # Template variables d'environnement
│
├── 🔨 init-git.sh                  # Script initialisation Git
├── 🚀 deploy.sh                    # Script de déploiement
│
├── public/
│   └── index.html                  # Page HTML principale
│
└── src/
    ├── App.js                      # Composant racine
    ├── index.js                    # Point d'entrée React
    ├── index.css                   # Styles globaux
    │
    ├── components/
    │   ├── DCADashboard.jsx        # Composant Dashboard principal
    │   └── DCADashboard_base.jsx   # Version de référence
    │
    ├── firebase/
    │   └── config.js               # ⚠️ Configuration Firebase (À COMPLÉTER)
    │
    └── hooks/
        ├── useAuth.js              # Hook authentification
        ├── useConfig.js            # Hook configuration utilisateur
        └── useCryptos.js           # Hook gestion cryptos
```

## 📚 Ordre de lecture recommandé

### Pour démarrer rapidement
1. **QUICKSTART.md** → Guide en 5 minutes
2. **src/firebase/config.js** → Ajouter vos credentials Firebase
3. **npm install && npm start** → Lancer l'app

### Pour comprendre le projet
1. **README.md** → Vue d'ensemble
2. **ARCHITECTURE.md** → Comprendre le fonctionnement
3. **src/hooks/** → Étudier la logique métier

### Pour déployer
1. **SETUP.md** → Guide complet
2. **deploy.sh** → Script automatique
3. **Firebase Console** → Configurer les règles de sécurité

## 🎯 Fichiers à modifier obligatoirement

### ⚠️ OBLIGATOIRE
- `src/firebase/config.js` → Ajouter vos credentials Firebase

### 📝 Optionnel
- `src/components/DCADashboard.jsx` → Personnaliser l'interface
- `src/index.css` → Modifier les styles
- `.env` → Utiliser les variables d'environnement (production)

## 🔥 Firebase - Configuration requise

### Console Firebase
1. **Firestore Database** → Mode test activé
2. **Authentication** → Fournisseur Anonyme activé
3. **Credentials** → Copiés dans `config.js`

### Fichiers Firebase
- `src/firebase/config.js` → Configuration principale
- `src/hooks/useAuth.js` → Logique authentification
- `src/hooks/useConfig.js` → Sync configuration
- `src/hooks/useCryptos.js` → Sync cryptos

## 📊 Composants React

### Principal
- `DCADashboard.jsx` → 975 lignes
  - Onglet Portefeuille
  - Onglet Configuration
  - Onglet Investissements

### Hooks
- `useAuth()` → Gestion utilisateur
- `useConfig(userId)` → Configuration globale
- `useCryptos(userId)` → Liste des cryptos

## 🔐 Sécurité

### ⚠️ À FAIRE après les tests
1. Firebase Console → Firestore Database → Règles
2. Remplacer par les règles sécurisées (voir QUICKSTART.md)
3. Publier les règles

### Variables sensibles
- Ne JAMAIS commiter les credentials Firebase
- Utiliser `.env` pour la production
- Ajouter `.env` dans `.gitignore` ✅

## 📦 Dépendances npm

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "firebase": "^10.7.1",
  "lucide-react": "^0.294.0",
  "react-scripts": "5.0.1"
}
```

## 🚀 Scripts disponibles

```bash
npm start       # Lancer en mode développement
npm run build   # Build pour production
npm test        # Lancer les tests
./init-git.sh   # Initialiser Git
./deploy.sh     # Déployer sur Firebase Hosting
```

## 📈 Taille du projet

- **Archive** : ~175 KB (sans node_modules)
- **Avec node_modules** : ~400 MB
- **Build optimisé** : ~2 MB

## 🔄 Workflow recommandé

1. **Développement local**
   ```bash
   npm install
   npm start
   ```

2. **Test des fonctionnalités**
   - Créer/modifier des cryptos
   - Ajouter des paliers
   - Valider des achats
   - Vérifier la sync Firestore

3. **Versionner**
   ```bash
   ./init-git.sh
   git push
   ```

4. **Déployer**
   ```bash
   ./deploy.sh
   ```

## 🆘 Aide rapide

| Problème | Solution |
|----------|----------|
| Page blanche | Vérifier console (F12) + credentials Firebase |
| "Permission denied" | Configurer règles Firestore |
| "Module not found" | `npm install` |
| Prix ne chargent pas | Vérifier connexion internet |

## 📞 Ressources

- **Firebase** : https://console.firebase.google.com/
- **React** : https://react.dev
- **CoinGecko API** : https://www.coingecko.com/en/api
- **Tailwind CSS** : https://tailwindcss.com

---

**Dernière mise à jour** : Décembre 2024
**Version** : 0.1.0
