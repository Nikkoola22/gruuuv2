import React, { useState, useEffect } from 'react'
import { ChevronRight, CheckCircle2 } from 'lucide-react'

interface Calculateur13emeProps {
  onClose?: () => void
}

export default function Calculateur13eme({ onClose }: Calculateur13emeProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [contractType, setContractType] = useState('fonc')
  const [profession, setProfession] = useState('standard')
  const [salary, setSalary] = useState('')
  const [monthsWorked, setMonthsWorked] = useState(12)
  const [weeklyHours, setWeeklyHours] = useState('')
  const [annualHours, setAnnualHours] = useState('')
  const [result, setResult] = useState<any>(null)

  const stepDescriptions = [
    { num: 1, label: 'Type de contrat', desc: 'Fonctionnaire ou contractuel' },
    { num: 2, label: 'Infos personnelles', desc: 'Profession et heures travaillées' },
    { num: 3, label: 'Salaire & mois', desc: 'Salaire mensuel et mois travaillés' },
    { num: 4, label: 'Résultat', desc: 'Simulation du 13ème mois' },
  ]

  const isStepComplete = (step: number) => {
    if (step === 1) return contractType !== ''
    if (step === 2) return profession !== '' && ((contractType === 'fonc' && weeklyHours) || (contractType === 'contractuel' && annualHours))
    if (step === 3) return salary !== '' && monthsWorked > 0
    if (step === 4) return result !== null
    return false
  }

  const progressPercent = Math.round(
    (Object.values({
      contract: contractType ? 1 : 0,
      profession: profession ? 1 : 0,
      salary: salary ? 1 : 0,
      result: result ? 1 : 0,
    }).reduce((a, b) => a + b, 0) / 4) * 100
  )

  // Auto-advance to next step
  useEffect(() => {
    if (currentStep === 1 && contractType) {
      setTimeout(() => setCurrentStep(2), 300)
    }
  }, [contractType, currentStep])

  useEffect(() => {
    if (currentStep === 2 && profession && ((contractType === 'fonc' && weeklyHours) || (contractType === 'contractuel' && annualHours))) {
      setTimeout(() => setCurrentStep(3), 300)
    }
  }, [profession, weeklyHours, annualHours, contractType, currentStep])

  useEffect(() => {
    if (currentStep === 3 && salary && monthsWorked > 0) {
      setTimeout(() => setCurrentStep(4), 300)
    }
  }, [salary, monthsWorked, currentStep])

  const calculateThirteen = () => {
    const sal = parseFloat(salary.toString().replace(',', '.')) || 0
    const months = Math.max(0, Math.min(12, Number(monthsWorked || 0)))
    const weekly = parseFloat(weeklyHours || '0')
    const annualH = parseFloat(annualHours || '0')

    const isContractuel = contractType === 'contractuel'
    const eligible = isContractuel ? (annualH >= 550) : (weekly > 17.5)

    if (!eligible) {
      setResult({ eligible: false })
      return
    }

    const base = sal
    let schedule: { month: string; pct: number }[] = []
    if (profession === 'medecin') {
      schedule = [
        { month: 'Juin', pct: 0.5 },
        { month: 'Novembre', pct: 0.5 },
        { month: 'Décembre', pct: 0 },
      ]
    } else {
      schedule = [
        { month: 'Juin', pct: 0.5 },
        { month: 'Novembre', pct: 0.4 },
        { month: 'Décembre', pct: 0.1 },
      ]
    }

    const prorata = months / 12
    const breakdown = schedule.map(s => ({
      month: s.month,
      pct: s.pct,
      amount: +(base * s.pct * prorata).toFixed(2),
    }))
    const total = breakdown.reduce((sum, b) => sum + b.amount, 0)

    setResult({ eligible: true, breakdown, total, prorata })
  }

  const reset = () => {
    setCurrentStep(1)
    setContractType('fonc')
    setProfession('standard')
    setSalary('')
    setMonthsWorked(12)
    setWeeklyHours('')
    setAnnualHours('')
    setResult(null)
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
        <div className="flex justify-between mb-3">
          {stepDescriptions.map(step => (
            <div key={step.num} className={`text-center flex-1 text-xs ${isStepComplete(step.num) ? 'text-green-400' : currentStep === step.num ? 'text-green-500' : 'text-slate-500'}`}>
              <div className="font-semibold">{step.label}</div>
            </div>
          ))}
        </div>
        <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden border border-slate-600/30">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs font-medium text-slate-400 mt-2 block">{progressPercent}%</span>
      </div>

      {/* ÉTAPE 1: TYPE DE CONTRAT */}
      <div className={`transition-all duration-300 ${currentStep === 1 ? 'ring-2 ring-blue-400/50' : ''} bg-gradient-to-br from-slate-800/60 to-slate-800/40 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">Type de contrat</h4>
              <p className="text-xs text-slate-400">Choisissez votre statut professionnel</p>
            </div>
          </div>
          {contractType && <CheckCircle2 className="w-5 h-5 text-green-400" />}
        </div>

        <div className="space-y-2">
          {[
            { value: 'fonc', label: 'Fonctionnaire / Titulaire', desc: 'Vous travaillez à temps plein' },
            { value: 'contractuel', label: 'Contractuel', desc: 'Vous êtes en contrat de travail' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setContractType(option.value)}
              className={`w-full p-4 rounded-lg text-left transition-all border ${
                contractType === option.value
                  ? 'bg-blue-500/80 border-blue-400 shadow-lg ring-2 ring-blue-300'
                  : 'bg-slate-700/40 border-slate-600/30 hover:bg-slate-700/60 hover:border-slate-500/50'
              }`}
            >
              <p className={`font-semibold text-base ${contractType === option.value ? 'text-white' : 'text-slate-200'}`}>
                {option.label}
              </p>
              <p className={`text-xs mt-1 ${contractType === option.value ? 'text-blue-100' : 'text-slate-400'}`}>
                {option.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ÉTAPE 2: INFOS PERSONNELLES */}
      {contractType && (
        <div className={`transition-all duration-300 ${currentStep === 2 ? 'ring-2 ring-cyan-400/50' : ''} bg-gradient-to-br from-slate-800/60 to-slate-800/40 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">Infos personnelles</h4>
                <p className="text-xs text-slate-400">Profession et heures travaillées</p>
              </div>
            </div>
            {profession && ((contractType === 'fonc' && weeklyHours) || (contractType === 'contractuel' && annualHours)) && <CheckCircle2 className="w-5 h-5 text-green-400" />}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block font-medium">Profession</label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-white text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none"
              >
                <option value="standard">Standard</option>
                <option value="medecin">Médecin</option>
              </select>
            </div>

            {contractType === 'fonc' ? (
              <div>
                <label className="text-sm text-slate-300 mb-2 block font-medium">Heures travaillées par semaine</label>
                <input
                  type="number"
                  step="0.25"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(e.target.value)}
                  placeholder="ex: 35"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-white text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">⚠️ Doit être {'>'} 17.5h pour être éligible</p>
              </div>
            ) : (
              <div>
                <label className="text-sm text-slate-300 mb-2 block font-medium">Heures annuelles de travail</label>
                <input
                  type="number"
                  step="1"
                  value={annualHours}
                  onChange={(e) => setAnnualHours(e.target.value)}
                  placeholder="ex: 600"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-white text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">⚠️ Doit être ≥ 550h pour être éligible</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ÉTAPE 3: SALAIRE & MOIS */}
      {contractType && profession && ((contractType === 'fonc' && weeklyHours) || (contractType === 'contractuel' && annualHours)) && (
        <div className={`transition-all duration-300 ${currentStep === 3 ? 'ring-2 ring-teal-400/50' : ''} bg-gradient-to-br from-slate-800/60 to-slate-800/40 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">Salaire & mois travaillés</h4>
                <p className="text-xs text-slate-400">Informations financières</p>
              </div>
            </div>
            {salary && monthsWorked > 0 && <CheckCircle2 className="w-5 h-5 text-green-400" />}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block font-medium">Salaire brut mensuel (€)</label>
              <input
                type="text"
                inputMode="decimal"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="ex: 2500"
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-white text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block font-medium">Mois travaillés en 2024 (0-12)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={monthsWorked}
                  onChange={(e) => setMonthsWorked(Math.max(0, Math.min(12, Number(e.target.value || 0))))}
                  className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-white text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none"
                />
                <span className="px-3 py-2 bg-slate-700/30 border border-slate-600/30 rounded-lg text-slate-300 text-sm">
                  {monthsWorked}/12
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ÉTAPE 4: RÉSULTAT */}
      {contractType && profession && salary && monthsWorked > 0 && (
        <div className={`transition-all duration-300 ${currentStep === 4 ? 'ring-2 ring-green-400/50' : ''} bg-gradient-to-br from-green-900/40 via-emerald-900/40 to-teal-900/40 rounded-xl p-6 border border-green-500/40 shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                4
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">Résultat estimé</h4>
                <p className="text-xs text-slate-300">Simulation du 13ème mois</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-green-400" />
          </div>

          <div className="space-y-4">
            <button
              onClick={calculateThirteen}
              disabled={result !== null}
              className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                result === null
                  ? 'bg-green-600/70 hover:bg-green-700 text-white shadow-lg'
                  : 'bg-green-700/40 text-green-200'
              }`}
            >
              {result === null ? '🧮 Calculer le 13ème mois' : '✓ Calcul effectué'}
            </button>

            {result && result.eligible === false && (
              <div className="p-4 bg-amber-900/30 border border-amber-500/40 rounded-lg">
                <p className="text-sm text-amber-200 font-medium mb-1">❌ Non éligible</p>
                <p className="text-xs text-amber-200">
                  {contractType === 'fonc'
                    ? 'Vous devez travailler plus de 17h30 par semaine pour être éligible.'
                    : 'Vous devez travailler au minimum 550 heures annuelles pour être éligible.'}
                </p>
              </div>
            )}

            {result && result.eligible === true && (
              <div className="space-y-4">
                <div className="bg-slate-800/40 border border-green-500/30 rounded-lg p-4">
                  <p className="text-xs text-green-300 mb-3">📊 Ventilation du 13ème mois</p>
                  <div className="space-y-2">
                    {result.breakdown.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-slate-200">{item.month}</p>
                          <p className="text-xs text-slate-400">{(item.pct * 100).toFixed(0)}% du salaire</p>
                        </div>
                        <p className="text-lg font-bold text-green-300">{item.amount.toFixed(2)}€</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-green-500/20 mt-3 pt-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-slate-200">Total 13ème mois</p>
                      <p className="text-2xl font-bold text-green-300">{result.total.toFixed(2)}€</p>
                    </div>
                    <p className="text-xs text-green-200 mt-1">
                      Prorata appliqué: {(result.prorata * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-green-500/30 border border-emerald-500/50 rounded-lg p-4">
                  <p className="text-xs text-emerald-200 mb-2">💡 À titre informatif</p>
                  <p className="text-sm text-slate-200">
                    Ce montant est une estimation basée sur les informations saisies. Pour une confirmation officielle, consultez votre RH.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-lg transition-all font-light text-sm"
            >
              ↻ Nouvelle simulation
            </button>
          </div>
        </div>
      )}

      {/* Bouton Retour */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-lg transition-all font-light text-sm"
        >
          ← Retour aux calculateurs
        </button>
      )}
    </div>
  )
}
