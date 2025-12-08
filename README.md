# 🚀 DCA Dashboard - Gestion d'investissement crypto

Dashboard pour gérer votre stratégie DCA (Dollar Cost Averaging) avec Firebase.

## 📋 Prérequis

- Node.js (v14 ou supérieur)
- Un compte Firebase
- Git

## 🔧 Installation

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd dca-dashboard
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Firebase

#### a) Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Suivez les étapes de création

#### b) Activer Firestore

1. Dans votre projet Firebase, allez dans **Firestore Database**
2. Cliquez sur "Créer une base de données"
3. Choisissez le mode **"Démarrer en mode test"** (vous pourrez sécuriser plus tard)
4. Sélectionnez une région proche de vous

#### c) Activer l'authentification

1. Allez dans **Authentication**
2. Cliquez sur "Commencer"
3. Activez le **fournisseur Anonyme** (pour simplifier)

#### d) Récupérer les credentials

1. Cliquez sur l'icône **Paramètres (⚙️)** → **Paramètres du projet**
2. Scrollez jusqu'à "Vos applications"
3. Cliquez sur l'icône Web `</>`
4. Enregistrez l'application
5. Copiez la configuration `firebaseConfig`

#### e) Configurer l'application

1. Ouvrez le fichier `src/firebase/config.js`
2. Remplacez les valeurs par vos credentials Firebase :

```javascript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "votre-app-id"
};
```

### 4. Lancer l'application

```bash
npm start
```

L'application s'ouvre automatiquement sur [http://localhost:3000](http://localhost:3000)

## 📊 Structure du projet

```
dca-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── DCADashboard.jsx      # Composant principal du dashboard
│   ├── firebase/
│   │   └── config.js              # Configuration Firebase
│   ├── hooks/
│   │   ├── useAuth.js             # Hook d'authentification
│   │   ├── useConfig.js           # Hook pour la configuration utilisateur
│   │   └── useCryptos.js          # Hook pour les cryptos
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## 🔥 Structure Firestore

```
users/
  └── {userId}/
      ├── config/
      │   └── main/
      │       ├── capitalDepart
      │       ├── pourcentageUtilise
      │       ├── dureeEnSemaines
      │       └── semaineActuelle
      │
      └── cryptos/
          ├── {cryptoId1}/
          │   ├── nom
          │   ├── coinGeckoId
          │   ├── repartition
          │   ├── prixActuel
          │   ├── paliers[]
          │   └── historique[]
          └── {cryptoId2}/
              └── ...
```

## 🛡️ Sécuriser Firebase (après les tests)

Dans Firebase Console → Firestore Database → Règles, remplacez par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## ✨ Fonctionnalités

- ✅ **Sauvegarde automatique** dans Firebase
- ✅ **Synchronisation en temps réel** entre appareils
- ✅ **Prix des cryptos en direct** via CoinGecko
- ✅ **Gestion de paliers personnalisables**
- ✅ **Historique des achats**
- ✅ **Calcul automatique des investissements**

## 🚀 Déploiement

### Déployer sur Firebase Hosting

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialiser Firebase
firebase init hosting

# Build et déploiement
npm run build
firebase deploy
```

## 📝 Notes importantes

- Les données sont liées à l'authentification Firebase (utilisateur anonyme par défaut)
- Pour basculer vers une vraie authentification (email/Google), modifiez `src/hooks/useAuth.js`
- Les prix des cryptos sont récupérés toutes les 60 secondes via l'API CoinGecko (gratuite)

## 🤝 Contribuer

N'hésitez pas à ouvrir des issues ou des pull requests !

## 📄 Licence

MIT
