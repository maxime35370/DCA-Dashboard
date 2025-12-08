# 🚀 START HERE - Projet DCA Dashboard

Bienvenue dans votre projet DCA Dashboard avec Firebase !

## 📦 Ce que vous avez téléchargé

Une application React complète pour gérer votre stratégie d'investissement DCA (Dollar Cost Averaging) en cryptomonnaies avec :

✅ **Sauvegarde automatique** dans Firebase Firestore  
✅ **Synchronisation en temps réel** entre appareils  
✅ **Prix des cryptos en direct** via API CoinGecko  
✅ **Gestion de paliers personnalisables** par crypto  
✅ **Historique complet** de vos achats  
✅ **3 onglets** : Portefeuille, Configuration, Investissements  

---

## 🎯 Par où commencer ?

### Vous voulez démarrer RAPIDEMENT (5 min) ?

📖 **Lisez : `QUICKSTART.md`**

```bash
# Étapes résumées :
1. Extraire l'archive
2. Configurer Firebase (5 min)
3. npm install && npm start
```

### Vous voulez COMPRENDRE le projet ?

📖 **Lisez : `README.md`** puis **`ARCHITECTURE.md`**

### Vous avez besoin d'AIDE avec Firebase ?

📖 **Lisez : `FIREBASE-GUIDE.md`** (guide visuel pas à pas)

### Vous voulez DÉPLOYER en production ?

📖 **Lisez : `SETUP.md`** puis lancez **`./deploy.sh`**

---

## 📚 Liste complète des fichiers

| Fichier | Description | Quand le lire ? |
|---------|-------------|-----------------|
| **START-HERE.md** | 👈 Vous êtes ici | D'abord |
| **QUICKSTART.md** | Guide rapide 5 min | Pour démarrer vite |
| **README.md** | Documentation complète | Pour comprendre |
| **FIREBASE-GUIDE.md** | Guide visuel Firebase | Si bloqué sur Firebase |
| **ARCHITECTURE.md** | Architecture technique | Pour approfondir |
| **SETUP.md** | Installation détaillée | Si problèmes |
| **INDEX.md** | Index de tous les fichiers | Pour s'orienter |

---

## ⚡ Installation express (pour les pressés)

```bash
# 1. Extraire
tar -xzf dca-dashboard.tar.gz
cd dca-dashboard

# 2. Installer
npm install

# 3. Configurer Firebase
# → Ouvrez QUICKSTART.md et suivez les 5 étapes

# 4. Lancer
npm start
```

---

## 🔥 Firebase - Ce qu'il faut faire

### ✅ À faire MAINTENANT (obligatoire)

1. **Créer un projet Firebase** sur https://console.firebase.google.com/
2. **Activer Firestore Database** (mode test)
3. **Activer Authentication** (fournisseur Anonyme)
4. **Copier les credentials** Firebase
5. **Coller dans** `src/firebase/config.js`

**Temps estimé** : 5 minutes  
**Guide détaillé** : Voir `FIREBASE-GUIDE.md`

### ⚠️ À faire APRÈS LES TESTS (sécurité)

1. **Firestore Console** → Règles
2. **Remplacer** par les règles sécurisées
3. **Publier** les règles

**Guide** : Voir section "Sécurité" dans `QUICKSTART.md`

---

## 🗂️ Structure du projet

```
dca-dashboard/
├── 📄 Documentation (vous êtes ici)
│   ├── START-HERE.md
│   ├── QUICKSTART.md
│   ├── README.md
│   ├── FIREBASE-GUIDE.md
│   ├── ARCHITECTURE.md
│   ├── SETUP.md
│   └── INDEX.md
│
├── 🔧 Configuration
│   ├── package.json
│   ├── .gitignore
│   └── .env.example
│
├── 🔨 Scripts
│   ├── init-git.sh
│   └── deploy.sh
│
└── 💻 Code source
    └── src/
        ├── components/       (Interface utilisateur)
        ├── firebase/         (Configuration Firebase)
        ├── hooks/            (Logique métier)
        ├── App.js
        └── index.js
```

---

## 🎯 Workflow recommandé

### 1️⃣ Installation & Configuration (10 min)

```
Extraire archive
    ↓
npm install
    ↓
Configurer Firebase
    ↓
Modifier src/firebase/config.js
```

### 2️⃣ Test en local (5 min)

```
npm start
    ↓
Tester l'app dans le navigateur
    ↓
Vérifier Firebase Console
    ↓
Valider que les données se sauvent
```

### 3️⃣ Versionner sur Git (2 min)

```
./init-git.sh
    ↓
Créer repo sur GitHub
    ↓
git push
```

### 4️⃣ Déployer en production (5 min)

```
Sécuriser Firestore (règles)
    ↓
./deploy.sh
    ↓
Application en ligne !
```

---

## ❓ Questions fréquentes

### Q: L'application affiche une page blanche

**R:** Vérifiez :
1. Console du navigateur (F12) pour voir les erreurs
2. Que vous avez bien modifié `src/firebase/config.js`
3. Que les credentials Firebase sont corrects

### Q: "Permission denied" dans Firestore

**R:** Firestore n'est pas en mode test ou les règles sont trop restrictives
→ Voir `FIREBASE-GUIDE.md` étape 2

### Q: Les prix des cryptos ne se chargent pas

**R:** 
- Vérifiez votre connexion internet
- L'API CoinGecko peut être temporairement indisponible
- Attendez 1 minute et rafraîchissez

### Q: Comment ajouter une nouvelle crypto ?

**R:** Dans l'onglet Configuration, vous pouvez modifier les cryptos existantes. Pour en ajouter, modifiez `DEFAULT_CRYPTOS` dans `src/hooks/useCryptos.js`

### Q: Mes données sont-elles sécurisées ?

**R:** Par défaut NON (mode test Firebase). Vous DEVEZ configurer les règles de sécurité après les tests → Voir `QUICKSTART.md`

---

## 🆘 Besoin d'aide ?

### 1. Consultez la documentation

- **Problème Firebase** → `FIREBASE-GUIDE.md`
- **Erreur d'installation** → `SETUP.md`
- **Question technique** → `ARCHITECTURE.md`

### 2. Commandes de diagnostic

```bash
# Vérifier les dépendances
npm list

# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Voir les logs Firebase
firebase debug
```

### 3. Ressources externes

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [CoinGecko API](https://www.coingecko.com/en/api)

---

## 🎉 Prêt à commencer ?

1. **Ouvrez** `QUICKSTART.md`
2. **Suivez** les 5 étapes
3. **Lancez** `npm start`
4. **Profitez** de votre dashboard !

---

## 📌 Checklist avant de commencer

- [ ] Archive extraite
- [ ] Node.js installé (v14+)
- [ ] Compte Firebase créé
- [ ] `QUICKSTART.md` lu
- [ ] Prêt à coder ! 🚀

---

**Dernière mise à jour** : Décembre 2024  
**Version** : 0.1.0  
**Auteur** : Votre nom  

**⭐ Bon développement !**
