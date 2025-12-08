import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const DEFAULT_CONFIG = {
  capitalDepart: 10000,
  pourcentageUtilise: 80,
  dureeEnSemaines: 12,
  semaineActuelle: 1
};

export const useConfig = (userId) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const configRef = doc(db, 'users', userId, 'config', 'main');

    // Écoute en temps réel des changements
    const unsubscribe = onSnapshot(
      configRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setConfig(docSnap.data());
        } else {
          // Créer la config par défaut si elle n'existe pas
          setDoc(configRef, DEFAULT_CONFIG);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Erreur lors de la récupération de la config:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const updateConfig = async (newConfig) => {
    if (!userId) return;

    try {
      const configRef = doc(db, 'users', userId, 'config', 'main');
      await setDoc(configRef, newConfig, { merge: true });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la config:', error);
    }
  };

  return { config, updateConfig, loading };
};
