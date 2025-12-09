import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, Calendar, Percent, RefreshCw, Wallet, PieChart, Settings, ShoppingCart, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import { useCryptos } from '../hooks/useCryptos';
import { usePrixHistorique } from '../hooks/usePrixHistorique';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts';

export default function DCADashboard() {
  // Hooks Firebase
  const { user, loading: authLoading } = useAuth();
  const { config, updateConfig, loading: configLoading } = useConfig(user?.uid);
  const { cryptos, updateCrypto, loading: cryptosLoading } = useCryptos(user?.uid);
  const { prixCache, loading: prixLoading, getPrixPourDate, prechargerPeriode, viderCache } = usePrixHistorique(user?.uid);

  const [ongletActif, setOngletActif] = useState('portefeuille');
  const [prixEnTempsReel, setPrixEnTempsReel] = useState({});
  const [prixSemaine, setPrixSemaine] = useState({});
  const [chargementPrix, setChargementPrix] = useState(false);

  // États locaux synchronisés avec Firebase (avec debounce)
  const [capitalDepart, setCapitalDepart] = useState(10000);
  const [pourcentageUtilise, setPourcentageUtilise] = useState(80);
  const [dureeEnSemaines, setDureeEnSemaines] = useState(12);
  const [semaineActuelle, setSemaineActuelle] = useState(1);
  const [dateDepart, setDateDepart] = useState(new Date().toISOString().split('T')[0]);

  // Synchroniser les états locaux avec config Firebase
  useEffect(() => {
    if (config) {
      setCapitalDepart(config.capitalDepart || 10000);
      setPourcentageUtilise(config.pourcentageUtilise || 80);
      setDureeEnSemaines(config.dureeEnSemaines || 12);
      setSemaineActuelle(config.semaineActuelle || 1);
      setDateDepart(config.dateDepart || new Date().toISOString().split('T')[0]);
    }
  }, [config]);

  // Debounce pour sauvegarder dans Firebase
  useEffect(() => {
    if (!user?.uid) return;
    
    const timer = setTimeout(() => {
      updateConfig({
        capitalDepart,
        pourcentageUtilise,
        dureeEnSemaines,
        semaineActuelle,
        dateDepart
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [capitalDepart, pourcentageUtilise, dureeEnSemaines, semaineActuelle, user?.uid]);

  // Récupération des prix en temps réel depuis CoinGecko
  // Récupération des prix (veille ou 8h si après 8h)
  const fetchPrixTempsReel = async () => {
    if (!cryptos || cryptos.length === 0) return;
    
    setChargementPrix(true);
    try {
      // Déterminer la date à utiliser
      const now = new Date();
      const heure = now.getHours();
      
      let dateToUse;
      if (heure >= 8) {
        dateToUse = now;
      } else {
        dateToUse = new Date(now);
        dateToUse.setDate(dateToUse.getDate() - 1);
      }
      
      const jour = String(dateToUse.getDate()).padStart(2, '0');
      const mois = String(dateToUse.getMonth() + 1).padStart(2, '0');
      const annee = dateToUse.getFullYear();
      const dateStr = `${jour}-${mois}-${annee}`;
      
      // Récupérer le prix historique pour chaque crypto
      const prixData = {};
      for (const crypto of cryptos) {
        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${crypto.coinGeckoId}/history?date=${dateStr}`
          );
          const data = await response.json();
          
          if (data.market_data) {
            prixData[crypto.coinGeckoId] = {
              usd: data.market_data.current_price.usd,
              eur: data.market_data.current_price.eur
            };
          }
        } catch (err) {
          console.error(`Erreur prix ${crypto.nom}:`, err);
        }
      }
      
      setPrixEnTempsReel(prixData);
      
      // Mise à jour automatique des prix actuels dans Firebase
      for (const crypto of cryptos) {
        if (prixData[crypto.coinGeckoId]?.eur) {
          const prixArrondi = Math.round(prixData[crypto.coinGeckoId].eur * 100) / 100;
          await updateCrypto(crypto.id, {
            prixActuel: prixArrondi
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
    if (cryptos && cryptos.length > 0) {
      fetchPrixTempsReel();
      const interval = setInterval(fetchPrixTempsReel, 60000);
      return () => clearInterval(interval);
    }
  }, [cryptos?.length]);

  

  const capitalUtilisable = useMemo(() => {
    return (capitalDepart * pourcentageUtilise) / 100;
  }, [capitalDepart, pourcentageUtilise]);

  const capitalReserve = useMemo(() => {
    return capitalDepart - capitalUtilisable;
  }, [capitalDepart, capitalUtilisable]);

  // Calculs du portefeuille global
  const statsPortefeuille = useMemo(() => {
    if (!cryptos || cryptos.length === 0) {
      return {
        statsCryptos: [],
        totalInvesti: 0,
        valeurTotalePortefeuille: 0,
        plusValueTotale: 0,
        plusValueTotalePct: 0
      };
    }

    const statsCryptos = cryptos.map(crypto => {
      const quantiteTotale = crypto.historique?.reduce((sum, h) => sum + h.quantite, 0) || 0;
      const montantInvesti = crypto.historique?.reduce((sum, h) => sum + h.montant, 0) || 0;
      const prixMoyen = quantiteTotale > 0 ? montantInvesti / quantiteTotale : 0;
      const valeurActuelle = quantiteTotale * (crypto.prixActuel || 0);
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
    if (!crypto.paliers) return 1;
    const palier = crypto.paliers.find(p => crypto.prixActuel >= p.min && crypto.prixActuel < (p.max || Infinity));
    return palier ? palier.coeff : 1;
  };

  const getPalierLabel = (crypto) => {
    if (!crypto.paliers) return 'Non défini';
    const palier = crypto.paliers.find(p => crypto.prixActuel >= p.min && crypto.prixActuel < (p.max || Infinity));
    return palier ? palier.label : 'Non défini';
  };

  const getCoeffForCryptoPrix = (crypto, prix) => {
    if (!crypto.paliers) return 1;
    const palier = crypto.paliers.find(p => prix >= p.min && prix < (p.max || Infinity));
    return palier ? palier.coeff : 1;
  };

  const getPalierLabelPrix = (crypto, prix) => {
    if (!crypto.paliers) return 'Non défini';
    const palier = crypto.paliers.find(p => prix >= p.min && prix < (p.max || Infinity));
    return palier ? palier.label : 'Non défini';
  };


  const calculsSemaine = useMemo(() => {
    if (!cryptos || cryptos.length === 0) {
      return {
        investissementPrevu: 0,
        totalReel: 0,
        difference: 0,
        detailsCryptos: []
      };
    }

    // Calculer le montant déjà investi (semaines précédentes)
    const montantDejaInvesti = cryptos.reduce((total, crypto) => {
      const achatsPassés = crypto.historique?.filter(h => h.semaine < semaineActuelle) || [];
      return total + achatsPassés.reduce((sum, a) => sum + a.montant, 0);
    }, 0);
    
    // Capital restant et semaines restantes
    const capitalRestant = capitalUtilisable - montantDejaInvesti;
    const semainesRestantes = dureeEnSemaines - semaineActuelle + 1;
    
    // Montant prévu dynamique
    const investissementPrevu = semainesRestantes > 0 
      ? Math.floor(capitalRestant / semainesRestantes) 
      : 0;
    
    // Vérifier si la semaine est future (calcul local sans dépendre de datesSemaines)
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);
    
    // Recalculer la date de la semaine actuelle
    const start = new Date(dateDepart);
    const jour = start.getDay();
    const diff = jour === 0 ? 1 : (jour === 1 ? 0 : 8 - jour);
    start.setDate(start.getDate() + diff);
    const dateSemaine = new Date(start);
    dateSemaine.setDate(start.getDate() + ((semaineActuelle - 1) * 7));
    
    const estDateFuture = dateSemaine > aujourdHui;

    const detailsCryptos = cryptos.map(crypto => {
      const montantPrevu = (investissementPrevu * (crypto.repartition || 0)) / 100;
      
      // Si date future, pas de prix ni de calculs
      if (estDateFuture) {
        return {
          ...crypto,
          montantPrevu,
          coeff: null,
          montantReel: null,
          quantite: null,
          prixSemaine: null,
          prixSemaineUsd: null,
          palierLabel: null,
          estDateFuture: true
        };
      }
      
      const prixEur = prixSemaine[crypto.coinGeckoId]?.eur || crypto.prixActuel || 0;
      const prixUsd = prixSemaine[crypto.coinGeckoId]?.usd || 0;
      const coeff = getCoeffForCryptoPrix(crypto, prixUsd);
      const montantReel = montantPrevu * coeff;
      const quantite = prixEur ? montantReel / prixEur : 0;
      
      return {
        ...crypto,
        montantPrevu,
        coeff,
        montantReel,
        quantite,
        prixSemaine: prixEur,
        prixSemaineUsd: prixUsd,
        palierLabel: getPalierLabelPrix(crypto, prixUsd),
        estDateFuture: false
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
  }, [capitalUtilisable, dureeEnSemaines, cryptos, prixSemaine, dateDepart, semaineActuelle]);

  const calculsSemaineProchaine = useMemo(() => {
    // Calculer le montant RÉELLEMENT investi (toutes les semaines validées)
    const montantReellementInvesti = cryptos?.reduce((total, crypto) => {
      const tousLesAchats = crypto.historique || [];
      return total + tousLesAchats.reduce((sum, a) => sum + a.montant, 0);
    }, 0) || 0;
    
    const capitalRestant = capitalUtilisable - montantReellementInvesti;
    const semainesRestantes = dureeEnSemaines - semaineActuelle;
    
    if (semainesRestantes <= 0) {
      return { capitalRestant: 0, investissementProchain: 0, semainesRestantes: 0, montantReellementInvesti };
    }
    
    const investissementProchain = Math.floor(capitalRestant / semainesRestantes);
    
    return {
      capitalRestant: Math.max(0, capitalRestant),
      investissementProchain,
      semainesRestantes,
      montantReellementInvesti
    };
  }, [capitalUtilisable, cryptos, semaineActuelle, dureeEnSemaines]);

  // Calcul des dates de semaines
  const datesSemaines = useMemo(() => {
    const dates = [];
    const start = new Date(dateDepart);
    
    // Trouver le premier lundi
    const jour = start.getDay();
    const diff = jour === 0 ? 1 : (jour === 1 ? 0 : 8 - jour);
    start.setDate(start.getDate() + diff);
    
    for (let i = 0; i < dureeEnSemaines; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + (i * 7));
      dates.push(date);
    }
    
    return dates;
  }, [dateDepart, dureeEnSemaines]);

  const dateFin = datesSemaines.length > 0 ? datesSemaines[datesSemaines.length - 1] : null;


  // Données pour les graphiques
  const donneesGraphique = useMemo(() => {
    return datesSemaines.map((date, index) => {
      const semaine = index + 1;
      const historiqueSemaine = cryptos?.reduce((total, crypto) => {
        const achatsSemaine = crypto.historique?.filter(h => h.semaine === semaine) || [];
        return total + achatsSemaine.reduce((sum, a) => sum + a.montant, 0);
      }, 0) || 0;
      
      const investiCumule = cryptos?.reduce((total, crypto) => {
        const achats = crypto.historique?.filter(h => h.semaine <= semaine) || [];
        return total + achats.reduce((sum, a) => sum + a.montant, 0);
      }, 0) || 0;

      const valeurCumulee = cryptos?.reduce((total, crypto) => {
        const achats = crypto.historique?.filter(h => h.semaine <= semaine) || [];
        const quantite = achats.reduce((sum, a) => sum + a.quantite, 0);
        // Prix du lundi depuis le cache
        const dateStr = date.toISOString().split('T')[0];
        const cacheKey = `${crypto.coinGeckoId}_${dateStr}`;
        const prixLundi = prixCache[cacheKey]?.eur || crypto.prixActuel || 0;
        return total + (quantite * prixLundi);
      }, 0) || 0;

      return {
        semaine: `S${semaine}`,
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        investi: Math.round(historiqueSemaine * 100) / 100,
        investiCumule: Math.round(investiCumule * 100) / 100,
        valeurCumulee: Math.round(valeurCumulee * 100) / 100,
        capitalDepart: capitalDepart
      };
    });
  }, [datesSemaines, cryptos, capitalDepart, prixCache]);

  // Données récapitulatives par crypto
    const recapParCrypto = useMemo(() => {
      if (!cryptos || cryptos.length === 0) return [];

      return cryptos.map(crypto => {
        const historiqueParSemaine = datesSemaines.map((date, index) => {
          const semaine = index + 1;
          
          // Achats jusqu'à cette semaine
          const achatsJusquaSemaine = crypto.historique?.filter(h => h.semaine <= semaine) || [];
          
          // Quantité cumulée
          const quantiteCumulee = achatsJusquaSemaine.reduce((sum, a) => sum + a.quantite, 0);
          
          // Montant investi cumulé
          const investiCumule = achatsJusquaSemaine.reduce((sum, a) => sum + a.montant, 0);
          
          // Prix moyen d'achat
          const prixMoyen = quantiteCumulee > 0 ? investiCumule / quantiteCumulee : 0;
          
          // Achat de cette semaine
          const achatSemaine = crypto.historique?.find(h => h.semaine === semaine);
          
          // Prix du lundi de cette semaine (depuis le cache)
          const dateStr = date.toISOString().split('T')[0];
          const cacheKey = `${crypto.coinGeckoId}_${dateStr}`;
          const prixLundi = prixCache[cacheKey]?.eur || achatSemaine?.prixAchat || 0;
          
          // Valeur au prix du lundi
          const valeurAuLundi = quantiteCumulee * prixLundi;
          
          return {
            semaine,
            date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
            dateLundi: date,
            quantiteSemaine: achatSemaine?.quantite || 0,
            montantSemaine: achatSemaine?.montant || 0,
            prixAchat: achatSemaine?.prixAchat || 0,
            prixLundi,
            quantiteCumulee,
            investiCumule,
            prixMoyen,
            valeurAuLundi
          };
        });

        return {
          ...crypto,
          historiqueParSemaine
        };
      });
    }, [cryptos, datesSemaines, prixCache]);

    // Charger le prix du lundi de la semaine sélectionnée (avec cache)
    useEffect(() => {
      const chargerPrixSemaine = async () => {
        if (datesSemaines.length > 0 && semaineActuelle >= 1 && cryptos?.length > 0) {
          const dateLundi = datesSemaines[semaineActuelle - 1];
          if (dateLundi) {
            const prix = await getPrixPourDate(cryptos, dateLundi);
            setPrixSemaine(prix);
          }
        }
      };

      chargerPrixSemaine();
    }, [semaineActuelle, datesSemaines, cryptos?.length]);

  // Fonction pour enregistrer les achats de la semaine
  const enregistrerAchatsSemaine = async () => {
    if (!cryptos) return;
    
    for (const detailCrypto of calculsSemaine.detailsCryptos) {
      const crypto = cryptos.find(c => c.id === detailCrypto.id);
      if (!crypto) continue;

      const nouvelAchat = {
        semaine: semaineActuelle,
        quantite: detailCrypto.quantite,
        prixAchat: detailCrypto.prixSemaine,
        montant: detailCrypto.montantReel
      };

      await updateCrypto(crypto.id, {
        ...crypto,
        historique: [...(crypto.historique || []), nouvelAchat]
      });
    }

    setSemaineActuelle(prev => Math.min(dureeEnSemaines, prev + 1));
  };

  // Réinitialiser les achats d'une semaine
  const reinitialiserSemaine = async (semaineCible) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer tous les achats de la semaine ${semaineCible} ?`)) {
      return;
    }
    
    for (const crypto of cryptos) {
      const nouveauHistorique = crypto.historique?.filter(h => h.semaine !== semaineCible) || [];
      await updateCrypto(crypto.id, {
        ...crypto,
        historique: nouveauHistorique
      });
    }
  };

  const updateCryptoRepartition = async (id, value) => {
    const crypto = cryptos?.find(c => c.id === id);
    if (crypto) {
      await updateCrypto(id, {
        ...crypto,
        repartition: parseFloat(value) || 0
      });
    }
  };

  const updateCryptoPrix = async (id, value) => {
    const crypto = cryptos?.find(c => c.id === id);
    if (crypto) {
      await updateCrypto(id, {
        ...crypto,
        prixActuel: parseFloat(value) || 0
      });
    }
  };

  const updatePalier = async (cryptoId, palierIndex, field, value) => {
    const crypto = cryptos?.find(c => c.id === cryptoId);
    if (!crypto) return;

    const newPaliers = [...(crypto.paliers || [])];
    let processedValue;
    
    if (field === 'label') {
      processedValue = value;
    } else if (field === 'max' && (value === '' || value === 'Infinity')) {
      processedValue = Infinity;
    } else {
      // Permet explicitement la valeur 0
      const parsed = parseFloat(value);
      processedValue = isNaN(parsed) ? 1 : parsed;
    }
    
    newPaliers[palierIndex] = {
      ...newPaliers[palierIndex],
      [field]: processedValue
    };

    const paliersTries = newPaliers.sort((a, b) => b.min - a.min);
    
    await updateCrypto(cryptoId, {
      ...crypto,
      paliers: paliersTries
    });
  };

  const ajouterPalier = async (cryptoId) => {
    const crypto = cryptos?.find(c => c.id === cryptoId);
    if (!crypto) return;

    const nouveauPalier = {
      min: 0,
      max: 100,
      coeff: 1,
      label: 'Nouveau palier'
    };

    const nouveauxPaliers = [...(crypto.paliers || []), nouveauPalier]
      .sort((a, b) => b.min - a.min); // Tri par prix min décroissant (très haut en premier)

    await updateCrypto(cryptoId, {
      ...crypto,
      paliers: nouveauxPaliers
    });
  };

  const supprimerPalier = async (cryptoId, palierIndex) => {
    const crypto = cryptos?.find(c => c.id === cryptoId);
    if (!crypto || (crypto.paliers?.length || 0) <= 1) return;

    const newPaliers = crypto.paliers.filter((_, idx) => idx !== palierIndex);
    
    await updateCrypto(cryptoId, {
      ...crypto,
      paliers: newPaliers
    });
  };

  const totalRepartition = cryptos?.reduce((sum, c) => sum + (c.repartition || 0), 0) || 0;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Dashboard DCA Crypto
          </h1>
          <p className="text-slate-400">Gestion intelligente de votre stratégie d'investissement</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-2 text-xs text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Connecté à Firebase
            </div>
          </div>
        </div>

        {/* Système d'onglets */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden">
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setOngletActif('portefeuille')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-semibold transition-all ${
                ongletActif === 'portefeuille'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/30 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              <Wallet className="w-5 h-5" />
              Portefeuille
            </button>
            <button
              onClick={() => setOngletActif('configuration')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-semibold transition-all ${
                ongletActif === 'configuration'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/30 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              <Settings className="w-5 h-5" />
              Configuration
            </button>
            <button
              onClick={() => setOngletActif('investissements')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-semibold transition-all ${
                ongletActif === 'investissements'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/30 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              Investissements
            </button>

            <button
              onClick={() => setOngletActif('graphiques')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-semibold transition-all ${
                ongletActif === 'graphiques'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/30 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Graphiques
            </button>

            <button
              onClick={() => setOngletActif('recapCryptos')}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-semibold transition-all ${
                ongletActif === 'recapCryptos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/30 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              <PieChart className="w-5 h-5" />
              Récap Cryptos
            </button>
          </div>

          <div className="p-6">
            {/* Onglet Portefeuille */}
            {ongletActif === 'portefeuille' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <BarChart3 className="w-6 h-6" />
                    Vue d'ensemble
                  </h2>
                  <button
                    onClick={fetchPrixTempsReel}
                    disabled={chargementPrix}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${chargementPrix ? 'animate-spin' : ''}`} />
                    {chargementPrix ? 'Actualisation...' : 'Actualiser les prix'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4">
                    <div className="text-blue-200 text-sm mb-1">Montant total investi</div>
                    <div className="text-2xl font-bold">{statsPortefeuille.totalInvesti.toFixed(2)} €</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4">
                    <div className="text-purple-200 text-sm mb-1">Valeur actuelle</div>
                    <div className="text-2xl font-bold">{statsPortefeuille.valeurTotalePortefeuille.toFixed(2)} €</div>
                  </div>

                  <div className={`bg-gradient-to-br rounded-lg p-4 ${
                    statsPortefeuille.plusValueTotale >= 0 
                      ? 'from-green-600 to-green-700' 
                      : 'from-red-600 to-red-700'
                  }`}>
                    <div className={`text-sm mb-1 ${
                      statsPortefeuille.plusValueTotale >= 0 ? 'text-green-200' : 'text-red-200'
                    }`}>
                      Plus-value totale
                    </div>
                    <div className="text-2xl font-bold">
                      {statsPortefeuille.plusValueTotale >= 0 ? '+' : ''}{statsPortefeuille.plusValueTotale.toFixed(2)} €
                    </div>
                    <div className="text-sm mt-1">
                      ({statsPortefeuille.plusValueTotalePct >= 0 ? '+' : ''}{statsPortefeuille.plusValueTotalePct.toFixed(2)}%)
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-4">
                    <div className="text-orange-200 text-sm mb-1">Nombre d'achats</div>
                    <div className="text-2xl font-bold">
                      {cryptos?.reduce((sum, c) => sum + (c.historique?.length || 0), 0) || 0}
                    </div>
                  </div>
                </div>

                {/* Détail par crypto */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-300 mb-3">
                    <PieChart className="w-5 h-5" />
                    Détail par crypto
                  </h3>
                  {statsPortefeuille.statsCryptos.map(crypto => {
                    const prixUSD = prixEnTempsReel[crypto.coinGeckoId]?.usd;
                    const prixEUR = prixEnTempsReel[crypto.coinGeckoId]?.eur;
                    
                    return (
                      <div key={crypto.id} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-xl">{crypto.nom}</span>
                            {prixUSD && (
                              <div className="flex gap-2 text-sm">
                                <span className="bg-green-600/30 text-green-300 px-2 py-1 rounded">
                                  ${prixUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded">
                                  {prixEUR?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                </span>
                              </div>
                            )}
                          </div>
                          {crypto.montantInvesti > 0 && (
                            <div className={`px-3 py-1 rounded-lg font-semibold ${
                              crypto.plusValue >= 0 
                                ? 'bg-green-600/30 text-green-300' 
                                : 'bg-red-600/30 text-red-300'
                            }`}>
                              {crypto.plusValue >= 0 ? '+' : ''}{crypto.plusValue.toFixed(2)} € 
                              ({crypto.plusValuePct >= 0 ? '+' : ''}{crypto.plusValuePct.toFixed(2)}%)
                            </div>
                          )}
                        </div>

                        {crypto.quantiteTotale > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                            <div>
                              <div className="text-slate-400">Quantité totale</div>
                              <div className="font-semibold text-purple-400">{crypto.quantiteTotale.toFixed(8)}</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Investi</div>
                              <div className="font-semibold">{crypto.montantInvesti.toFixed(2)} €</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Prix moyen</div>
                              <div className="font-semibold text-yellow-400">{crypto.prixMoyen.toFixed(2)} €</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Prix actuel</div>
                              <div className="font-semibold text-blue-400">{(crypto.prixActuel || 0).toFixed(2)} €</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Valeur actuelle</div>
                              <div className="font-semibold text-green-400">{crypto.valeurActuelle.toFixed(2)} €</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-sm italic">Aucun achat effectué</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Onglet Configuration */}
            {ongletActif === 'configuration' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Paramètres généraux
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-700/50 rounded-xl p-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <DollarSign className="inline w-4 h-4 mr-1" />
                      Capital de départ (€)
                    </label>
                    <input
                      type="number"
                      value={capitalDepart}
                      onChange={(e) => setCapitalDepart(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="bg-slate-700/50 rounded-xl p-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Percent className="inline w-4 h-4 mr-1" />
                      % à utiliser pour DCA
                    </label>
                    <input
                      type="number"
                      value={pourcentageUtilise}
                      onChange={(e) => setPourcentageUtilise(parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="bg-slate-700/50 rounded-xl p-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Durée (semaines)
                    </label>
                    <input
                      type="number"
                      value={dureeEnSemaines}
                      onChange={(e) => setDureeEnSemaines(parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Date de départ
                    </label>
                    <input
                      type="date"
                      value={dateDepart}
                      onChange={(e) => setDateDepart(e.target.value)}
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
                    <div className="text-blue-200 text-sm mb-1">Capital utilisable DCA</div>
                    <div className="text-3xl font-bold">{capitalUtilisable.toFixed(2)} €</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-lg">
                    <div className="text-green-200 text-sm mb-1">Capital de réserve</div>
                    <div className="text-3xl font-bold">{capitalReserve.toFixed(2)} €</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 shadow-lg">
                    <div className="text-purple-200 text-sm mb-1">Investissement/semaine</div>
                    <div className="text-3xl font-bold">{Math.floor(capitalUtilisable / dureeEnSemaines)} €</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 shadow-lg">
                    <div className="text-orange-200 text-sm mb-1">Date de fin prévue</div>
                    <div className="text-2xl font-bold">
                      {dateFin ? dateFin.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                    </div>
                  </div>
                </div>

                {/* Configuration des cryptos */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
                    Configuration des cryptos et paliers
                    {!repartitionValide && (
                      <span className="text-sm text-red-400 font-normal">
                        ⚠ Total répartition: {totalRepartition.toFixed(1)}% (doit être 100%)
                      </span>
                    )}
                  </h2>
                  
                  <div className="space-y-6">
                    {cryptos && cryptos.map((crypto) => (
                      <div key={crypto.id} className="bg-slate-700/50 rounded-lg p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm text-slate-300 mb-1">Crypto</label>
                            <input
                              type="text"
                              value={crypto.nom || ''}
                              readOnly
                              className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white font-bold"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm text-slate-300 mb-1">Répartition (%)</label>
                            <input
                              type="number"
                              value={crypto.repartition || 0}
                              onChange={(e) => updateCryptoRepartition(crypto.id, e.target.value)}
                              className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                              step="0.1"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm text-slate-300 mb-1">Prix actuel (€)</label>
                            <input
                              type="number"
                              value={crypto.prixActuel || 0}
                              onChange={(e) => updateCryptoPrix(crypto.id, e.target.value)}
                              className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm text-slate-300">Paliers de prix (tranches)</label>
                            <button
                              onClick={() => ajouterPalier(crypto.id)}
                              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs flex items-center gap-1"
                            >
                              <span className="text-lg leading-none">+</span>
                              Ajouter un palier
                            </button>
                          </div>
                          <div className="space-y-2">
                            {crypto.paliers && crypto.paliers.map((palier, pIdx) => (
                              <div key={pIdx} className="bg-slate-600/50 rounded p-3 flex items-center gap-2">
                                <div className="flex-1 grid grid-cols-4 gap-2">
                                  <div>
                                    <div className="text-xs text-slate-400 mb-1">Label</div>
                                    <input
                                      type="text"
                                      value={palier.label || ''}
                                      onChange={(e) => updatePalier(crypto.id, pIdx, 'label', e.target.value)}
                                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                                      placeholder="Ex: Très haut"
                                    />
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-400 mb-1">Prix min (€)</div>
                                    <input
                                      type="number"
                                      value={palier.min || 0}
                                      onChange={(e) => updatePalier(crypto.id, pIdx, 'min', e.target.value)}
                                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                                      step="0.01"
                                    />
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-400 mb-1">Prix max (€)</div>
                                    <input
                                      type="number"
                                      value={palier.max === Infinity || palier.max === null ? '' : palier.max}
                                      onChange={(e) => updatePalier(crypto.id, pIdx, 'max', e.target.value || 'Infinity')}
                                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                                      step="0.01"
                                      placeholder="∞"
                                    />
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-400 mb-1">Coefficient</div>
                                    <input
                                      type="number"
                                      value={palier.coeff ?? 1}
                                      onChange={(e) => updatePalier(crypto.id, pIdx, 'coeff', e.target.value)}
                                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                                      step="0.1"
                                      min="0"
                                    />
                                  </div>
                                </div>
                                <button
                                  onClick={() => supprimerPalier(crypto.id, pIdx)}
                                  disabled={(crypto.paliers?.length || 0) <= 1}
                                  className="bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-2 py-1 rounded text-xs"
                                  title="Supprimer ce palier"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Investissements */}
            {ongletActif === 'investissements' && (
              <div className="space-y-6">
                {/* Navigation semaine */}
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 shadow-lg">
                  <div className="text-purple-200 text-sm mb-1">Semaine actuelle</div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSemaineActuelle(Math.max(1, semaineActuelle - 1))}
                      className="bg-purple-800 hover:bg-purple-900 px-4 py-2 rounded-lg"
                    >
                      ← Précédent
                    </button>
                    <span className="text-3xl font-bold">{semaineActuelle} / {dureeEnSemaines}</span>
                    <button
                      onClick={() => setSemaineActuelle(Math.min(dureeEnSemaines, semaineActuelle + 1))}
                      className="bg-purple-800 hover:bg-purple-900 px-4 py-2 rounded-lg"
                    >
                      Suivant →
                    </button>
                  </div>
                </div>

                {/* Calculs de la semaine actuelle */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">
                      Semaine {semaineActuelle} - {datesSemaines[semaineActuelle - 1]?.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) || 'Investissement'}
                    </h2>
                    {semaineActuelle <= dureeEnSemaines && !calculsSemaine.detailsCryptos[0]?.estDateFuture && (
                      <div className="flex gap-2">
                        <button
                          onClick={enregistrerAchatsSemaine}
                          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                          <TrendingUp className="w-4 h-4" />
                          Valider les achats
                        </button>
                        <button
                          onClick={() => reinitialiserSemaine(semaineActuelle)}
                          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                          Réinitialiser S{semaineActuelle}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="text-slate-400 text-sm">Montant prévu</div>
                      <div className="text-2xl font-bold text-blue-400">{calculsSemaine.investissementPrevu.toFixed(0)} €</div>
                    </div>
                    
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="text-slate-400 text-sm">Montant réel (avec coeffs)</div>
                      <div className="text-2xl font-bold text-green-400">{calculsSemaine.totalReel.toFixed(2)} €</div>
                    </div>
                    
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="text-slate-400 text-sm">Différence</div>
                      <div className={`text-2xl font-bold ${calculsSemaine.difference >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {calculsSemaine.difference >= 0 ? '+' : ''}{calculsSemaine.difference.toFixed(2)} €
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {calculsSemaine.detailsCryptos.map(crypto => (
                      <div key={crypto.id} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{crypto.nom}</span>
                            <span className="text-slate-400">({crypto.repartition || 0}%)</span>
                            {!crypto.estDateFuture && crypto.palierLabel && (
                              <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                                crypto.coeff > 1 ? 'bg-green-600' : crypto.coeff < 1 ? 'bg-orange-600' : 'bg-slate-600'
                              }`}>
                                {getIconForPalier(crypto.palierLabel)}
                                {crypto.palierLabel} (×{crypto.coeff})
                              </span>
                            )}
                            {crypto.estDateFuture && (
                              <span className="px-2 py-1 rounded text-xs bg-slate-600 text-slate-300">
                                📅 Date future
                              </span>
                            )}
                          </div>
                          {!crypto.estDateFuture && (
                            <div className="text-slate-400">
                              Prix ({datesSemaines[semaineActuelle - 1]?.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) || '-'}): {(crypto.prixSemaine || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € 
                              <span className="text-green-400 ml-2">(${(crypto.prixSemaineUsd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-slate-400">Prévu</div>
                            <div className="font-semibold">{crypto.montantPrevu.toFixed(2)} €</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Réel</div>
                            <div className="font-semibold text-green-400">
                              {crypto.estDateFuture ? '-' : `${crypto.montantReel.toFixed(2)} €`}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-400">Quantité</div>
                            <div className="font-semibold text-purple-400">
                              {crypto.estDateFuture ? '-' : crypto.quantite.toFixed(8)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projection semaine prochaine */}
                {calculsSemaineProchaine.semainesRestantes > 0 && (
                  <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-xl p-6 border border-indigo-700">
                    <h2 className="text-2xl font-bold mb-4">Projection semaine {semaineActuelle + 1}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-indigo-800/50 rounded-lg p-4">
                        <div className="text-indigo-200 text-sm">Capital restant</div>
                        <div className="text-2xl font-bold">{calculsSemaineProchaine.capitalRestant.toFixed(2)} €</div>
                      </div>
                      
                      <div className="bg-indigo-800/50 rounded-lg p-4">
                        <div className="text-indigo-200 text-sm">Semaines restantes</div>
                        <div className="text-2xl font-bold">{calculsSemaineProchaine.semainesRestantes}</div>
                      </div>
                      
                      <div className="bg-indigo-800/50 rounded-lg p-4">
                        <div className="text-indigo-200 text-sm">Investissement prévu</div>
                        <div className="text-2xl font-bold text-yellow-400">{calculsSemaineProchaine.investissementProchain.toFixed(0)} €</div>
                      </div>
                    </div>
                  </div>
                )}

                {calculsSemaineProchaine.semainesRestantes === 0 && (
                  <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 border border-green-700 text-center">
                    <h2 className="text-2xl font-bold mb-2">🎉 DCA terminé !</h2>
                    <p className="text-green-200">Vous avez complété votre stratégie d'investissement sur {dureeEnSemaines} semaines.</p>
                  </div>
                )}
              </div>
            )}
            {/* Onglet Graphiques */}
            {ongletActif === 'graphiques' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Analyse graphique
                </h2>

                {/* Graphique 1 : Investissement par semaine */}
                <div className="bg-slate-700/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Montant investi par semaine</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={donneesGraphique}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="semaine" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                        labelStyle={{ color: '#f8fafc' }}
                      />
                      <Bar dataKey="investi" fill="#3b82f6" name="Investi (€)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Graphique 2 : Évolution cumulative */}
                <div className="bg-slate-700/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Évolution du portefeuille</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={donneesGraphique}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="semaine" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                        labelStyle={{ color: '#f8fafc' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="capitalDepart" fill="#f59e0b33" stroke="#f59e0b" name="Capital de départ (€)" />
                      <Line type="monotone" dataKey="investiCumule" stroke="#3b82f6" strokeWidth={2} name="Total investi (€)" dot={{ fill: '#3b82f6' }} />
                      <Line type="monotone" dataKey="valeurCumulee" stroke="#10b981" strokeWidth={2} name="Valeur actuelle (€)" dot={{ fill: '#10b981' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Tableau récapitulatif */}
                <div className="bg-slate-700/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Détail par semaine</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-600">
                          <th className="text-left py-2 px-3">Semaine</th>
                          <th className="text-left py-2 px-3">Date</th>
                          <th className="text-right py-2 px-3">Investi</th>
                          <th className="text-right py-2 px-3">Total investi</th>
                          <th className="text-right py-2 px-3">Valeur au lundi</th>
                          <th className="text-right py-2 px-3">+/- Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donneesGraphique.filter(row => row.investi > 0).map((row, idx) => (
                          <tr key={idx} className={`border-b border-slate-700 ${idx + 1 === semaineActuelle ? 'bg-blue-600/20' : ''}`}>
                            <td className="py-2 px-3 font-semibold">{row.semaine}</td>
                            <td className="py-2 px-3 text-slate-400">{row.date}</td>
                            <td className="py-2 px-3 text-right">{row.investi.toFixed(2)} €</td>
                            <td className="py-2 px-3 text-right text-blue-400">{row.investiCumule.toFixed(2)} €</td>
                            <td className="py-2 px-3 text-right text-green-400">{row.valeurCumulee.toFixed(2)} €</td>
                            <td className={`py-2 px-3 text-right font-semibold ${row.valeurCumulee - row.investiCumule >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {row.investiCumule > 0 ? `${(row.valeurCumulee - row.investiCumule).toFixed(2)} €` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {/* Onglet Récap Cryptos */}
            {ongletActif === 'recapCryptos' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <PieChart className="w-6 h-6" />
                  Récapitulatif par crypto
                </h2>

                {recapParCrypto.sort((a, b) => (b.repartition || 0) - (a.repartition || 0)).map(crypto => (
                  <div key={crypto.id} className="bg-slate-700/30 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      {crypto.nom}
                      <span className="text-sm font-normal text-slate-400">({crypto.repartition}%)</span>
                    </h3>

                    {/* Graphique 1 : Prix d'achat vs Prix moyen */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">📈 Évolution des prix - {crypto.nom}</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={crypto.historiqueParSemaine.filter(h => h.prixAchat > 0)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="semaine" stroke="#94a3b8" tickFormatter={(val) => `S${val}`} />
                          <YAxis stroke="#94a3b8" tickFormatter={(val) => `${val.toLocaleString()}€`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                            labelFormatter={(val) => `Semaine ${val}`}
                            formatter={(value) => [`${value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`]}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="prixAchat" stroke="#f59e0b" strokeWidth={2} name="Prix d'achat" dot={{ fill: '#f59e0b', r: 4 }} />
                          <Line type="monotone" dataKey="prixMoyen" stroke="#8b5cf6" strokeWidth={2} name="Prix moyen DCA" dot={{ fill: '#8b5cf6', r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Graphique 2 : Valeur investie vs Valeur au lundi */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">💰 Investissement vs Valeur historique - {crypto.nom}</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <ComposedChart data={crypto.historiqueParSemaine.filter(h => h.investiCumule > 0)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="semaine" stroke="#94a3b8" tickFormatter={(val) => `S${val}`} />
                          <YAxis stroke="#94a3b8" tickFormatter={(val) => `${val}€`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                            labelFormatter={(val) => `Semaine ${val}`}
                            formatter={(value) => [`${value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`]}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="investiCumule" stroke="#3b82f6" strokeWidth={2} name="Total investi (€)" dot={{ fill: '#3b82f6', r: 4 }} />
                          <Line type="monotone" dataKey="valeurAuLundi" stroke="#10b981" strokeWidth={2} name="Valeur au lundi (€)" dot={{ fill: '#10b981', r: 4 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Tableau détaillé */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-600 text-slate-400">
                            <th className="text-left py-2 px-2">Sem.</th>
                            <th className="text-left py-2 px-2">Date</th>
                            <th className="text-right py-2 px-2">Prix achat</th>
                            <th className="text-right py-2 px-2">Qté semaine</th>
                            <th className="text-right py-2 px-2">€ semaine</th>
                            <th className="text-right py-2 px-2">Qté totale</th>
                            <th className="text-right py-2 px-2">€ investi</th>
                            <th className="text-right py-2 px-2">Prix moyen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {crypto.historiqueParSemaine.filter(row => row.montantSemaine > 0).map((row, idx) => (
                            <tr 
                              key={idx} 
                              className={`border-b border-slate-700/50 ${
                                row.montantSemaine > 0 ? 'bg-green-900/10' : ''
                              } ${idx + 1 === semaineActuelle ? 'bg-blue-600/20' : ''}`}
                            >
                              <td className="py-2 px-2 font-semibold">S{row.semaine}</td>
                              <td className="py-2 px-2 text-slate-400">{row.date}</td>
                              <td className="py-2 px-2 text-right">
                                {row.prixAchat > 0 ? `${row.prixAchat.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` : '-'}
                              </td>
                              <td className="py-2 px-2 text-right text-purple-400">
                                {row.quantiteSemaine > 0 ? row.quantiteSemaine.toFixed(8) : '-'}
                              </td>
                              <td className="py-2 px-2 text-right text-blue-400">
                                {row.montantSemaine > 0 ? `${row.montantSemaine.toFixed(2)} €` : '-'}
                              </td>
                              <td className="py-2 px-2 text-right text-purple-400 font-semibold">
                                {row.quantiteCumulee > 0 ? row.quantiteCumulee.toFixed(8) : '-'}
                              </td>
                              <td className="py-2 px-2 text-right text-green-400 font-semibold">
                                {row.investiCumule > 0 ? `${row.investiCumule.toFixed(2)} €` : '-'}
                              </td>
                              <td className="py-2 px-2 text-right text-yellow-400">
                                {row.prixMoyen > 0 ? `${row.prixMoyen.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Résumé */}
                    {crypto.historiqueParSemaine.some(h => h.quantiteCumulee > 0) && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-600/30 rounded-lg p-3">
                          <div className="text-xs text-slate-400">Quantité totale</div>
                          <div className="text-lg font-bold text-purple-400">
                            {crypto.historiqueParSemaine[crypto.historiqueParSemaine.length - 1]?.quantiteCumulee.toFixed(8) || 0}
                          </div>
                        </div>
                        <div className="bg-slate-600/30 rounded-lg p-3">
                          <div className="text-xs text-slate-400">Total investi</div>
                          <div className="text-lg font-bold text-green-400">
                            {crypto.historiqueParSemaine[crypto.historiqueParSemaine.length - 1]?.investiCumule.toFixed(2) || 0} €
                          </div>
                        </div>
                        <div className="bg-slate-600/30 rounded-lg p-3">
                          <div className="text-xs text-slate-400">Prix moyen</div>
                          <div className="text-lg font-bold text-yellow-400">
                            {crypto.historiqueParSemaine[crypto.historiqueParSemaine.length - 1]?.prixMoyen.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0} €
                          </div>
                        </div>
                        <div className="bg-slate-600/30 rounded-lg p-3">
                          <div className="text-xs text-slate-400">Valeur actuelle</div>
                          <div className="text-lg font-bold text-blue-400">
                            {((crypto.historiqueParSemaine[crypto.historiqueParSemaine.length - 1]?.quantiteCumulee || 0) * (crypto.prixActuel || 0)).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}