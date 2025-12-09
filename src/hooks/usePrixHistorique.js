import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Mapping CoinGecko ID -> Binance Symbol
const BINANCE_SYMBOLS = {
  'bitcoin': 'BTCEUR',
  'ethereum': 'ETHEUR',
  'solana': 'SOLEUR',
  'dogecoin': 'DOGEEUR'
};

const BINANCE_SYMBOLS_USD = {
  'bitcoin': 'BTCUSDT',
  'ethereum': 'ETHUSDT',
  'solana': 'SOLUSDT',
  'dogecoin': 'DOGEUSDT'
};

export function usePrixHistorique(userId) {
  const [prixCache, setPrixCache] = useState({});
  const [loading, setLoading] = useState(false);

  // Charger le cache depuis Firebase au démarrage
  useEffect(() => {
    if (!userId) return;

    const loadCache = async () => {
      try {
        const docRef = doc(db, 'users', userId, 'cache', 'prixHistorique');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPrixCache(docSnap.data().prix || {});
        }
      } catch (error) {
        console.error('Erreur chargement cache prix:', error);
      }
    };

    loadCache();
  }, [userId]);

  // Sauvegarder le cache dans Firebase
  const sauvegarderCache = async (nouveauCache) => {
    if (!userId) return;

    try {
      const docRef = doc(db, 'users', userId, 'cache', 'prixHistorique');
      await setDoc(docRef, { prix: nouveauCache }, { merge: true });
    } catch (error) {
      console.error('Erreur sauvegarde cache prix:', error);
    }
  };

  // Vider le cache
  const viderCache = async () => {
    if (!userId) return;
    
    try {
      const docRef = doc(db, 'users', userId, 'cache', 'prixHistorique');
      await setDoc(docRef, { prix: {} });
      setPrixCache({});
      console.log('🗑️ Cache vidé !');
    } catch (error) {
      console.error('Erreur vidage cache:', error);
    }
  };

  // Récupérer le prix via Binance API
  const getPrixBinance = async (coinGeckoId, date) => {
    const symbolEur = BINANCE_SYMBOLS[coinGeckoId];
    const symbolUsd = BINANCE_SYMBOLS_USD[coinGeckoId];
    
    if (!symbolEur || !symbolUsd) {
      console.error(`Symbol Binance non trouvé pour: ${coinGeckoId}`);
      return null;
    }

    // Timestamp du jour à minuit UTC
    const timestamp = new Date(date);
    timestamp.setUTCHours(0, 0, 0, 0);
    const startTime = timestamp.getTime();
    const endTime = startTime + 24 * 60 * 60 * 1000; // +1 jour

    try {
      // Requête EUR
      const responseEur = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbolEur}&interval=1d&startTime=${startTime}&endTime=${endTime}&limit=1`
      );
      const dataEur = await responseEur.json();

      // Requête USD
      const responseUsd = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbolUsd}&interval=1d&startTime=${startTime}&endTime=${endTime}&limit=1`
      );
      const dataUsd = await responseUsd.json();

      if (dataEur.length > 0 && dataUsd.length > 0) {
        // Index 1 = prix d'ouverture, Index 4 = prix de clôture
        // On utilise le prix d'ouverture (début de journée)
        return {
          eur: parseFloat(dataEur[0][1]),
          usd: parseFloat(dataUsd[0][1])
        };
      }
    } catch (error) {
      console.error(`Erreur Binance API pour ${coinGeckoId}:`, error);
    }

    return null;
  };

  // Récupérer le prix pour une crypto à une date donnée (avec cache)
  const getPrix = async (coinGeckoId, date) => {
    const dateStr = date.toISOString().split('T')[0];
    const cacheKey = `${coinGeckoId}_${dateStr}`;

    // Vérifier si déjà en cache
    if (prixCache[cacheKey]) {
      console.log('✅ Cache hit:', coinGeckoId, dateStr);
      return prixCache[cacheKey];
    }

    // Vérifier si date future
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);
    const dateCheck = new Date(date);
    dateCheck.setHours(0, 0, 0, 0);

    if (dateCheck > aujourdHui) {
      console.log('⏭️ Date future, pas de prix:', dateStr);
      return null;
    }

    console.log('🔍 Appel Binance API:', coinGeckoId, dateStr);
    
    // Appeler l'API Binance
    const prixData = await getPrixBinance(coinGeckoId, date);

    if (prixData) {
      console.log('✅ Prix Binance reçu:', coinGeckoId, dateStr, 'EUR:', prixData.eur, 'USD:', prixData.usd);
      
      // Mettre en cache
      setPrixCache(prevCache => {
        const nouveauCache = {
          ...prevCache,
          [cacheKey]: prixData
        };
        sauvegarderCache(nouveauCache);
        return nouveauCache;
      });

      return prixData;
    }

    return null;
  };

  // Récupérer les prix pour plusieurs cryptos à une date donnée
  const getPrixPourDate = async (cryptos, date) => {
    if (!cryptos || cryptos.length === 0) return {};

    setLoading(true);
    const resultats = {};

    for (const crypto of cryptos) {
      const prix = await getPrix(crypto.coinGeckoId, date);
      if (prix) {
        resultats[crypto.coinGeckoId] = prix;
      }
      // Petit délai pour éviter de surcharger (même si Binance est généreux)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setLoading(false);
    return resultats;
  };

  // Pré-charger toutes les dates d'une période
  const prechargerPeriode = async (cryptos, dates) => {
    if (!cryptos || cryptos.length === 0 || !dates || dates.length === 0) return;

    console.log(`📦 Préchargement de ${dates.length} dates pour ${cryptos.length} cryptos...`);
    setLoading(true);

    for (const date of dates) {
      await getPrixPourDate(cryptos, date);
    }

    setLoading(false);
    console.log('✅ Préchargement terminé !');
  };

  return {
    prixCache,
    loading,
    getPrix,
    getPrixPourDate,
    prechargerPeriode,
    viderCache
  };
}