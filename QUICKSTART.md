# 🚀 Guide de démarrage rapide - 5 minutes

## Étape 1 : Créer le projet Firebase (2 min)

1. **Allez sur** : https://console.firebase.google.com/
2. **Cliquez sur** : "Ajouter un projet"
3. **Nom du projet** : "dca-dashboard" (ou autre)
4. **Désactiver** Google Analytics (pas nécessaire)
5. **Cliquez sur** : "Créer le projet"

## Étape 2 : Configurer Firestore (1 min)

1. **Dans le menu gauche** → "Firestore Database"
2. **Cliquez sur** : "Créer une base de données"
3. **Mode** : "Démarrer en mode test" ⚠️ (temporaire, pour tester)
4. **Région** : Choisissez la plus proche (ex: europe-west1)
5. **Cliquez sur** : "Activer"

## Étape 3 : Activer l'authentification (30 sec)

1. **Dans le menu gauche** → "Authentication"
2. **Cliquez sur** : "Commencer"
3. **Dans "Sign-in method"** → Activez "Anonyme"
4. **Cliquez sur** : "Enregistrer"

## Étape 4 : Récupérer les credentials (1 min)

1. **Cliquez sur l'icône Paramètres** ⚙️ (en haut à gauche)
2. **Paramètres du projet**
3. **Scrollez jusqu'à** "Vos applications"
4. **Cliquez sur** l'icône Web `</>`
5. **Surnom de l'application** : "DCA Dashboard"
6. **NE PAS** cocher "Firebase Hosting"
7. **Cliquez sur** : "Enregistrer l'application"
8. **COPIEZ** tout le bloc `firebaseConfig` :

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "...",
  projectId: "...",
  // etc...
};
```

## Étape 5 : Configurer l'application (30 sec)

1. **Ouvrez** le fichier `src/firebase/config.js`
2. **Remplacez** la section `firebaseConfig` par celle que vous venez de copier
3. **Sauvegardez** le fichier

## Étape 6 : Lancer l'application (10 sec)

```bash
npm install
npm start
```

✅ **C'est prêt !** L'application s'ouvre sur http://localhost:3000

---

## 🔒 IMPORTANT - Sécuriser après les tests

Une fois que tout fonctionne, **sécurisez Firestore** :

1. **Firestore Database** → **Règles**
2. **Remplacez** par :

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

3. **Cliquez sur** "Publier"

---

## 🎯 Utilisation

### Premier lancement :
- L'app crée automatiquement un utilisateur anonyme
- Des cryptos par défaut sont initialisées (BTC, ETH, SOL, DOGE)
- Toutes vos modifications sont sauvegardées automatiquement

### Onglets disponibles :
1. **Portefeuille** : Vue d'ensemble et statistiques
2. **Configuration** : Paramètres et paliers de prix
3. **Investissements** : Gestion hebdomadaire des achats

### Boutons importants :
- **Actualiser les prix** : Met à jour les prix en temps réel (API CoinGecko)
- **Valider les achats** : Enregistre l'achat de la semaine dans l'historique

---

## ❓ Problèmes courants

**❌ Page blanche**
→ Vérifiez la console du navigateur (F12)
→ Vérifiez que les credentials Firebase sont corrects

**❌ Erreur "Permission denied"**
→ Vérifiez que Firestore est en "mode test"
→ Ou configurez les règles de sécurité

**❌ Prix ne se chargent pas**
→ Vérifiez votre connexion internet
→ L'API CoinGecko peut être temporairement indisponible

---

## 📱 Accéder depuis un autre appareil

1. **Même utilisateur** : Pas possible avec auth anonyme
2. **Solution** : Passer à l'auth Email/Google dans `src/hooks/useAuth.js`
3. **Multi-devices** : Les données se synchronisent automatiquement !

---

**Besoin d'aide ?** Ouvrez une issue sur GitHub !
