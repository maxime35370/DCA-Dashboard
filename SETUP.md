# 📦 Récupération et mise en place du projet

## 🎯 Ce que vous avez

Vous avez téléchargé l'archive `dca-dashboard.tar.gz` qui contient :

```
✅ Structure complète du projet React
✅ Configuration Firebase (à compléter)
✅ Hooks personnalisés (Auth, Config, Cryptos)
✅ Composant Dashboard complet
✅ Documentation complète
✅ Scripts d'initialisation
```

---

## 🚀 Installation en 3 étapes

### Étape 1 : Extraire l'archive

```bash
# Extraire l'archive
tar -xzf dca-dashboard.tar.gz

# Aller dans le dossier
cd dca-dashboard

# Installer les dépendances
npm install
```

⏱️ **Temps estimé** : 2-3 minutes

---

### Étape 2 : Configurer Firebase

#### A. Créer le projet Firebase (voir QUICKSTART.md)

1. Allez sur https://console.firebase.google.com/
2. Créez un nouveau projet
3. Activez **Firestore Database** (mode test)
4. Activez **Authentication** (fournisseur Anonyme)
5. Récupérez vos credentials

#### B. Configurer l'application

**Option 1 : Modifier directement config.js**

Ouvrez `src/firebase/config.js` et remplacez :

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

**Option 2 : Utiliser les variables d'environnement**

```bash
# Copier le template
cp .env.example .env

# Éditer .env avec vos credentials
nano .env  # ou votre éditeur préféré
```

⏱️ **Temps estimé** : 5 minutes

---

### Étape 3 : Lancer l'application

```bash
npm start
```

L'application s'ouvre automatiquement sur http://localhost:3000

⏱️ **Temps estimé** : 10 secondes

---

## 🔧 Structure des fichiers clés

Voici les fichiers que vous devrez potentiellement modifier :

### 🔥 Firebase

```
src/firebase/config.js
└─ Configuration Firebase (OBLIGATOIRE)
```

### 🎨 Personnalisation

```
src/components/DCADashboard.jsx
└─ Composant principal (modifier l'UI si besoin)

src/index.css
└─ Styles globaux
```

### 🎣 Logique métier

```
src/hooks/
├─ useAuth.js       (authentification)
├─ useConfig.js     (configuration utilisateur)
└─ useCryptos.js    (gestion des cryptos)
```

---

## 📚 Documentation disponible

| Fichier | Description |
|---------|-------------|
| `README.md` | Documentation complète du projet |
| `QUICKSTART.md` | Guide de démarrage rapide (5 min) |
| `ARCHITECTURE.md` | Explication de l'architecture technique |
| Ce fichier | Guide de récupération |

---

## 🔐 Sécuriser Firestore (IMPORTANT)

Après avoir testé que tout fonctionne, **sécurisez vos données** :

1. Allez dans **Firebase Console** → **Firestore Database** → **Règles**
2. Remplacez par :

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

3. Cliquez sur **"Publier"**

⚠️ **Sans cela, n'importe qui peut accéder à vos données !**

---

## 📤 Versionner sur Git

### Initialisation automatique

```bash
# Exécuter le script d'initialisation
./init-git.sh
```

### Ou manuellement

```bash
git init
git add .
git commit -m "Initial commit"
```

### Pousser sur GitHub

```bash
# Créer un repo sur GitHub, puis :
git remote add origin https://github.com/VOTRE_USERNAME/dca-dashboard.git
git branch -M main
git push -u origin main
```

---

## 🚀 Déployer en production

### Option 1 : Firebase Hosting (recommandé)

```bash
# Automatique
./deploy.sh

# Ou manuel
firebase init hosting
npm run build
firebase deploy
```

### Option 2 : Vercel

```bash
npm install -g vercel
vercel
```

### Option 3 : Netlify

```bash
npm install -g netlify-cli
netlify init
netlify deploy --prod
```

---

## ✅ Checklist de vérification

Avant de considérer le projet prêt :

- [ ] `npm install` réussi
- [ ] Firebase configuré (credentials)
- [ ] `npm start` fonctionne
- [ ] Connexion utilisateur réussie
- [ ] Données se sauvegardent dans Firestore
- [ ] Prix des cryptos se chargent
- [ ] Règles Firestore configurées
- [ ] Git initialisé
- [ ] Projet poussé sur GitHub

---

## 🆘 Besoin d'aide ?

### Commandes utiles

```bash
# Vérifier les logs en temps réel
npm start

# Build de production
npm run build

# Voir les erreurs Firebase
firebase debug

# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Erreurs communes

**❌ "Firebase: Error (auth/api-key-not-valid)"**
→ Vérifiez vos credentials dans `src/firebase/config.js`

**❌ "Missing or insufficient permissions"**
→ Configurez les règles Firestore (voir section Sécuriser)

**❌ "Module not found"**
→ Réinstallez les dépendances : `npm install`

---

## 📞 Support

- Issues GitHub : Ouvrez une issue sur votre repo
- Documentation Firebase : https://firebase.google.com/docs
- Documentation React : https://react.dev

---

**🎉 Bon développement !**
