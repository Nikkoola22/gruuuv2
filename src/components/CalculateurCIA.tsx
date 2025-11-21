import { useState, useEffect } from 'react';
import { Euro, ArrowLeft, CheckCircle, ChevronRight, ChevronDown } from 'lucide-react';

interface CalculateurCIAProps {
  onClose: () => void;
}

export default function CalculateurCIA({ onClose }: CalculateurCIAProps) {
  const [ifseMensuel, setIfseMensuel] = useState<number>(0);
  const [weekendServices, setWeekendServices] = useState<number>(0);
  const [weekendRate, setWeekendRate] = useState<number>(40);
  const [tauxEvaluation, setTauxEvaluation] = useState<number>(0);
  const [joursAbsenceN1, setJoursAbsenceN1] = useState<number>(0);
  const [etapeActive, setEtapeActive] = useState<number>(1); // Suivi de l'étape active
  const [absencesTouched, setAbsencesTouched] = useState<boolean>(false); // Track if user touched absences field
  const [evaluationTouched, setEvaluationTouched] = useState<boolean>(false); // Track if user touched evaluation
  const [expandDetail, setExpandDetail] = useState<boolean>(false); // État pour détail du calcul
  const [weekendMode, setWeekendMode] = useState<'estimate' | 'exact'>('estimate'); // Mode estimation ou nombre exact
  const [weekendExact, setWeekendExact] = useState<number>(0); // Nombre exact de week-ends (max 52)
  const [etape3Collapsed, setEtape3Collapsed] = useState<boolean>(false); // État pour collapse l'étape 3

  const weekendOptions = Array.from({ length: 6 }, (_, i) => i); // Limité à 5 week-ends max (0 à 5)
  // Utiliser weekendExact si en mode exact et > 0, sinon weekendServices
  const finalWeekendServices = weekendMode === 'exact' && weekendExact > 0 ? weekendExact : weekendServices;
  const ifseMensuelTotal = ifseMensuel + finalWeekendServices * weekendRate;
  
  // Auto-advance to next step when IFSE is filled (only advance to step 2, not beyond)
  // Removed: étape 1 now stays visible even after filling IFSE

  // Auto-advance to next step when Évaluation is selected
  // Removed: étape 2 now stays visible, collapse happens via Valider button

  // Auto-advance to next step when Absences is filled by user
  // Removed: étape 3 now stays visible
  
  // Calcul du CIA
  const calculerCIA = () => {
    if (ifseMensuelTotal <= 0) {
      return {
        ifseAnnuel: 0,
        base10Pourcent: 0,
        tauxAbsence: 0,
        ciaEvaluation: 0,
        ciaAbsence: 0,
        ciaFinal: 0,
        detailCalcul: ""
      };
    }
    
    // ÉTAPE 1: Calcul de la base CIA
    // CIA = (IFSE mensuel × 10% × 12)
    const ifseAnnuel = ifseMensuelTotal * 12;
    const base10Pourcent = ifseAnnuel * 0.10; // 10% de l'IFSE annuel
    
    // ÉTAPE 2: Calcul de la première moitié (Taux d'évaluation)
    // La première moitié dépend du taux d'évaluation annuelle
    const ciaEvaluation = (base10Pourcent / 2) * (tauxEvaluation / 100);
    
    // ÉTAPE 3: Calcul de la deuxième moitié (Jours d'absence N-1)
    // Déterminer le taux selon les jours d'absence
    let tauxAbsence = 0;
    if (joursAbsenceN1 < 5) {
      tauxAbsence = 100; // < 5 jours: 100%
    } else if (joursAbsenceN1 <= 10) {
      tauxAbsence = 50;  // 5-10 jours: 50%
    } else {
      tauxAbsence = 0;   // > 10 jours: 0%
    }
    
    const ciaAbsence = (base10Pourcent / 2) * (tauxAbsence / 100);
    
    // ÉTAPE 4: CIA Final
    const ciaFinal = ciaEvaluation + ciaAbsence;
    
    // Détail du calcul
    const detailCalcul = `
Calcul détaillé du CIA:
1️⃣ IFSE déclaré = ${ifseMensuel.toFixed(2)}€ | Week-ends (${weekendServices} × ${weekendRate}€) = ${(weekendServices * weekendRate).toFixed(2)}€
  ➜ IFSE mensuel retenu = ${ifseMensuelTotal.toFixed(2)}€
  ➜ IFSE annuel = ${ifseMensuelTotal.toFixed(2)}€ × 12 = ${ifseAnnuel.toFixed(2)}€
2️⃣ Base CIA (10% de l'IFSE annuel) = ${ifseAnnuel.toFixed(2)}€ × 10% = ${base10Pourcent.toFixed(2)}€

📊 Répartition sur 2 moitiés (chaque moitié = 50%):

1️⃣ PREMIÈRE MOITIÉ (Évaluation annuelle):
   • Montant de la moitié = ${base10Pourcent.toFixed(2)}€ ÷ 2 = ${(base10Pourcent / 2).toFixed(2)}€
   • Taux d'évaluation = ${tauxEvaluation}%
  • CIA Évaluation = ${(base10Pourcent / 2).toFixed(2)}€ × ${tauxEvaluation}% = ${ciaEvaluation.toFixed(2)}€

2️⃣ DEUXIÈME MOITIÉ (Jours d'absence N-1):
   • Montant de la moitié = ${base10Pourcent.toFixed(2)}€ ÷ 2 = ${(base10Pourcent / 2).toFixed(2)}€
  • Jours d'absence en N-1 = ${joursAbsenceN1} jours
   • Taux appliqué = ${tauxAbsence}%
     (< 5 jours = 100% | 5-10 jours = 50% | > 10 jours = 0%)
   • CIA Absence = ${(base10Pourcent / 2).toFixed(2)}€ × ${tauxAbsence}% = ${ciaAbsence.toFixed(2)}€

✅ CIA ANNUEL TOTAL = ${ciaEvaluation.toFixed(2)}€ + ${ciaAbsence.toFixed(2)}€ = ${ciaFinal.toFixed(2)}€
💰 CIA MENSUEL = ${(ciaFinal / 12).toFixed(2)}€
    `.trim();
    
    return {
      ifseAnnuel,
      base10Pourcent,
      tauxAbsence,
      ciaEvaluation,
      ciaAbsence,
      ciaFinal,
      detailCalcul
    };
  };
  
  const resultat = calculerCIA();
  return (
    <div className="flex flex-col h-full">
      {/* Header avec bouton retour */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-6 text-left border-b border-orange-600 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-4 bg-white/20 rounded-full">
              <Euro className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white">Calculateur CIA</h3>
              <p className="text-amber-100 text-sm">Complément Indemnitaire Annuel - Calcul pas à pas</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-full font-semibold transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
        {/* PROGRESS TRACKER - Suivi des étapes */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h4 className="font-bold text-gray-800 mb-4 text-center">Votre parcours de calcul</h4>
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "IFSE mensuel", icon: "💰" },
              { num: 2, label: "Évaluation", icon: "📊" },
              { num: 3, label: "Absences", icon: "📅" },
              { num: 4, label: "Résultat", icon: "✅" }
            ].map((etape, idx) => (
              <div key={etape.num} className="flex flex-col items-center flex-1">
                <button
                  onClick={() => setEtapeActive(etape.num)}
                  className={`w-12 h-12 rounded-full font-bold text-lg mb-2 transition-all transform hover:scale-110 ${
                    etapeActive >= etape.num
                      ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg'
                      : 'bg-slate-200 text-gray-600'
                  } flex items-center justify-center`}
                >
                  {etape.num}
                </button>
                <span className="text-xs font-medium text-gray-700 text-center">{etape.label}</span>
                {idx < 3 && (
                  <div className={`h-1 w-full mx-1 mt-2 ${etapeActive > etape.num ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ÉTAPE 1: IFSE Mensuel */}
        <div className={`rounded-xl shadow-md overflow-hidden transition-all ${etapeActive >= 1 ? 'ring-2 ring-orange-400' : ''}`}>
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-orange-700 text-white p-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">💰</div>
              <div>
                <h4 className="font-bold text-xl uppercase tracking-wide">◆ Étape 1</h4>
                <p className="text-amber-100 text-sm mt-1">Votre IFSE mensuel - La base de votre calcul</p>
              </div>
            </div>
          </div>
          
          {etapeActive < 2 && (
          <div className="bg-gradient-to-br from-amber-950/40 via-slate-900/50 to-orange-900/40 border-2 border-orange-500/40 p-8 space-y-6">
            {/* Section 1: Montant IFSE */}
            <div className="bg-white/5 border border-orange-500/20 rounded-xl p-5 space-y-4">
              <h5 className="text-sm font-semibold text-orange-200 uppercase tracking-wide">📊 Montant IFSE mensuel</h5>
              
              <div>
                <label className="block text-xs uppercase tracking-wide text-orange-300 font-semibold mb-3">
                  Montant que vous percevez mensuellement
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-orange-300">€</span>
                  <input
                    type="number"
                    value={ifseMensuel || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setIfseMensuel(val);
                    }}
                    placeholder="Ex: 250"
                    className="flex-1 px-4 py-3 rounded-lg bg-orange-900/20 border-2 border-orange-500/40 text-white font-semibold placeholder-slate-500 focus:border-orange-400 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">Veuillez regarder sur votre fiche de paie</p>
              </div>
            </div>

            {ifseMensuelTotal > 0 && (
              <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 rounded-xl p-6 border-2 border-orange-400/60 shadow-lg">
                <p className="text-white font-bold text-lg flex items-center gap-3 mb-2">
                  <span className="text-2xl">📊</span>
                  Estimation des week-ends
                </p>
                <p className="text-orange-50 text-sm font-semibold">Depuis IFSE3 déclaratif, estimez le nombre de samedi/dimanche par mois</p>
                <div className="mt-3 pt-3 border-t border-orange-400/40">
                  <p className="text-xs text-orange-100 italic">💡 Ce nombre servira à calculer votre complément IFSE</p>
                </div>
              </div>
            )}

            {/* Section 2: Week-ends et Taux */}
            <div className="bg-white/5 border border-orange-500/20 rounded-xl p-5 space-y-4">
              <h5 className="text-sm font-semibold text-orange-200 uppercase tracking-wide">📈 Paramètres supplémentaires</h5>
              
              {/* Choix mode: Estimation ou Nombre exact */}
              <div className="flex gap-3 p-3 bg-orange-900/20 rounded-lg">
                <button
                  onClick={() => setWeekendMode('estimate')}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs uppercase transition-all ${
                    weekendMode === 'estimate'
                      ? 'bg-orange-500 text-white'
                      : 'bg-orange-900/30 text-orange-300 hover:bg-orange-900/50'
                  }`}
                >
                  📊 Estimation
                </button>
                <button
                  onClick={() => setWeekendMode('exact')}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs uppercase transition-all ${
                    weekendMode === 'exact'
                      ? 'bg-orange-500 text-white'
                      : 'bg-orange-900/30 text-orange-300 hover:bg-orange-900/50'
                  }`}
                >
                  🎯 Nombre exact
                </button>
              </div>

              {/* Mode Estimation */}
              {weekendMode === 'estimate' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-orange-300 font-semibold mb-2">
                      Week-ends (samedi/dimanche) en N-1
                    </label>
                    <select
                      value={weekendServices}
                      onChange={(e) => setWeekendServices(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg bg-orange-900/20 border-2 border-orange-500/40 text-white font-semibold focus:border-orange-400 focus:outline-none"
                    >
                      {weekendOptions.map((value) => (
                        <option key={value} value={value}>{value} week-end{value > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-orange-300 font-semibold mb-2">
                      Taux appliqué par week-end
                    </label>
                    <select
                      value={weekendRate}
                      onChange={(e) => setWeekendRate(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg bg-orange-900/20 border-2 border-orange-500/40 text-white font-semibold focus:border-orange-400 focus:outline-none"
                    >
                      {[40, 60, 80].map(rate => (
                        <option key={rate} value={rate}>{rate} €</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Mode Nombre exact */}
              {weekendMode === 'exact' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-orange-300 font-semibold mb-2">
                      Je connais le nombre exact de week-ends réalisés
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        max="52"
                        value={weekendExact || ''}
                        onChange={(e) => {
                          const val = Math.min(52, Math.max(0, Number(e.target.value) || 0));
                          setWeekendExact(val);
                        }}
                        placeholder="0 - 52"
                        className="flex-1 px-4 py-3 rounded-lg bg-orange-900/20 border-2 border-orange-500/40 text-white font-semibold placeholder-slate-500 focus:border-orange-400 focus:outline-none"
                      />
                      <span className="text-sm text-orange-300 font-semibold py-3 px-2">week-ends</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Maximum 52 week-ends par année</p>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-orange-300 font-semibold mb-2">
                      Taux appliqué par week-end
                    </label>
                    <select
                      value={weekendRate}
                      onChange={(e) => setWeekendRate(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg bg-orange-900/20 border-2 border-orange-500/40 text-white font-semibold focus:border-orange-400 focus:outline-none"
                    >
                      {[40, 60, 80].map(rate => (
                        <option key={rate} value={rate}>{rate} €</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Résumé du montant total */}
            <div className="bg-orange-950/30 border-2 border-orange-500/60 rounded-xl p-5 space-y-3">
              <h5 className="text-sm font-semibold text-orange-200 uppercase tracking-wide">💵 Montant IFSE total retenu</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 px-3 bg-orange-900/20 rounded-lg">
                  <span className="text-sm text-slate-300">IFSE déclaré :</span>
                  <span className="text-base font-bold text-orange-300">{ifseMensuel.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-orange-900/20 rounded-lg">
                  <span className="text-sm text-slate-300">Week-ends ({finalWeekendServices} × {weekendRate}€) :</span>
                  <span className="text-base font-bold text-orange-300">{(finalWeekendServices * weekendRate).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center py-3 px-3 bg-orange-500/30 border border-orange-500/50 rounded-lg">
                  <span className="text-sm font-semibold text-white">Total IFSE mensuel :</span>
                  <span className="text-lg font-bold text-orange-300">{ifseMensuelTotal.toFixed(2)}€</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 italic mt-3">✓ Ce montant sert de base pour les étapes suivantes</p>
            </div>

            <div className="bg-slate-500/20 border border-slate-400/20 rounded-xl p-4">
              <p className="text-xs text-slate-300"><strong>💡 Conseil :</strong> Trouvez ce montant sur votre bulletin de paie ou demandez à la RH</p>
            </div>
          </div>
          )}
        </div>

        {/* ÉTAPE 2: Taux d'Évaluation */}
        {ifseMensuelTotal > 0 && (
          <div className={`rounded-xl shadow-md overflow-hidden transition-all ${etapeActive >= 2 ? 'ring-2 ring-purple-400' : ''}`}>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📊</div>
                <div>
                  <h4 className="font-bold text-lg">Étape 2: Votre taux d'évaluation annuelle</h4>
                  <p className="text-purple-100 text-sm">Première moitié de votre CIA (50%)</p>
                </div>
              </div>
            </div>
            
            {!etape3Collapsed && (
            <div className="bg-white p-6 space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-4">Sélectionnez le taux de votre dernière évaluation annuelle:</p>
                
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: 0, label: "0%", desc: "Insuffisant", color: "red" },
                    { value: 50, label: "50%", desc: "Satisfaisant", color: "yellow" },
                    { value: 70, label: "70%", desc: "Bien", color: "blue" },
                    { value: 100, label: "100%", desc: "Très bien", color: "green" }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTauxEvaluation(option.value);
                        setEvaluationTouched(true);
                        if (etapeActive === 2) {
                          setEtapeActive(3); // Ouvre l'étape 3 et collapse l'étape 1 (car etapeActive >= 2)
                        }
                      }}
                      className={`p-4 rounded-lg font-bold transition-all transform hover:scale-105 text-center ${
                        tauxEvaluation === option.value
                          ? `bg-${option.color}-500 text-white border-3 border-${option.color}-700 shadow-lg`
                          : `bg-slate-100 text-gray-700 border-2 border-gray-300 hover:border-purple-400`
                      }`}
                    >
                      <div className="text-xl">{option.label}</div>
                      <div className="text-xs mt-1 font-medium">{option.desc}</div>
                    </button>
                  ))}
                </div>

                {tauxEvaluation !== 100 && (
                  <div className="mt-4 p-3 bg-amber-100 border border-amber-400 rounded-lg text-sm text-amber-800">
                    ⚠️ <strong>Attention:</strong> Cette évaluation impacte directement votre CIA (50% de la base)
                  </div>
                )}

                <div className="mt-4 p-3 bg-slate-100 rounded-lg text-xs text-slate-700">
                  <strong>💡 Conseil:</strong> Consultez votre dossier personnel ou demandez votre dernier avis d'évaluation
                </div>
              </div>

              {tauxEvaluation > 0 && (
                <div className="p-3 bg-purple-100 border border-purple-400 rounded-lg">
                  <p className="text-purple-800 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    CIA Évaluation: {((ifseMensuelTotal * 12 * 0.10) / 2 * (tauxEvaluation / 100)).toFixed(2)}€/an
                  </p>
                  <p className="text-xs text-purple-700 mt-1">Base (50%): {((ifseMensuelTotal * 12 * 0.10) / 2).toFixed(2)}€ × {tauxEvaluation}%</p>
                </div>
              )}
            </div>
            )}
          </div>
        )}

        {/* ÉTAPE 3: Jours d'Absence N-1 */}
        {ifseMensuelTotal > 0 && tauxEvaluation >= 0 && (
          <div className={`rounded-xl shadow-md overflow-hidden transition-all ${etapeActive >= 3 ? 'ring-2 ring-red-400' : ''}`}>
            <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white p-6">
              <div className="flex items-center gap-3">
                <div className="text-3xl">📅</div>
                <div>
                  <h4 className="font-bold text-xl uppercase tracking-wide">◆ Étape 3</h4>
                  <p className="text-red-100 text-sm mt-1">Vos jours d'absence en N-1 - Deuxième moitié de votre CIA (50%)</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-950/40 via-slate-900/50 to-red-900/40 border-2 border-red-500/40 p-8 space-y-6">
              {/* Section 1: Saisie des jours d'absence */}
              <div className="bg-white/5 border border-red-500/20 rounded-xl p-5 space-y-4">
                <h5 className="text-sm font-semibold text-red-200 uppercase tracking-wide">📝 Nombre de jours d'absence</h5>
                
                <div>
                  <label className="block text-xs uppercase tracking-wide text-red-300 font-semibold mb-3">
                    Combien de jours d'absence aviez-vous l'année dernière (N-1)?
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      value={joursAbsenceN1 || ''}
                      onChange={(e) => {
                        setJoursAbsenceN1(Math.max(0, Number(e.target.value)));
                        setAbsencesTouched(true);
                      }}
                      placeholder="0"
                      className="w-20 px-4 py-3 text-2xl font-bold rounded-lg bg-red-900/20 border-2 border-red-500/40 text-white text-center placeholder-slate-500 focus:border-red-400 focus:outline-none"
                    />
                    <span className="text-red-300 font-semibold text-lg">jours</span>
                    <button
                      onClick={() => {
                        setEtapeActive(4); // Affiche l'étape 4 (Résultat)
                        setEtape3Collapsed(true); // Collapse le contenu de l'étape 3
                      }}
                      className="ml-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-md"
                    >
                      ✓ Valider
                    </button>
                  </div>
                </div>
              </div>

              {!etape3Collapsed && (
              <>
              {/* Section 2: Grille des seuils */}
              <div className="bg-white/5 border border-red-500/20 rounded-xl p-5">
                <h5 className="text-sm font-semibold text-red-200 uppercase tracking-wide mb-4">📊 Barème d'absence</h5>
                
                <div className="space-y-2">
                  <div className={`p-4 rounded-lg border-2 transition-all ${joursAbsenceN1 < 5 ? 'bg-emerald-900/30 border-emerald-500/60 shadow-lg' : 'bg-slate-800/30 border-slate-600/30'}`}>
                    <p className={`font-semibold flex items-center gap-2 ${joursAbsenceN1 < 5 ? 'text-emerald-300' : 'text-slate-400'}`}>
                      {joursAbsenceN1 < 5 ? '✅' : '🔘'} 
                      <span>Moins de 5 jours</span>
                      <span className={`ml-auto text-lg font-bold ${joursAbsenceN1 < 5 ? 'text-emerald-300' : 'text-slate-400'}`}>100%</span>
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg border-2 transition-all ${joursAbsenceN1 >= 5 && joursAbsenceN1 <= 10 ? 'bg-amber-900/30 border-amber-500/60 shadow-lg' : 'bg-slate-800/30 border-slate-600/30'}`}>
                    <p className={`font-semibold flex items-center gap-2 ${joursAbsenceN1 >= 5 && joursAbsenceN1 <= 10 ? 'text-amber-300' : 'text-slate-400'}`}>
                      {joursAbsenceN1 >= 5 && joursAbsenceN1 <= 10 ? '⚠️' : '🔘'}
                      <span>Entre 5 et 10 jours</span>
                      <span className={`ml-auto text-lg font-bold ${joursAbsenceN1 >= 5 && joursAbsenceN1 <= 10 ? 'text-amber-300' : 'text-slate-400'}`}>50%</span>
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg border-2 transition-all ${joursAbsenceN1 > 10 ? 'bg-red-900/30 border-red-500/60 shadow-lg' : 'bg-slate-800/30 border-slate-600/30'}`}>
                    <p className={`font-semibold flex items-center gap-2 ${joursAbsenceN1 > 10 ? 'text-red-300' : 'text-slate-400'}`}>
                      {joursAbsenceN1 > 10 ? '❌' : '🔘'}
                      <span>Plus de 10 jours</span>
                      <span className={`ml-auto text-lg font-bold ${joursAbsenceN1 > 10 ? 'text-red-300' : 'text-slate-400'}`}>0%</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Note explicative */}
              <div className="bg-slate-500/20 border border-slate-400/20 rounded-xl p-4">
                <p className="text-xs text-slate-300"><strong>📝 Note :</strong> Les arrêts se comptent en jours calendaires. Un arrêt couvrant un week-end compte tous les jours inclus.</p>
              </div>
              </>
              )}

              {/* Section 4: Résumé du calcul */}
              {joursAbsenceN1 >= 0 && (
                <div className="bg-red-950/30 border-2 border-red-500/60 rounded-xl p-5 space-y-3">
                  <h5 className="text-sm font-semibold text-red-200 uppercase tracking-wide">💰 CIA Absence calculée</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 px-3 bg-red-900/20 rounded-lg">
                      <span className="text-sm text-slate-300">Base (50% de la CIA) :</span>
                      <span className="text-base font-bold text-red-300">{((ifseMensuelTotal * 12 * 0.10) / 2).toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-red-900/20 rounded-lg">
                      <span className="text-sm text-slate-300">Taux appliqué :</span>
                      <span className="text-base font-bold text-red-300">{joursAbsenceN1 < 5 ? '100%' : joursAbsenceN1 <= 10 ? '50%' : '0%'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 px-3 bg-red-500/30 border border-red-500/50 rounded-lg">
                      <span className="text-sm font-semibold text-white">CIA Absence annuelle :</span>
                      <span className="text-lg font-bold text-red-300">{joursAbsenceN1 < 5 ? ((ifseMensuelTotal * 12 * 0.10) / 2).toFixed(2) : joursAbsenceN1 <= 10 ? ((ifseMensuelTotal * 12 * 0.10) / 2 * 0.5).toFixed(2) : '0.00'}€</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ÉTAPE 4: RÉSULTAT FINAL */}
        {ifseMensuelTotal > 0 && (
          <div className={`rounded-xl shadow-xl overflow-hidden transition-all ${etapeActive >= 4 ? 'ring-3 ring-orange-400' : ''}`}>
            <div className="bg-gradient-to-r from-orange-500 via-orange-500 to-red-600 text-white p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="font-bold text-lg">Étape 4: Votre CIA Final</h4>
                  <p className="text-orange-100 text-sm">Récapitulatif complet de votre calcul</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-b from-orange-50 via-white to-amber-50 p-6 space-y-4">
              {/* Affichage du résultat */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 border-3 border-purple-300 shadow-md">
                  <div className="text-sm font-medium text-gray-600 mb-2">📊 CIA Évaluation</div>
                  <div className="text-3xl font-bold text-purple-700">
                    {resultat.ciaEvaluation.toFixed(2)}€
                  </div>
                  <div className="text-xs text-gray-500 mt-2 font-semibold">{tauxEvaluation}% × Base/2</div>
                </div>
                
                <div className="bg-white rounded-xl p-5 border-3 border-red-300 shadow-md">
                  <div className="text-sm font-medium text-gray-600 mb-2">📅 CIA Absences</div>
                  <div className="text-3xl font-bold text-red-700">
                    {resultat.ciaAbsence.toFixed(2)}€
                  </div>
                  <div className="text-xs text-gray-500 mt-2 font-semibold">{resultat.tauxAbsence}% × Base/2</div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-5 border-3 border-orange-600 shadow-lg">
                  <div className="text-sm font-medium text-white mb-2">💰 CIA TOTAL ANNUEL</div>
                  <div className="text-3xl font-bold text-white">
                    {resultat.ciaFinal.toFixed(2)}€
                  </div>
                </div>
              </div>

              {/* Détail du calcul pédagogique - COLLAPSIBLE */}
              <div className="bg-gradient-to-br from-orange-950/40 via-slate-900/50 to-orange-900/40 border-2 border-orange-500/40 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandDetail(!expandDetail)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-orange-900/20 transition-colors"
                >
                  <h5 className="font-bold text-orange-200 flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    Détail du calcul
                  </h5>
                  <ChevronDown className={`w-5 h-5 text-orange-400 transition-transform ${expandDetail ? 'rotate-180' : ''}`} />
                </button>

                {expandDetail && (
                  <div className="px-5 pb-4 space-y-3 bg-black/20 border-t border-orange-500/30">
                    <div className="space-y-2 text-sm font-mono text-slate-200 bg-slate-900/40 p-5 rounded-lg">
                      <div className="flex justify-between">
                        <span>IFSE de base</span>
                        <span className="font-bold text-orange-300">{ifseMensuel}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Week-ends valorisés ({weekendServices} × {weekendRate}€)</span>
                        <span className="font-bold text-orange-300">{(weekendServices * weekendRate).toFixed(2)}€</span>
                      </div>
                      <div className="border-t border-slate-600 pt-2 flex justify-between bg-slate-800/30 -mx-5 px-5 py-2">
                        <span className="font-semibold">IFSE Mensuel retenu</span>
                        <span className="font-bold text-orange-300">{ifseMensuelTotal.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IFSE Annuel (× 12 mois)</span>
                        <span className="font-bold text-orange-300">{resultat.ifseAnnuel.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base CIA (10% × IFSE Annuel)</span>
                        <span className="font-bold text-emerald-300">{resultat.base10Pourcent.toFixed(2)}€</span>
                      </div>
                      
                      <div className="border-t border-slate-600 pt-2 mt-2 space-y-1">
                        <div className="flex justify-between text-blue-300">
                          <span>50% Évaluation ({tauxEvaluation}%)</span>
                          <span className="font-bold">{resultat.ciaEvaluation.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between text-purple-300">
                          <span>50% Absences ({resultat.tauxAbsence}%)</span>
                          <span className="font-bold">{resultat.ciaAbsence.toFixed(2)}€</span>
                        </div>
                      </div>
                      
                      <div className="border-t-2 border-b-2 border-orange-500/50 py-3 mt-2 flex justify-between bg-orange-900/30 -mx-5 px-5">
                        <span className="font-bold text-white">CIA ANNUEL TOTAL</span>
                        <span className="font-bold text-xl text-orange-300">{resultat.ciaFinal.toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Info additionnelle */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <strong>💡 Important:</strong> Ce calcul est fourni à titre informatif. Pour une vérification officielle, consultez votre dossier personnel ou la Direction des Ressources Humaines.
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-3 pt-4 border-t bg-white rounded-lg p-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setIfseMensuel(0);
                    setWeekendServices(0);
                    setWeekendRate(40);
                    setTauxEvaluation(100);
                    setJoursAbsenceN1(0);
                    setEtapeActive(1);
                  }}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Recommencer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}