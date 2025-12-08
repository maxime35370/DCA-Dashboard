import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, Calendar, Percent, RefreshCw, Wallet, PieChart, Settings, ShoppingCart, BarChart3 } from 'lucide-react';

export default function DCADashboard() {
  const [ongletActif, setOngletActif] = useState('portefeuille');
  
  // États initiaux par défaut
  const cryptosParDefaut = [
    {
      id: 1,
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
      id: 2,
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
      id: 3,
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
      id: 4,
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
  
  const [capitalDepart, setCapitalDepart] = useState(10000);
  const [pourcentageUtilise, setPourcentageUtilise] = useState(80);
  const [dureeEnSemaines, setDureeEnSemaines] = useState(12);
  const [semaineActuelle, setSemaineActuelle] = useState(1);
  const [prixEnTempsReel, setPrixEnTempsReel] = useState({});
  const [chargementPrix, setChargementPrix] = useState(false);
  const [tauxEurUsd, setTauxEurUsd] = useState(1.10);
  const [cryptos, setCryptos] = useState(cryptosParDefaut);
  const [donneesChargees, setDonneesChargees] = useState(false);

  // Chargement des données au montage du composant
  useEffect(() => {
    try {
      const donneesLocales = localStorage.getItem('dcaDashboardData');
      if (donneesLocales) {
        const parsed = JSON.parse(donneesLocales);
        
        if (parsed.capitalDepart) setCapitalDepart(parsed.capitalDepart);
        if (parsed.pourcentageUtilise) setPourcentageUtilise(parsed.pourcentageUtilise);
        if (parsed.dureeEnSemaines) setDureeEnSemaines(parsed.dureeEnSemaines);
        if (parsed.semaineActuelle) setSemaineActuelle(parsed.semaineActuelle);
        
        if (parsed.cryptos) {
          const cryptosRestores = parsed.cryptos.map(crypto => ({
            ...crypto,
            paliers: crypto.paliers.map(p => ({
              ...p,
              max: p.max === null ? Infinity : p.max
            }))
          }));
          setCryptos(cryptosRestores);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
    setDonneesChargees(true);
  }, []);

  // Sauvegarde automatique dans le localStorage à chaque changement
  useEffect(() => {
    if (!donneesChargees) return; // Ne pas sauvegarder avant le premier chargement
    
    const donneesASauvegarder = {
      capitalDepart,
      pourcentageUtilise,
      dureeEnSemaines,
      semaineActuelle,
      cryptos: cryptos.map(crypto => ({
        ...crypto,
        paliers: crypto.paliers.map(p => ({
          ...p,
          max: p.max === Infinity ? null : p.max
        }))
      }))
    };
    
    try {
      localStorage.setItem('dcaDashboardData', JSON.stringify(donneesASauvegarder));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }, [capitalDepart, pourcentageUtilise, dureeEnSemaines, semaineActuelle, cryptos, donneesChargees]);
  
  const [cryptos, setCryptos] = useState([
    {
      id: 1,
      nom: 'BTC',
      coinGeckoId: 'bitcoin',
      repartition: 50,
      prixActuel: 45000,
      historique: [], // { semaine, quantite, prixAchat, montant }
      paliers: [
        { min: 50000, max: Infinity, coeff: 0.5, label: 'Très haut' },
        { min: 47000, max: 50000, coeff: 0.75, label: 'Haut' },
        { min: 43000, max: 47000, coeff: 1, label: 'Normal' },
        { min: 40000, max: 43000, coeff: 1.25, label: 'Bas' },
        { min: 0, max: 40000, coeff: 1.5, label: 'Très bas' }
      ]
    },
    {
      id: 2,
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
      id: 3,
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
      id: 4,
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
  ]);

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
      
      // Mise à jour automatique des prix actuels en EUR
      setCryptos(prev => prev.map(c => {
        if (data[c.coinGeckoId]) {
          return { ...c, prixActuel: data[c.coinGeckoId].eur };
        }
        return c;
      }));
      
    } catch (error) {
      console.error('Erreur lors de la récupération des prix:', error);
    } finally {
      setChargementPrix(false);
    }
  };

  // Chargement initial des prix
  useEffect(() => {
    fetchPrixTempsReel();
    // Actualisation toutes les 60 secondes
    const interval = setInterval(fetchPrixTempsReel, 60000);
    return () => clearInterval(interval);
  }, []);

  const capitalUtilisable = useMemo(() => {
    return (capitalDepart * pourcentageUtilise) / 100;
  }, [capitalDepart, pourcentageUtilise]);

  const capitalReserve = useMemo(() => {
    return capitalDepart - capitalUtilisable;
  }, [capitalDepart, capitalUtilisable]);

  // Calculs du portefeuille global
  const statsPortefeuille = useMemo(() => {
    const statsCryptos = cryptos.map(crypto => {
      const quantiteTotale = crypto.historique.reduce((sum, h) => sum + h.quantite, 0);
      const montantInvesti = crypto.historique.reduce((sum, h) => sum + h.montant, 0);
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
    const palier = crypto.paliers.find(p => crypto.prixActuel >= p.min && crypto.prixActuel < p.max);
    return palier ? palier.coeff : 1;
  };

  const getPalierLabel = (crypto) => {
    const palier = crypto.paliers.find(p => crypto.prixActuel >= p.min && crypto.prixActuel < p.max);
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
  const enregistrerAchatsSemaine = () => {
    setCryptos(prev => prev.map(crypto => {
      const detailCrypto = calculsSemaine.detailsCryptos.find(d => d.id === crypto.id);
      if (!detailCrypto) return crypto;

      const nouvelAchat = {
        semaine: semaineActuelle,
        quantite: detailCrypto.quantite,
        prixAchat: crypto.prixActuel,
        montant: detailCrypto.montantReel
      };

      return {
        ...crypto,
        historique: [...crypto.historique, nouvelAchat]
      };
    }));

    setSemaineActuelle(prev => Math.min(dureeEnSemaines, prev + 1));
  };

  const updateCryptoRepartition = (id, value) => {
    setCryptos(prev => prev.map(c => 
      c.id === id ? { ...c, repartition: parseFloat(value) || 0 } : c
    ));
  };

  const updateCryptoPrix = (id, value) => {
    setCryptos(prev => prev.map(c => 
      c.id === id ? { ...c, prixActuel: parseFloat(value) || 0 } : c
    ));
  };

  const updatePalier = (cryptoId, palierIndex, field, value) => {
    setCryptos(prev => prev.map(c => {
      if (c.id === cryptoId) {
        const newPaliers = [...c.paliers];
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
        return { ...c, paliers: newPaliers };
      }
      return c;
    }));
  };

  const ajouterPalier = (cryptoId) => {
    setCryptos(prev => prev.map(c => {
      if (c.id === cryptoId) {
        const nouveauPalier = {
          min: 0,
          max: 100,
          coeff: 1,
          label: 'Nouveau palier'
        };
        return { ...c, paliers: [...c.paliers, nouveauPalier] };
      }
      return c;
    }));
  };

  const supprimerPalier = (cryptoId, palierIndex) => {
    setCryptos(prev => prev.map(c => {
      if (c.id === cryptoId && c.paliers.length > 1) {
        const newPaliers = c.paliers.filter((_, idx) => idx !== palierIndex);
        return { ...c, paliers: newPaliers };
      }
      return c;
    }));
  };

  // Fonction pour réinitialiser toutes les données
  const reinitialiserDonnees = () => {
    if (confirm('⚠️ Voulez-vous vraiment réinitialiser toutes les données ? Cette action est irréversible.')) {
      try {
        localStorage.removeItem('dcaDashboardData');
        window.location.reload();
      } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
        alert('Impossible de réinitialiser les données');
      }
    }
  };

  const totalRepartition = cryptos.reduce((sum, c) => sum + c.repartition, 0);
  const repartitionValide = Math.abs(totalRepartition - 100) < 0.01;

  const getIconForPalier = (label) => {
    if (label.includes('haut')) return <TrendingUp className="w-4 h-4" />;
    if (label.includes('bas')) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

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
              Sauvegarde automatique activée
            </div>
            <button
              onClick={reinitialiserDonnees}
              className="text-xs text-red-400 hover:text-red-300 underline"
            >
              Réinitialiser toutes les données
            </button>
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
          </div>

          <div className="p-6">
            {/* Onglet Portefeuille */}
            {ongletActif === 'portefeuille' && (
              <div className="space-y-6">
                {/* Statistiques du portefeuille */}
                <div>
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
                        {cryptos.reduce((sum, c) => sum + c.historique.length, 0)}
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
                                <div className="font-semibold text-blue-400">{crypto.prixActuel.toFixed(2)} €</div>
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
              </div>
            )}

            {/* Onglet Configuration */}
            {ongletActif === 'configuration' && (
              <div className="space-y-6">
                {/* Configuration principale */}
                <div>
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
                    {cryptos.map((crypto, idx) => (
                      <div key={crypto.id} className="bg-slate-700/50 rounded-lg p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm text-slate-300 mb-1">Crypto</label>
                            <input
                              type="text"
                              value={crypto.nom}
                              onChange={(e) => {
                                setCryptos(prev => prev.map(c => 
                                  c.id === crypto.id ? { ...c, nom: e.target.value } : c
                                ));
                              }}
                              className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white font-bold"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm text-slate-300 mb-1">Répartition (%)</label>
                            <input
                              type="number"
                              value={crypto.repartition}
                              onChange={(e) => updateCryptoRepartition(crypto.id, e.target.value)}
                              className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                              step="0.1"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm text-slate-300 mb-1">Prix actuel (€)</label>
                            <input
                              type="number"
                              value={crypto.prixActuel}
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
                            {crypto.paliers.map((palier, pIdx) => (
                              <div key={pIdx} className="bg-slate-600/50 rounded p-3 flex items-center gap-2">
                                <div className="flex-1 grid grid-cols-4 gap-2">
                                  <div>
                                    <div className="text-xs text-slate-400 mb-1">Label</div>
                                    <input
                                      type="text"
                                      value={palier.label}
                                      onChange={(e) => updatePalier(crypto.id, pIdx, 'label', e.target.value)}
                                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                                      placeholder="Ex: Très haut"
                                    />
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-400 mb-1">Prix min (€)</div>
                                    <input
                                      type="number"
                                      value={palier.min === 0 ? 0 : palier.min}
                                      onChange={(e) => updatePalier(crypto.id, pIdx, 'min', e.target.value)}
                                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                                      step="0.01"
                                      placeholder="0"
                                    />
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-400 mb-1">Prix max (€)</div>
                                    <input
                                      type="number"
                                      value={palier.max === Infinity ? '' : palier.max}
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
                                      value={palier.coeff}
                                      onChange={(e) => updatePalier(crypto.id, pIdx, 'coeff', e.target.value)}
                                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                                      step="0.1"
                                      placeholder="1"
                                    />
                                  </div>
                                </div>
                                <button
                                  onClick={() => supprimerPalier(crypto.id, pIdx)}
                                  disabled={crypto.paliers.length === 1}
                                  className="bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-2 py-1 rounded text-xs"
                                  title="Supprimer ce palier"
                                >
                                  ✕
                                </button>
                                <div className="text-xs text-slate-400 min-w-[120px]">
                                  {palier.min === 0 && palier.max === Infinity && '0 → ∞'}
                                  {palier.min === 0 && palier.max !== Infinity && `0 → ${palier.max}`}
                                  {palier.min !== 0 && palier.max === Infinity && `${palier.min} → ∞`}
                                  {palier.min !== 0 && palier.max !== Infinity && `${palier.min} → ${palier.max}`}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-slate-400 mt-2 italic">
                            💡 Si le prix est entre {crypto.paliers[0]?.min || 0} et {crypto.paliers[0]?.max === Infinity ? '∞' : crypto.paliers[0]?.max}, 
                            le coefficient sera de {crypto.paliers[0]?.coeff}x
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
                    <h2 className="text-2xl font-bold">Semaine {semaineActuelle} - Investissement</h2>
                    {semaineActuelle <= dureeEnSemaines && (
                      <button
                        onClick={enregistrerAchatsSemaine}
                        className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Valider les achats de la semaine
                      </button>
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
                            <span className="text-slate-400">({crypto.repartition}%)</span>
                            <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                              crypto.coeff > 1 ? 'bg-green-600' : crypto.coeff < 1 ? 'bg-orange-600' : 'bg-slate-600'
                            }`}>
                              {getIconForPalier(crypto.palierLabel)}
                              {crypto.palierLabel} (×{crypto.coeff})
                            </span>
                          </div>
                          <div className="text-slate-400">
                            Prix: {crypto.prixActuel.toLocaleString('fr-FR')} €
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-slate-400">Prévu</div>
                            <div className="font-semibold">{crypto.montantPrevu.toFixed(2)} €</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Réel</div>
                            <div className="font-semibold text-green-400">{crypto.montantReel.toFixed(2)} €</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Quantité</div>
                            <div className="font-semibold text-purple-400">{crypto.quantite.toFixed(8)}</div>
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
          </div>
        </div>

      </div>
    </div>
  );
}