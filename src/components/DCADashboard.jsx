import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, Calendar, Percent, RefreshCw, Wallet, PieChart, Settings, ShoppingCart, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import { useCryptos } from '../hooks/useCryptos';

export default function DCADashboard() {
  // Hooks Firebase
  const { user, loading: authLoading } = useAuth();
  const { config, updateConfig, loading: configLoading } = useConfig(user?.uid);
  const { cryptos, updateCrypto, loading: cryptosLoading } = useCryptos(user?.uid);

  const [ongletActif, setOngletActif] = useState('portefeuille');
  const [prixEnTempsReel, setPrixEnTempsReel] = useState({});
  const [chargementPrix, setChargementPrix] = useState(false);

  // États locaux synchronisés avec Firebase (avec debounce)
  const [capitalDepart, setCapitalDepart] = useState(config.capitalDepart);
  const [pourcentageUtilise, setPourcentageUtilise] = useState(config.pourcentageUtilise);
  const [dureeEnSemaines, setDureeEnSemaines] = useState(config.dureeEnSemaines);
  const [semaineActuelle, setSemaineActuelle] = useState(config.semaineActuelle);

  // Synchroniser les états locaux avec config Firebase
  useEffect(() => {
    setCapitalDepart(config.capitalDepart);
    setPourcentageUtilise(config.pourcentageUtilise);
    setDureeEnSemaines(config.dureeEnSemaines);
    setSemaineActuelle(config.semaineActuelle);
  }, [config]);

  // Debounce pour sauvegarder dans Firebase (1 seconde après la dernière modification)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user?.uid) {
        updateConfig({
          capitalDepart,
          pourcentageUtilise,
          dureeEnSemaines,
          semaineActuelle
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [capitalDepart, pourcentageUtilise, dureeEnSemaines, semaineActuelle, user, updateConfig]);

  // Récupération des prix en temps réel depuis CoinGecko
  const fetchPrixTempsReel = async () => {
    setChargementPrix(true);
    try {
      const ids = cryptos.map(c => c.coinGeckoId).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,eur`
      );
      const data = await response.json();
      
      setPrixEnTempsReel(data);
      
      // Mise à jour automatique des prix actuels en EUR dans Firebase
      for (const crypto of cryptos) {
        if (data[crypto.coinGeckoId]) {
          await updateCrypto(crypto.id, {
            ...crypto,
            prixActuel: data[crypto.coinGeckoId].eur
          });
        }
      }
      
    } catch (error) {
      console.error('Erreur lors de la récupération des prix:', error);
    } finally {
      setChargementPrix(false);
    }
  };

  // Chargement initial des prix
  useEffect(() => {
    if (cryptos.length > 0) {
      fetchPrixTempsReel();
      const interval = setInterval(fetchPrixTempsReel, 60000);
      return () => clearInterval(interval);
    }
  }, [cryptos.length]);

  const capitalUtilisable = useMemo(() => {
    return (capitalDepart * pourcentageUtilise) / 100;
  }, [capitalDepart, pourcentageUtilise]);

  const capitalReserve = useMemo(() => {
    return capitalDepart - capitalUtilisable;
  }, [capitalDepart, capitalUtilisable]);

  // Calculs du portefeuille global
  const statsPortefeuille = useMemo(() => {
    const statsCryptos = cryptos.map(crypto => {
      const quantiteTotale = crypto.historique?.reduce((sum, h) => sum + h.quantite, 0) || 0;
      const montantInvesti = crypto.historique?.reduce((sum, h) => sum + h.montant, 0) || 0;
      const prixMoyen = quantiteTotale > 0 ? montantInvesti / quantiteTotale : 0;
      const valeurActuelle = quantiteTotale * crypto.prixActuel;
      const plusValue = valeurActuelle - montantInvesti;
      const plusValuePct = montantInvesti > 0 ? (plusValue / montantInvesti) * 100 : 0;

      return {
        ...crypto,
        quantiteTotale,
        montantInvesti,
        prixMoyen,
        valeurActuelle,
        plusValue,
        plusValuePct
      };
    });

    const totalInvesti = statsCryptos.reduce((sum, c) => sum + c.montantInvesti, 0);
    const valeurTotalePortefeuille = statsCryptos.reduce((sum, c) => sum + c.valeurActuelle, 0);
    const plusValueTotale = valeurTotalePortefeuille - totalInvesti;
    const plusValueTotalePct = totalInvesti > 0 ? (plusValueTotale / totalInvesti) * 100 : 0;

    return {
      statsCryptos,
      totalInvesti,
      valeurTotalePortefeuille,
      plusValueTotale,
      plusValueTotalePct
    };
  }, [cryptos]);

  const getCoeffForCrypto = (crypto) => {
    const palier = crypto.paliers?.find(p => crypto.prixActuel >= p.min && crypto.prixActuel < p.max);
    return palier ? palier.coeff : 1;
  };

  const getPalierLabel = (crypto) => {
    const palier = crypto.paliers?.find(p => crypto.prixActuel >= p.min && crypto.prixActuel < p.max);
    return palier ? palier.label : 'Non défini';
  };

  const calculsSemaine = useMemo(() => {
    const investissementBaseParSemaine = capitalUtilisable / dureeEnSemaines;
    const investissementPrevu = Math.floor(investissementBaseParSemaine);
    
    const detailsCryptos = cryptos.map(crypto => {
      const montantPrevu = (investissementPrevu * crypto.repartition) / 100;
      const coeff = getCoeffForCrypto(crypto);
      const montantReel = montantPrevu * coeff;
      const quantite = montantReel / crypto.prixActuel;
      
      return {
        ...crypto,
        montantPrevu,
        coeff,
        montantReel,
        quantite,
        palierLabel: getPalierLabel(crypto)
      };
    });

    const totalPrevu = investissementPrevu;
    const totalReel = detailsCryptos.reduce((sum, c) => sum + c.montantReel, 0);
    const difference = totalReel - totalPrevu;
    
    return {
      investissementPrevu: totalPrevu,
      totalReel: totalReel,
      difference: difference,
      detailsCryptos
    };
  }, [capitalUtilisable, dureeEnSemaines, cryptos]);

  const calculsSemaineProchaine = useMemo(() => {
    const capitalRestant = capitalUtilisable - (calculsSemaine.totalReel * semaineActuelle);
    const semainesRestantes = dureeEnSemaines - semaineActuelle;
    
    if (semainesRestantes <= 0) {
      return { capitalRestant: 0, investissementProchain: 0 };
    }
    
    const investissementProchain = Math.floor(capitalRestant / semainesRestantes);
    
    return {
      capitalRestant: Math.max(0, capitalRestant),
      investissementProchain,
      semainesRestantes
    };
  }, [capitalUtilisable, calculsSemaine.totalReel, semaineActuelle, dureeEnSemaines]);

  // Fonction pour enregistrer les achats de la semaine
  const enregistrerAchatsSemaine = async () => {
    for (const detailCrypto of calculsSemaine.detailsCryptos) {
      const crypto = cryptos.find(c => c.id === detailCrypto.id);
      if (!crypto) continue;

      const nouvelAchat = {
        semaine: semaineActuelle,
        quantite: detailCrypto.quantite,
        prixAchat: crypto.prixActuel,
        montant: detailCrypto.montantReel
      };

      await updateCrypto(crypto.id, {
        ...crypto,
        historique: [...(crypto.historique || []), nouvelAchat]
      });
    }

    setSemaineActuelle(prev => Math.min(dureeEnSemaines, prev + 1));
  };

  const updateCryptoRepartition = async (id, value) => {
    const crypto = cryptos.find(c => c.id === id);
    if (crypto) {
      await updateCrypto(id, {
        ...crypto,
        repartition: parseFloat(value) || 0
      });
    }
  };

  const updateCryptoPrix = async (id, value) => {
    const crypto = cryptos.find(c => c.id === id);
    if (crypto) {
      await updateCrypto(id, {
        ...crypto,
        prixActuel: parseFloat(value) || 0
      });
    }
  };

  const updatePalier = async (cryptoId, palierIndex, field, value) => {
    const crypto = cryptos.find(c => c.id === cryptoId);
    if (!crypto) return;

    const newPaliers = [...(crypto.paliers || [])];
    let processedValue;
    
    if (field === 'label') {
      processedValue = value;
    } else if (field === 'max' && (value === '' || value === 'Infinity')) {
      processedValue = Infinity;
    } else {
      processedValue = parseFloat(value) || 0;
    }
    
    newPaliers[palierIndex] = {
      ...newPaliers[palierIndex],
      [field]: processedValue
    };

    await updateCrypto(cryptoId, {
      ...crypto,
      paliers: newPaliers
    });
  };

  const ajouterPalier = async (cryptoId) => {
    const crypto = cryptos.find(c => c.id === cryptoId);
    if (!crypto) return;

    const nouveauPalier = {
      min: 0,
      max: 100,
      coeff: 1,
      label: 'Nouveau palier'
    };

    await updateCrypto(cryptoId, {
      ...crypto,
      paliers: [...(crypto.paliers || []), nouveauPalier]
    });
  };

  const supprimerPalier = async (cryptoId, palierIndex) => {
    const crypto = cryptos.find(c => c.id === cryptoId);
    if (!crypto || (crypto.paliers?.length || 0) <= 1) return;

    const newPaliers = crypto.paliers.filter((_, idx) => idx !== palierIndex);
    
    await updateCrypto(cryptoId, {
      ...crypto,
      paliers: newPaliers
    });
  };

  const totalRepartition = cryptos.reduce((sum, c) => sum + (c.repartition || 0), 0);
  const repartitionValide = Math.abs(totalRepartition - 100) < 0.01;

  const getIconForPalier = (label) => {
    if (label?.includes('haut')) return <TrendingUp className="w-4 h-4" />;
    if (label?.includes('bas')) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  // Loading state
  if (authLoading || configLoading || cryptosLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-xl">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  // Suite du composant dans le prochain fichier...
