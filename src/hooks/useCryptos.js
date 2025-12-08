import { useState, useEffect } from 'react';
import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const DEFAULT_CRYPTOS = [
  {
    id: 'btc',
    nom: 'BTC',
    coinGeckoId: 'bitcoin',
    repartition: 50,
    prixActuel: 45000,
    historique: [],
    paliers: [
      { min: 50000, max: Infinity, coeff: 0.5, label: 'Très haut' },
      { min: 47000, max: 50000, coeff: 0.75, label: 'Haut' },
      { min: 43000, max: 47000, coeff: 1, label: 'Normal' },
      { min: 40000, max: 43000, coeff: 1.25, label: 'Bas' },
      { min: 0, max: 40000, coeff: 1.5, label: 'Très bas' }
    ]
  },
  {
    id: 'eth',
    nom: 'ETH',
    coinGeckoId: 'ethereum',
    repartition: 25,
    prixActuel: 2800,
    historique: [],
    paliers: [
      { min: 3200, max: Infinity, coeff: 0.5, label: 'Très haut' },
      { min: 3000, max: 3200, coeff: 0.75, label: 'Haut' },
      { min: 2600, max: 3000, coeff: 1, label: 'Normal' },
      { min: 2400, max: 2600, coeff: 1.25, label: 'Bas' },
      { min: 0, max: 2400, coeff: 1.5, label: 'Très bas' }
    ]
  },
  {
    id: 'sol',
    nom: 'SOL',
    coinGeckoId: 'solana',
    repartition: 20,
    prixActuel: 120,
    historique: [],
    paliers: [
      { min: 150, max: Infinity, coeff: 0.5, label: 'Très haut' },
      { min: 130, max: 150, coeff: 0.75, label: 'Haut' },
      { min: 110, max: 130, coeff: 1, label: 'Normal' },
      { min: 90, max: 110, coeff: 1.25, label: 'Bas' },
      { min: 0, max: 90, coeff: 1.5, label: 'Très bas' }
    ]
  },
  {
    id: 'doge',
    nom: 'DOGE',
    coinGeckoId: 'dogecoin',
    repartition: 5,
    prixActuel: 0.15,
    historique: [],
    paliers: [
      { min: 0.20, max: Infinity, coeff: 0.5, label: 'Très haut' },
      { min: 0.17, max: 0.20, coeff: 0.75, label: 'Haut' },
      { min: 0.13, max: 0.17, coeff: 1, label: 'Normal' },
      { min: 0.10, max: 0.13, coeff: 1.25, label: 'Bas' },
      { min: 0, max: 0.10, coeff: 1.5, label: 'Très bas' }
    ]
  }
];

export const useCryptos = (userId) => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const cryptosRef = collection(db, 'users', userId, 'cryptos');

    // Écoute en temps réel des changements
    const unsubscribe = onSnapshot(
      cryptosRef,
      async (snapshot) => {
        if (snapshot.empty && !initialized) {
          // Initialiser avec les cryptos par défaut
          for (const crypto of DEFAULT_CRYPTOS) {
            const cryptoData = {
              ...crypto,
              paliers: crypto.paliers.map(p => ({
                ...p,
                max: p.max === Infinity ? null : p.max
              }))
            };
            await setDoc(doc(cryptosRef, crypto.id), cryptoData);
          }
          setInitialized(true);
        } else {
          const cryptosData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Reconstruction de Infinity
            paliers: doc.data().paliers?.map(p => ({
              ...p,
              max: p.max === null ? Infinity : p.max
            })) || []
          }));
          setCryptos(cryptosData);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des cryptos:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, initialized]);

  const updateCrypto = async (cryptoId, data) => {
    if (!userId) return;

    try {
      const cryptoRef = doc(db, 'users', userId, 'cryptos', cryptoId);

      // Conversion de Infinity en null pour Firestore
      const dataToSave = {
        ...data,
        paliers: data.paliers?.map(p => ({
          ...p,
          max: p.max === Infinity ? null : p.max
        }))
      };

      await setDoc(cryptoRef, dataToSave, { merge: true });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la crypto:', error);
    }
  };

  const deleteCrypto = async (cryptoId) => {
    if (!userId) return;

    try {
      const cryptoRef = doc(db, 'users', userId, 'cryptos', cryptoId);
      await deleteDoc(cryptoRef);
    } catch (error) {
      console.error('Erreur lors de la suppression de la crypto:', error);
    }
  };

  const addCrypto = async (cryptoData) => {
    if (!userId) return;

    try {
      const cryptosRef = collection(db, 'users', userId, 'cryptos');
      const newCryptoRef = doc(cryptosRef);
      
      const dataToSave = {
        ...cryptoData,
        id: newCryptoRef.id,
        paliers: cryptoData.paliers?.map(p => ({
          ...p,
          max: p.max === Infinity ? null : p.max
        }))
      };

      await setDoc(newCryptoRef, dataToSave);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la crypto:', error);
    }
  };

  return { cryptos, updateCrypto, deleteCrypto, addCrypto, loading };
};
