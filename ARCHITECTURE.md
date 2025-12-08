# 🏗️ Architecture du projet

## Vue d'ensemble

Le projet est une application React qui utilise Firebase pour la persistence des données et l'authentification.

## Stack technique

- **Frontend** : React 18.2
- **Backend** : Firebase (Firestore + Authentication)
- **Styling** : Tailwind CSS (via CDN)
- **Icons** : Lucide React
- **API externe** : CoinGecko (prix des cryptos)

---

## 📁 Structure des fichiers

```
src/
├── components/
│   ├── DCADashboard.jsx          # Composant principal (UI + logique)
│   └── DCADashboard_base.jsx     # Version de base (référence)
│
├── firebase/
│   └── config.js                  # Configuration Firebase
│
├── hooks/
│   ├── useAuth.js                 # Gestion authentification
│   ├── useConfig.js               # Gestion configuration utilisateur
│   └── useCryptos.js              # Gestion des cryptomonnaies
│
├── App.js                         # Composant racine
├── index.js                       # Point d'entrée
└── index.css                      # Styles globaux
```

---

## 🔄 Flux de données

### 1. Authentification (useAuth)

```
Chargement de l'app
    ↓
onAuthStateChanged (Firebase)
    ↓
Utilisateur existe ?
    ↓ OUI           ↓ NON
setUser(user)   signInAnonymously()
    ↓                   ↓
Fin du loading      setUser(newUser)
```

### 2. Chargement des données (useConfig + useCryptos)

```
user.uid disponible
    ↓
onSnapshot(Firestore) ← Écoute en temps réel
    ↓
Données existent ?
    ↓ OUI              ↓ NON
Charger données    Créer données par défaut
    ↓                      ↓
setState(data)         setDoc(defaultData)
```

### 3. Sauvegarde des données

```
Modification locale (useState)
    ↓
useEffect avec dépendances
    ↓
setTimeout (debounce 1s)
    ↓
setDoc(Firestore, {merge: true})
    ↓
onSnapshot détecte le changement
    ↓
Mise à jour automatique des autres appareils
```

---

## 🔥 Structure Firestore

### Collection: `users/{userId}/config/main`

| Champ | Type | Description |
|-------|------|-------------|
| capitalDepart | number | Capital de départ en € |
| pourcentageUtilise | number | % du capital à utiliser pour DCA |
| dureeEnSemaines | number | Durée de la stratégie en semaines |
| semaineActuelle | number | Semaine en cours |

### Collection: `users/{userId}/cryptos/{cryptoId}`

| Champ | Type | Description |
|-------|------|-------------|
| nom | string | Nom de la crypto (ex: BTC) |
| coinGeckoId | string | ID CoinGecko pour l'API |
| repartition | number | % de répartition dans le portefeuille |
| prixActuel | number | Prix actuel en EUR |
| paliers | array | Liste des paliers de prix |
| historique | array | Historique des achats |

#### Structure d'un palier :

```javascript
{
  min: number,           // Prix minimum de la tranche
  max: number | null,    // Prix maximum (null = Infinity)
  coeff: number,         // Coefficient multiplicateur
  label: string          // Label du palier (ex: "Très haut")
}
```

#### Structure d'un achat (historique) :

```javascript
{
  semaine: number,       // Numéro de la semaine
  quantite: number,      // Quantité achetée
  prixAchat: number,     // Prix d'achat en EUR
  montant: number        // Montant investi en EUR
}
```

---

## 🎣 Hooks personnalisés

### useAuth()

**Rôle** : Gérer l'authentification Firebase

**Retour** :
- `user` : Objet utilisateur Firebase (ou null)
- `loading` : Boolean indiquant le chargement

**Fonctionnement** :
1. Écoute `onAuthStateChanged`
2. Si pas d'utilisateur → connexion anonyme automatique
3. Retourne l'utilisateur connecté

---

### useConfig(userId)

**Rôle** : Gérer la configuration globale de l'utilisateur

**Paramètres** :
- `userId` : UID de l'utilisateur Firebase

**Retour** :
- `config` : Objet configuration
- `updateConfig(newConfig)` : Fonction pour mettre à jour
- `loading` : Boolean indiquant le chargement

**Fonctionnement** :
1. Écoute en temps réel avec `onSnapshot`
2. Si config n'existe pas → créer avec valeurs par défaut
3. Mise à jour via `setDoc` avec `{merge: true}`

---

### useCryptos(userId)

**Rôle** : Gérer la liste des cryptomonnaies

**Paramètres** :
- `userId` : UID de l'utilisateur Firebase

**Retour** :
- `cryptos` : Array de cryptos
- `updateCrypto(id, data)` : Mise à jour d'une crypto
- `deleteCrypto(id)` : Suppression d'une crypto
- `addCrypto(data)` : Ajout d'une crypto
- `loading` : Boolean indiquant le chargement

**Fonctionnement** :
1. Écoute en temps réel avec `onSnapshot` sur la collection
2. Si vide → initialiser avec cryptos par défaut
3. Conversion `Infinity` ↔ `null` pour compatibilité Firestore
4. CRUD complet sur les cryptos

---

## 🔐 Sécurité

### Règles Firestore (à configurer)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chaque utilisateur ne peut accéder qu'à ses propres données
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null 
                        && request.auth.uid == userId;
    }
  }
}
```

**Explication** :
- `request.auth != null` : L'utilisateur doit être authentifié
- `request.auth.uid == userId` : L'utilisateur ne peut accéder qu'à ses propres documents

---

## ⚡ Optimisations

### 1. Debouncing

Toutes les modifications locales attendent 1 seconde avant de sauvegarder dans Firebase, évitant des écritures excessives.

```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    updateConfig(localState);
  }, 1000);
  return () => clearTimeout(timer);
}, [localState]);
```

### 2. Temps réel sélectif

- Configuration : Temps réel (rare et petite)
- Cryptos : Temps réel (rare et petite)
- Prix API : Polling 60s (externe, non stocké)

### 3. Merge au lieu de Replace

```javascript
await setDoc(ref, newData, { merge: true });
```

Permet de ne mettre à jour que les champs modifiés.

---

## 🔄 Synchronisation multi-appareils

Grâce à `onSnapshot`, tous les appareils connectés avec le même utilisateur voient les changements en temps réel :

```
Appareil A : modifie config
    ↓
Firebase Firestore
    ↓
onSnapshot détecte changement
    ↓
Appareil B : reçoit mise à jour automatiquement
```

---

## 🌐 API externe : CoinGecko

**Endpoint utilisé** :
```
GET https://api.coingecko.com/api/v3/simple/price
  ?ids=bitcoin,ethereum,solana,dogecoin
  &vs_currencies=usd,eur
```

**Fréquence** : Toutes les 60 secondes

**Limite gratuite** : 10-50 requêtes/minute (largement suffisant)

**Gestion d'erreur** : Try/catch silencieux (continue avec anciennes valeurs)

---

## 🚀 Performance

### Chargement initial
1. Auth : ~200ms
2. Config : ~300ms
3. Cryptos : ~400ms
4. **Total** : ~1 seconde

### Mise à jour
1. Modification locale : Instantané (useState)
2. Sauvegarde Firebase : 1s de debounce
3. Propagation temps réel : ~100-300ms

---

## 📦 Build & Déploiement

### Build local
```bash
npm run build
# → Crée le dossier build/ avec les fichiers statiques
```

### Déploiement Firebase Hosting
```bash
firebase init hosting
firebase deploy
```

### Variables d'environnement (production)

Pour sécuriser les credentials Firebase en production, utilisez les variables d'environnement :

1. Créer un fichier `.env`
2. Remplacer dans `config.js` :

```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // etc...
};
```

---

## 🧪 Tests (à implémenter)

### Tests unitaires suggérés :
- Hooks : `useAuth`, `useConfig`, `useCryptos`
- Fonctions de calcul : `getCoeffForCrypto`, `calculsSemaine`
- Conversion `Infinity` ↔ `null`

### Tests d'intégration suggérés :
- Workflow complet : Auth → Chargement → Modification → Sauvegarde
- Synchronisation multi-tabs

---

## 📈 Évolutions possibles

1. **Authentification réelle** : Email/Google/GitHub
2. **Multi-devises** : Support USD, GBP, etc.
3. **Graphiques** : Visualisation de l'évolution du portefeuille
4. **Notifications** : Alertes de prix
5. **Export** : CSV/PDF des historiques
6. **Comparaison** : Benchmark vs stratégie classique
7. **Mode offline** : Cache avec service workers

---

**Questions ?** Consultez la documentation Firebase : https://firebase.google.com/docs
