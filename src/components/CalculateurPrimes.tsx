import { useState, useMemo, useEffect } from 'react'
import { ChevronRight, CheckCircle2, AlertCircle, TrendingUp, ArrowLeft } from 'lucide-react'
import { ifse1Data, getAllDirections, getIFSE2ByDirection, getDirectionFullName } from '../data/rifseep-data'

interface CalculateurPrimesProps {
  onClose?: () => void
}

export default function CalculateurPrimes({ onClose }: CalculateurPrimesProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedFunctionCode, setSelectedFunctionCode] = useState('')
  // const [selectedJob, setSelectedJob] = useState('') // Kept for future advanced filtering
  const [selectedDirection, setSelectedDirection] = useState('')
  const [selectedIFSE2, setSelectedIFSE2] = useState<Set<number>>(new Set())
  const [weekendSaturdays, setWeekendSaturdays] = useState(0)
  const [weekendSundays, setWeekendSundays] = useState(0)
  const [weekendRateSat, setWeekendRateSat] = useState(40)
  const [weekendRateSun, setWeekendRateSun] = useState(40)

  // Get all unique jobs from IFSE2 data, sorted
  // Note: allJobs kept for future use in advanced filtering

  // Note: matchedJobDirections kept for future use in advanced filtering
  // const matchedJobDirections = useMemo(() => {
  //   if (!selectedJob) return []
  //   const matches: string[] = []
  //   ifse2Data.forEach(item => {
  //     if (item.jobs?.some(j => j.toLowerCase().includes(selectedJob.toLowerCase()))) {
  //       if (!matches.includes(item.direction)) {
  //         matches.push(item.direction)
  //       }
  //     }
  //   })
  //   return matches
  // }, [selectedJob])

  // Calculs
  const ifse1Amount = useMemo(() => {
    if (!selectedFunctionCode) return 0
    const item = ifse1Data.find(i => i.functionCode === selectedFunctionCode && i.category === selectedCategory)
    return item?.monthlyAmount || 0
  }, [selectedFunctionCode, selectedCategory])

  const ifse2Amount = useMemo(() => {
    if (!selectedDirection || selectedIFSE2.size === 0) return 0
    const ifse2List = getIFSE2ByDirection(selectedDirection)
    return Array.from(selectedIFSE2).reduce((sum, idx) => {
      return sum + (ifse2List[idx]?.amount || 0)
    }, 0)
  }, [selectedDirection, selectedIFSE2])

  const ifse3SatTotal = weekendSaturdays * weekendRateSat
  const ifse3SunTotal = weekendSundays * weekendRateSun
  const ifse3Total = ifse3SatTotal + ifse3SunTotal

  const totalMonthly = ifse1Amount + ifse2Amount + ifse3Total

  // Note: Commented out for future enhancement of UI
  // const stepDescriptions = [
  //   { num: 1, label: 'Catégorie', desc: 'Votre grille indiciaire' },
  //   { num: 2, label: 'Fonction', desc: 'IFSE 1 - Prime de base' },
  //   { num: 3, label: 'Primes sujétion', desc: 'IFSE 2 - Services' },
  //   { num: 4, label: 'Primes week-end', desc: 'IFSE 3 - Samedis/Dimanches' },
  //   { num: 5, label: 'Résultat', desc: 'Total mensuel' },
  // ]

  // Note: Commented out for future enhancement
  // const isStepComplete = (step: number) => {
  //   if (step === 1) return selectedCategory !== ''
  //   if (step === 2) return selectedFunctionCode !== ''
  //   if (step === 3) return selectedDirection !== ''
  //   if (step === 4) return true
  //   if (step === 5) return true
  //   return false
  // }

    // Note: Commented out for future enhancement
  // const handleJobChange = (value: string) => {
  //   setSelectedJob(value)
  // }

  const handleDirectionSelect = (dir: string) => {
    setSelectedDirection(dir)
    setSelectedIFSE2(new Set())
  }

  const handleToggleIFSE2 = (idx: number) => {
    const newSet = new Set(selectedIFSE2)
    if (newSet.has(idx)) {
      newSet.delete(idx)
    } else {
      newSet.add(idx)
    }
    setSelectedIFSE2(newSet)
  }

  // Auto-advance to next step when current step is complete
  useEffect(() => {
    if (currentStep === 1 && selectedCategory) {
      setTimeout(() => setCurrentStep(2), 300)
    }
  }, [selectedCategory, currentStep])

  useEffect(() => {
    if (currentStep === 2 && selectedFunctionCode) {
      setTimeout(() => setCurrentStep(3), 300)
    }
  }, [selectedFunctionCode, currentStep])

  useEffect(() => {
    if (currentStep === 3 && selectedDirection) {
      setTimeout(() => setCurrentStep(4), 300)
    }
  }, [selectedDirection, currentStep])

  const progressPercent = Math.round(
    (Object.values({
      category: selectedCategory ? 1 : 0,
      function: selectedFunctionCode ? 1 : 0,
      direction: selectedDirection ? 1 : 0,
      weekend: ifse3Total > 0 ? 1 : 0,
      result: selectedFunctionCode ? 1 : 0,
    }).reduce((a, b) => a + b, 0) / 5) * 100
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header avec bouton retour */}
      <div className="bg-slate-800/50 py-6 text-left border-b border-slate-700 px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-cyan-400" />
            Calculateur PRIMES
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          )}
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          Calculez vos primes IFSE (base, sujétion de service, week-end) pas à pas
        </p>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
        {/* PROGRESS TRACKER */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-300">Progression du calcul</h3>
            <span className="text-xs font-medium text-slate-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* ÉTAPE 1: CATÉGORIE */}
        <div className={`transition-all duration-300 ${currentStep === 1 ? 'ring-2 ring-blue-400/50' : ''} bg-gradient-to-br from-slate-800/60 to-slate-800/40 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50`}>
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Catégorie d'emploi</h4>
              <p className="text-xs text-slate-400">Sélectionnez votre grille indiciaire (A, B ou C)</p>
            </div>
          </div>
          {selectedCategory && <CheckCircle2 className="w-5 h-5 text-green-400" />}
        </div>

        <div className="space-y-3 max-w-xs mx-auto">
          {['A', 'B', 'C'].map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat)
                setCurrentStep(2)
              }}
              className={`w-full p-4 rounded-lg text-center transition-all font-semibold text-lg ${ selectedCategory === cat
                ? 'bg-blue-500/80 border border-blue-400 text-white shadow-lg'
                : 'bg-slate-700/40 border border-slate-600/30 text-slate-300 hover:bg-slate-700/60 hover:border-slate-500/50'
              }`}
            >
              Catégorie {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ÉTAPE 2: FONCTION (IFSE 1) */}
      {selectedCategory && (
        <div className={`transition-all duration-300 ${currentStep === 2 ? 'ring-2 ring-cyan-400/50' : ''} bg-gradient-to-br from-slate-800/60 to-slate-800/40 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Fonction & IFSE 1</h4>
                <p className="text-xs text-slate-400">Prime de base selon votre poste</p>
              </div>
            </div>
            {selectedFunctionCode && <CheckCircle2 className="w-5 h-5 text-green-400" />}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {ifse1Data
              .filter(item => item.category === selectedCategory)
              .map((item, idx) => (
                <button
                  key={`${selectedCategory}-${idx}-${item.functionCode}`}
                  onClick={() => {
                    setSelectedFunctionCode(item.functionCode)
                    setCurrentStep(3)
                  }}
                  className={`w-full p-4 rounded-lg text-left transition-all border ${ selectedFunctionCode === item.functionCode
                    ? 'bg-cyan-500/80 border-cyan-400 shadow-lg ring-2 ring-cyan-300'
                    : 'bg-slate-700/40 border-slate-600/30 hover:bg-slate-700/60 hover:border-slate-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className={`font-semibold text-base ${selectedFunctionCode === item.functionCode ? 'text-white' : 'text-slate-200'}`}>
                        {item.function}
                      </p>
                      <p className={`text-xs mt-1 ${selectedFunctionCode === item.functionCode ? 'text-cyan-100' : 'text-slate-400'}`}>
                        Code: {item.functionCode}
                      </p>
                    </div>
                    <div className={`text-right px-3 py-2 rounded-lg ${selectedFunctionCode === item.functionCode ? 'bg-white/20' : 'bg-slate-600/30'}`}>
                      <p className={`text-2xl font-bold ${selectedFunctionCode === item.functionCode ? 'text-white' : 'text-cyan-400'}`}>
                        {item.monthlyAmount}€
                      </p>
                      <p className={`text-xs ${selectedFunctionCode === item.functionCode ? 'text-cyan-100' : 'text-slate-400'}`}>
                        par mois
                      </p>
                    </div>
                  </div>
                </button>
              ))}
          </div>

          {selectedFunctionCode && (
            <div className="mt-4 space-y-2">
              <div className="p-4 bg-cyan-500/20 border border-cyan-500/40 rounded-lg">
                <p className="text-xs text-cyan-300 mb-1">✓ Fonction sélectionnée</p>
                <p className="text-sm text-slate-200 font-medium">{ifse1Data.find(i => i.functionCode === selectedFunctionCode && i.category === selectedCategory)?.function}</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-teal-500/30 border border-cyan-500/50 rounded-lg shadow-lg">
                <p className="text-xs text-cyan-200 mb-1">📊 Montant IFSE 1 mensuel</p>
                <p className="text-3xl font-bold text-cyan-300">{ifse1Amount}€</p>
                <p className="text-xs text-cyan-200 mt-1">Soit <span className="font-semibold">{(ifse1Amount * 12).toLocaleString('fr-FR')}€</span> par an</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ÉTAPE 3: PRIMES COMPLÉMENTAIRES (IFSE 2 & 3) */}
      {selectedFunctionCode && (
        <div className={`transition-all duration-300 ${currentStep === 3 ? 'ring-2 ring-teal-400/50' : ''} bg-gradient-to-br from-slate-800/60 to-slate-800/40 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              <div>
                                <h4 className="text-xl font-bold text-white">Primes complémentaires</h4>
                <p className="text-xs text-slate-400">IFSE 2 - Services et sujétions</p>
              </div>
            </div>
            {(selectedDirection || ifse3Total > 0) && <CheckCircle2 className="w-5 h-5 text-green-400" />}
          </div>

          {/* IFSE 2 */}
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              IFSE 2 — Primes de sujétion
            </h5>

            <div className="mb-3">
              <label className="text-xs text-slate-400 mb-2 block">Sélectionnez votre direction:</label>
              <select
                value={selectedDirection}
                onChange={(e) => handleDirectionSelect(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-white text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 outline-none transition"
              >
                <option value="">Choisir une direction...</option>
                {getAllDirections().map(dir => (
                  <option key={dir} value={dir}>
                    {getDirectionFullName(dir)}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Sélectionner un métier */}
            {selectedDirection && (
              <div className="mb-4 p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg">
                <h6 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  Sélectionner un métier (optionnel)
                </h6>
                <p className="text-xs text-slate-300 mb-3 italic">
                  Pré-remplit les IFSE 2 applicables à votre service
                </p>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getIFSE2ByDirection(selectedDirection)
                    .flatMap(p => p.jobs || [])
                    .filter((job, idx, arr) => arr.indexOf(job) === idx)
                    .sort()
                    .map((job, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        // Récupérer tous les primes associés à ce métier dans cette direction
                        const directionPrimes = getIFSE2ByDirection(selectedDirection);
                        const jobPrimes = directionPrimes.filter(p => p.jobs?.includes(job));
                        
                        // Pré-sélectionner les primes associées
                        jobPrimes.forEach(jobPrime => {
                          const primeIdx = directionPrimes.findIndex(p => p === jobPrime);
                          if (primeIdx >= 0 && !selectedIFSE2.has(primeIdx)) {
                            handleToggleIFSE2(primeIdx);
                          }
                        });
                      }}
                      className="w-full p-2.5 rounded-lg text-left transition-all border bg-slate-700/30 border-slate-600/20 hover:bg-blue-500/20 hover:border-blue-400/40 text-slate-200 text-sm font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400">→</span>
                        {job}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedDirection && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getIFSE2ByDirection(selectedDirection).map((prime, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleToggleIFSE2(idx)}
                    className={`w-full p-3 rounded-lg text-left transition-all border ${
                      selectedIFSE2.has(idx)
                        ? 'bg-teal-500/30 border-teal-400/60 shadow-md'
                        : 'bg-slate-700/30 border-slate-600/20 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center transition ${
                        selectedIFSE2.has(idx)
                          ? 'bg-green-500 border-green-400'
                          : 'border-slate-500'
                      }`}>
                        {selectedIFSE2.has(idx) && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-200">{prime.motif}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Service: {prime.service || 'Tous'}</p>
                        {prime.jobs && prime.jobs.length > 0 && (
                          <p className="text-xs text-slate-400">Métier(s): {prime.jobs.slice(0, 2).join(', ')}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-400">{prime.amount}€</p>
                        <p className="text-xs text-slate-500">/mois</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {ifse2Amount > 0 && (
              <div className="mt-3 p-2 bg-teal-500/10 border border-teal-500/30 rounded text-sm text-teal-200">
                Primes sélectionnées: <span className="font-bold">{ifse2Amount}€/mois</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ÉTAPE 4: PRIMES WEEK-END (IFSE 3) */}
      {selectedFunctionCode && (
        <div className={`transition-all duration-300 ${currentStep === 4 ? 'ring-2 ring-purple-400/50' : ''} bg-gradient-to-br from-slate-800/60 to-slate-800/40 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                4
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Primes week-end</h4>
                <p className="text-xs text-slate-400">IFSE 3 - Samedis et dimanches travaillés</p>
              </div>
            </div>
            {(weekendSaturdays > 0 || weekendSundays > 0) && <CheckCircle2 className="w-5 h-5 text-green-400" />}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs text-slate-400 mb-2 block font-medium">Samedis travaillés par mois</label>
              <div className="space-y-2">
                {[0, 1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setWeekendSaturdays(n)}
                    className={`w-full p-2 rounded text-sm transition-all ${
                      weekendSaturdays === n
                        ? 'bg-purple-500/70 text-white font-medium border border-purple-400'
                        : 'bg-slate-700/30 text-slate-300 border border-slate-600/30 hover:bg-slate-700/50'
                    }`}
                  >
                    {n} samedi{n !== 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-2 block font-medium">Dimanches travaillés par mois</label>
              <div className="space-y-2">
                {[0, 1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setWeekendSundays(n)}
                    className={`w-full p-2 rounded text-sm transition-all ${
                      weekendSundays === n
                        ? 'bg-purple-500/70 text-white font-medium border border-purple-400'
                        : 'bg-slate-700/30 text-slate-300 border border-slate-600/30 hover:bg-slate-700/50'
                    }`}
                  >
                    {n} dimanche{n !== 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(weekendSaturdays > 0 || weekendSundays > 0) && (
            <>
              <div className="mb-6 pb-6 border-b border-slate-600/30">
                <h5 className="text-sm font-semibold text-slate-200 mb-4">Sélectionnez les taux horaires</h5>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block font-medium">Taux pour les samedis</label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setWeekendRateSat(40)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          weekendRateSat === 40
                            ? 'bg-purple-500/60 border border-purple-400 text-white'
                            : 'bg-slate-700/30 border border-slate-600/30 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <p className="font-semibold">40€ par samedi</p>
                        <p className="text-xs">Jusqu'à 3h13 de travail</p>
                      </button>
                      <button
                        onClick={() => setWeekendRateSat(60)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          weekendRateSat === 60
                            ? 'bg-purple-500/60 border border-purple-400 text-white'
                            : 'bg-slate-700/30 border border-slate-600/30 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <p className="font-semibold">60€ par samedi</p>
                        <p className="text-xs">Entre 3h16 et 7h12 de travail</p>
                      </button>
                      <button
                        onClick={() => setWeekendRateSat(80)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          weekendRateSat === 80
                            ? 'bg-purple-500/60 border border-purple-400 text-white'
                            : 'bg-slate-700/30 border border-slate-600/30 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <p className="font-semibold">80€ par samedi</p>
                        <p className="text-xs">Plus de 7h12 de travail</p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-2 block font-medium">Taux pour les dimanches</label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setWeekendRateSun(40)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          weekendRateSun === 40
                            ? 'bg-purple-500/60 border border-purple-400 text-white'
                            : 'bg-slate-700/30 border border-slate-600/30 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <p className="font-semibold">40€ par dimanche</p>
                        <p className="text-xs">Jusqu'à 3h13 de travail</p>
                      </button>
                      <button
                        onClick={() => setWeekendRateSun(60)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          weekendRateSun === 60
                            ? 'bg-purple-500/60 border border-purple-400 text-white'
                            : 'bg-slate-700/30 border border-slate-600/30 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <p className="font-semibold">60€ par dimanche</p>
                        <p className="text-xs">Entre 3h16 et 7h12 de travail</p>
                      </button>
                      <button
                        onClick={() => setWeekendRateSun(80)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          weekendRateSun === 80
                            ? 'bg-purple-500/60 border border-purple-400 text-white'
                            : 'bg-slate-700/30 border border-slate-600/30 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <p className="font-semibold">80€ par dimanche</p>
                        <p className="text-xs">Plus de 7h12 de travail</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {ifse3Total > 0 && (
                <div className="p-4 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 border border-purple-500/50 rounded-lg">
                  <p className="text-xs text-purple-200 mb-2">💰 Calcul IFSE 3</p>
                  <div className="space-y-1 text-sm">
                    {weekendSaturdays > 0 && (
                      <p className="text-slate-200">{weekendSaturdays} samedi(s) × {weekendRateSat}€ = <span className="font-bold text-purple-300">{ifse3SatTotal}€</span></p>
                    )}
                    {weekendSundays > 0 && (
                      <p className="text-slate-200">{weekendSundays} dimanche(s) × {weekendRateSun}€ = <span className="font-bold text-purple-300">{ifse3SunTotal}€</span></p>
                    )}
                    <div className="border-t border-purple-400/30 mt-2 pt-2">
                      <p className="text-purple-200 font-semibold">Total IFSE 3: <span className="text-lg">{ifse3Total}€/mois</span></p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {weekendSaturdays === 0 && weekendSundays === 0 && (
            <div className="p-3 bg-slate-700/50 border border-slate-600/30 rounded-lg text-center">
              <p className="text-xs text-slate-400">Pas de primes week-end sélectionnées</p>
            </div>
          )}
        </div>
      )}

      {/* ÉTAPE 5: RÉSULTAT FINAL */}
      {selectedFunctionCode && (
        <div className={`transition-all duration-300 ${currentStep === 5 ? 'ring-2 ring-green-400/50' : ''} bg-gradient-to-br from-green-900/40 via-emerald-900/40 to-teal-900/40 rounded-xl p-6 border border-green-500/40 shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                5
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Résumé total</h4>
                <p className="text-xs text-slate-300">Somme de toutes vos primes</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-green-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">IFSE 1</p>
              <p className="text-2xl font-bold text-blue-300">{ifse1Amount}€</p>
              <p className="text-xs text-slate-400 mt-1">Prime de fonction</p>
            </div>

            <div className="bg-teal-500/20 border border-teal-500/40 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">IFSE 2</p>
              <p className="text-2xl font-bold text-teal-300">{ifse2Amount}€</p>
              <p className="text-xs text-slate-400 mt-1">Primes sélectionnées</p>
            </div>

            <div className="bg-purple-500/20 border border-purple-500/40 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">IFSE 3</p>
              <p className="text-2xl font-bold text-purple-300">{ifse3Total}€</p>
              <p className="text-xs text-slate-400 mt-1">Primes week-end</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/30 via-emerald-500/30 to-teal-500/30 border border-green-500/60 rounded-lg p-6 shadow-lg">
            <p className="text-sm text-slate-300 mb-2 font-medium">Revenu mensuel additionnel</p>
            <p className="text-5xl font-bold text-green-300">{totalMonthly}€</p>
            <p className="text-sm text-slate-300 mt-3 font-light">
              Soit <span className="font-bold text-green-200">{(totalMonthly * 12).toLocaleString('fr-FR')}€</span> par an
            </p>
          </div>

          <div className="mt-4 p-3 bg-slate-700/50 border border-slate-600/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-400">
              ℹ️ Ces montants sont calculés selon vos sélections. Consultez la RH pour confirmation avant demande de régularisation.
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
