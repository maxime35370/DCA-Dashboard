import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

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

  // Récupérer le prix pour une crypto à une date donnée
  const getPrix = async (coinGeckoId, date) => {
    const dateStr = date.toISOString().split('T')[0]; // Format: 2025-12-08
    const cacheKey = `${coinGeckoId}_${dateStr}`;
    console.log('🔍 Recherche prix:', coinGeckoId, 'pour date:', dateStr, 'Cache:', prixCache[cacheKey] ? 'OUI' : 'NON');

    // Vérifier si déjà en cache
    if (prixCache[cacheKey]) {
      return prixCache[cacheKey];
    }

    // Vérifier si date future
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);
    const dateCheck = new Date(date);
    dateCheck.setHours(0, 0, 0, 0);

    if (dateCheck > aujourdHui) {
      return null; // Date future, pas de prix historique
    }

    // Appeler l'API CoinGecko
    try {
      const jour = String(date.getDate()).padStart(2, '0');
      const mois = String(date.getMonth() + 1).padStart(2, '0');
      const annee = date.getFullYear();
      const dateAPI = `${jour}-${mois}-${annee}`;

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinGeckoId}/history?date=${dateAPI}`
      );
      const data = await response.json();

      if (data.market_data) {
        console.log('✅ Prix API reçu:', coinGeckoId, dateStr, data.market_data.current_price.eur);
        const prixData = {
          usd: data.market_data.current_price.usd,
          eur: data.market_data.current_price.eur
        };

        // Mettre en cache
        const nouveauCache = {
          ...prixCache,
          [cacheKey]: prixData
        };
        setPrixCache(nouveauCache);
        await sauvegarderCache(nouveauCache);

        return prixData;
      }
    } catch (error) {
      console.error(`Erreur API prix ${coinGeckoId}:`, error);
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
    }

    setLoading(false);
    return resultats;
  };

  return {
    prixCache,
    loading,
    getPrix,
    getPrixPourDate
  };
}