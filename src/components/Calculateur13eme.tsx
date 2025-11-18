import { useState, useMemo } from 'react'
import { ArrowLeft, DollarSign, Calculator } from 'lucide-react'

interface Calculateur13emeProps {
  onClose?: () => void
}

type AgentType = 'indiciaire' | 'horaire'
type IndiciaireProfile = 'permanent' | 'medecin' | 'assistante'
type HoraireBase = 'indice' | 'taux'
type HorairePeriode = 'juin' | 'novembre'

const INDICIAIRE_SCHEDULE: Record<IndiciaireProfile, { month: string; part: number; note?: string }[]> = {
  permanent: [
    { month: 'Juin', part: 6, note: 'Versement principal (6/12)' },
    { month: 'Novembre', part: 5, note: 'Complément (5/12)' },
    { month: 'Décembre', part: 1, note: 'Solde (1/12)' },
  ],
  medecin: [
    { month: 'Juin', part: 6, note: 'Versement principal (6/12)' },
    { month: 'Novembre', part: 6, note: 'Versement complémentaire (6/12)' },
  ],
  assistante: [
    { month: 'Juin', part: 6, note: 'Calendrier spécifique assistantes' },
    { month: 'Novembre', part: 6 },
  ],
}

const HOURS_CAP = 910
const HOURS_MIN = 455
const SMIC_MENSUEL = 1801.8
const DEFAULT_SMIC_REFERENCE = SMIC_MENSUEL
const INDICE_POINT_VALUE = 4.92278
const IR_RATE = 0.03
const HOURS_REFERENCE_TEXT = '910 h = équivalent 6 mois temps complet'

const formatEUR = (value: number) =>
  value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  })

const sanitizeNumber = (value: string | number) => {
  if (typeof value === 'number') return value
  if (!value) return 0
  return Number(value.replace(',', '.')) || 0
}

const indiceToEuro = (indice: string) => sanitizeNumber(indice) * INDICE_POINT_VALUE

export default function Calculateur13eme({ onClose }: Calculateur13emeProps) {
  const [agentType, setAgentType] = useState<AgentType>('')
  const [indiciaireProfile, setIndiciaireProfile] = useState<IndiciaireProfile>('')
  const [im, setIm] = useState('')
  const [nbi, setNbi] = useState('')
  const [tempsEmploi, setTempsEmploi] = useState(100)
  const [monthsWorked, setMonthsWorked] = useState(12)
  const [anciennete, setAnciennete] = useState(12)
  const [smicReference, setSmicReference] = useState(DEFAULT_SMIC_REFERENCE)
  const [rubrique7587, setRubrique7587] = useState('')

  const [horaireBaseType, setHoraireBaseType] = useState<HoraireBase>('')
  const [horaireIM, setHoraireIM] = useState('')
  const [horaireTaux, setHoraireTaux] = useState('')
  const [horaireConges, setHoraireConges] = useState(10)
  const [horaireHours, setHoraireHours] = useState(HOURS_MIN)
  const [horairePeriode, setHorairePeriode] = useState<HorairePeriode>('juin')
  const [horaireAnciennete, setHoraireAnciennete] = useState(6)

  const [result, setResult] = useState<any>(null)
  const [showAdvancedParams, setShowAdvancedParams] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)

  const indiciaireTI = indiceToEuro(im)
  const indiciaireNBIValue = indiceToEuro(nbi)
  const indiciaireIRValue = (indiciaireTI + indiciaireNBIValue) * IR_RATE
  const horaireTI = indiceToEuro(horaireIM)
  const horaireIRValue = (horaireTI + 0) * IR_RATE

  const indiciaireEligibility = useMemo(() => {
    const reasons = [] as string[]
    if (monthsWorked < 3) reasons.push('Ancienneté insuffisante (< 3 mois)')
    if (tempsEmploi < 50) reasons.push('Temps de travail < 50%')
    if (indiciaireProfile === 'assistante' && !rubrique7587) reasons.push('La rubrique 7587 est requise')
    const base = indiciaireProfile === 'assistante'
      ? sanitizeNumber(rubrique7587)
      : indiciaireTI + indiciaireNBIValue
    if (base <= 0) reasons.push('Saisir un indice majoré et/ou une NBI pour lancer le calcul')
    return {
      eligible: reasons.length === 0,
      reasons,
    }
  }, [monthsWorked, tempsEmploi, indiciaireProfile, indiciaireTI, indiciaireNBIValue, rubrique7587])

  const horaireEligibility = useMemo(() => {
    const reasons = [] as string[]
    if (horaireAnciennete < 3) reasons.push('Ancienneté insuffisante (< 3 mois)')
    if (horaireHours < HOURS_MIN) reasons.push(`Nombre d'heures insuffisant (< ${HOURS_MIN}h) sur la période de référence`)
    if (horaireBaseType === 'indice' && horaireTI <= 0) {
      reasons.push('Saisir un indice majoré pour un calcul indiciaire')
    }
    if (horaireBaseType === 'taux' && sanitizeNumber(horaireTaux) === 0) {
      reasons.push('Saisir le taux horaire pour le calcul au taux')
    }
    return {
      eligible: reasons.length === 0,
      reasons,
    }
  }, [horaireAnciennete, horaireHours, horaireBaseType, horaireTI, horaireTaux])

  const handleReset = () => {
    setIndiciaireProfile('permanent')
    setIm('')
    setNbi('')
    setTempsEmploi(100)
    setMonthsWorked(12)
    setAnciennete(12)
    setSmicReference(DEFAULT_SMIC_REFERENCE)
    setRubrique7587('')
    setAgentType('')
    setIndiciaireProfile('')
    setHoraireBaseType('')
    setHoraireIM('')
    setHoraireTaux('')
    setHoraireConges(10)
    setHoraireHours(HOURS_MIN)
    setHorairePeriode('juin')
    setHoraireAnciennete(6)
    setResult(null)
    setWizardStep(1)
  }

  const handleSelectAgentType = (type: AgentType) => {
    setAgentType(type)
    setResult(null)
    setWizardStep(prev => {
      if (agentType !== type) return 2
      return Math.max(prev, 2)
    })
  }

  const handleSelectIndiciaireProfile = (profile: IndiciaireProfile) => {
    setIndiciaireProfile(profile)
    setResult(null)
    setWizardStep(prev => Math.max(prev, 3))
  }

  const handleSelectHoraireBaseType = (base: HoraireBase) => {
    setHoraireBaseType(base)
    setResult(null)
    setWizardStep(prev => Math.max(prev, 3))
  }

  const computeIndiciaire = () => {
    const { eligible, reasons } = indiciaireEligibility
    if (!eligible) {
      setResult({ eligible: false, reasons })
      return
    }

    const tiValue = indiciaireTI
    const nbiValue = indiciaireNBIValue
    const irValue = indiciaireIRValue
    const baseRub = sanitizeNumber(rubrique7587)

    const remunerationBase = indiciaireProfile === 'assistante'
      ? (baseRub / 2)
      : (tiValue + nbiValue + irValue)

    const tempsRatio = Math.max(0, Math.min(1, tempsEmploi / 100))
    const prorataAnnee = Math.max(0, Math.min(1, monthsWorked / 12))
    const ancienneteRatio = Math.max(0, Math.min(1, anciennete / 12))
    const prorataGlobal = tempsRatio * prorataAnnee * ancienneteRatio

    const fixedPart = prorataGlobal * (smicReference / 2)
    const smicVerse = prorataGlobal * smicReference
    const remunerationProratisee = prorataGlobal * remunerationBase
    const variableBase = remunerationProratisee - smicVerse
    const variablePart = variableBase > 0 ? variableBase : 0
    const total = fixedPart + variablePart

    const schedule = INDICIAIRE_SCHEDULE[indiciaireProfile]
    const parts = schedule.reduce((sum, item) => sum + item.part, 0)
    const breakdown = schedule.map(item => ({
      month: item.month,
      ratio: item.part / parts,
      note: item.note,
      amount: (total * (item.part / parts)),
    }))

    setResult({
      eligible: true,
      family: 'indiciaire',
      total,
      compRem: fixedPart,
      primeSem: variablePart,
      breakdown,
      context: {
        baseMensuelle: remunerationBase,
        tempsRatio,
        prorataAnnee,
        ancienneteRatio,
        prorataGlobal,
        tiValue,
        nbiValue,
        irValue,
        fixedPart,
        variablePart,
        smicVerse,
        remunerationProratisee,
        variableBase,
      },
    })
  }

  const computeHoraire = () => {
    const { eligible, reasons } = horaireEligibility
    if (!eligible) {
      setResult({ eligible: false, reasons })
      return
    }

    const heuresRetenues = Math.min(horaireHours, HOURS_CAP)
    const ratioHeures = heuresRetenues / HOURS_CAP
    const tiHoraire = horaireTI
    const autoIRHoraire = horaireIRValue
    const tauxHoraire = sanitizeNumber(horaireTaux)

    let baseReference = 0
    let total = 0
    let compRem = 0
    let primeSem = 0
    let baseSixMois = 0
    let basePS = 0
    const crBase = smicReference / 2
    const crHoraireUnit = crBase / HOURS_CAP

    if (horaireBaseType === 'indice') {
      baseReference = tiHoraire + autoIRHoraire
      baseSixMois = baseReference / 2
      basePS = Math.max(baseSixMois - crBase, 0)
      compRem = ratioHeures * crBase
      primeSem = ratioHeures * basePS
      total = compRem + primeSem
    } else {
      const tauxMajore = tauxHoraire * (1 + horaireConges / 100)
      baseReference = tauxMajore
      const mensualise = tauxMajore * 151.67
      baseSixMois = mensualise / 2
      basePS = Math.max(baseSixMois - crBase, 0)
      compRem = ratioHeures * crBase
      primeSem = ratioHeures * basePS
      total = compRem + primeSem
    }

    setResult({
      eligible: true,
      family: 'horaire',
      total,
      compRem,
      primeSem,
      breakdown: [
        {
          month: horairePeriode === 'juin' ? 'Versement de Juin (Réf. Nov → Avril)' : 'Versement de Novembre (Réf. Mai → Octobre)',
          ratio: ratioHeures,
          amount: total,
          note: `${horaireHours} h déclarées sur la période / ${HOURS_CAP} h max`,
        },
      ],
      context: {
        ratioHeures,
        baseReference,
        heuresRetenues,
        tiHoraire,
        autoIRHoraire,
        baseType: horaireBaseType,
        baseSixMois,
        basePS,
        crBase,
        crHoraireUnit: horaireBaseType === 'indice' ? crHoraireUnit : undefined,
        tauxHoraireMajore: horaireBaseType === 'taux' ? tauxHoraire * (1 + horaireConges / 100) : undefined,
      },
    })
  }

  const handleCompute = () => {
    if (agentType === 'indiciaire') {
      computeIndiciaire()
    } else {
      computeHoraire()
    }
  }

  const eligibility = agentType === 'indiciaire' ? indiciaireEligibility : horaireEligibility

  return (
    <div className="flex flex-col h-full">
      {/* Header avec bouton retour */}
      <div className="bg-gradient-to-b from-green-800/50 via-emerald-800/50 to-teal-800/50 py-6 text-left border-b border-green-700 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-4 bg-white/20 rounded-full">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white">Calculateur 13ème Mois</h3>
              <p className="text-green-100 text-sm">Simulation du 13ème mois - Calcul pas à pas</p>
            </div>
          </div>
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
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto p-6 max-w-md mx-auto w-full">
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="text-center">
            <h4 className="text-base font-semibold text-white mb-3">Étape 1 - Mode de rémunération</h4>
            <label className="text-sm uppercase tracking-wide text-slate-300">Quel est votre mode ?</label>
            <select
              value={agentType}
              onChange={(e) => handleSelectAgentType(e.target.value as AgentType)}
              className="w-full mt-3 px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white text-center"
            >
              <option value="">Choisir...</option>
              <option value="indiciaire">Indiciaires</option>
              <option value="horaire">Horaires</option>
            </select>
          </div>
        </div>

        {agentType && (
          <div className="grid grid-cols-1 gap-6">
            <div className="text-center">
              <h4 className="text-base font-semibold text-white mb-3">Étape 2 - {agentType === 'indiciaire' ? 'Profil' : 'Mode horaire'}</h4>
              <label className="text-sm uppercase tracking-wide text-slate-300">
                {agentType === 'indiciaire' ? 'Quel est votre profil ?' : 'Choisissez votre mode'}
              </label>
              <select
                value={agentType === 'indiciaire' ? indiciaireProfile : horaireBaseType}
                onChange={(e) => agentType === 'indiciaire' 
                  ? handleSelectIndiciaireProfile(e.target.value as IndiciaireProfile)
                  : handleSelectHoraireBaseType(e.target.value as HoraireBase)}
                className="w-full mt-3 px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white text-center"
              >
                <option value="">Choisir...</option>
                {agentType === 'indiciaire' ? (
                  <>
                    <option value="permanent">Agent permanent</option>
                    <option value="medecin">Médecin</option>
                    <option value="assistante">Assistante maternelle</option>
                  </>
                ) : (
                  <>
                    <option value="indice">Base IM + IR</option>
                    <option value="taux">Base taux horaire</option>
                  </>
                )}
              </select>
            </div>
          </div>
        )}

        {wizardStep >= 3 && (
          agentType === 'indiciaire' ? (
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-200">Étape 3</p>
                  <p className="text-sm text-slate-200">Saisissez vos données indiciaires</p>
                </div>
                <p className="text-xs text-slate-400">Profil : <span className="text-white font-semibold capitalize">{indiciaireProfile}</span></p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {indiciaireProfile !== 'assistante' ? (
                  <>
                    <div>
                      <label className="text-xs uppercase tracking-wide text-slate-400">Indice Majoré (IM)</label>
                      <input
                        value={im}
                        onChange={(e) => setIm(e.target.value)}
                        inputMode="decimal"
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white"
                        placeholder="ex : 366"
                      />
                      <p className="text-xs text-slate-400 mt-1">Conversion automatique : indice × 4,92278.</p>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wide text-slate-400">Nouvelle Bonification Indiciaire (NBI)</label>
                      <input
                        value={nbi}
                        onChange={(e) => setNbi(e.target.value)}
                        inputMode="decimal"
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white"
                        placeholder="ex : 10"
                      />
                      <p className="text-xs text-slate-400 mt-1">Saisir l'indice NBI (conversion × 4,92278 utilisée dans le calcul).</p>
                    </div>
                    <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-slate-200">
                      <p className="font-semibold text-white">Traitement indiciaire (TI) converti : <span className="text-emerald-300">{formatEUR(indiciaireTI)}</span></p>
                      <p className="mt-1">Indemnité de résidence (3% du TI) : <span className="text-emerald-300">{formatEUR(indiciaireIRValue)}</span></p>
                      <p className="text-slate-400 mt-1">Le calcul applique automatiquement 3% du TI conformément à la procédure.</p>
                    </div>
                  </>
                ) : (
                  <div className="md:col-span-2">
                    <label className="text-xs uppercase tracking-wide text-slate-400">Montant rubrique 7587 en paie</label>
                    <input
                      value={rubrique7587}
                      onChange={(e) => setRubrique7587(e.target.value)}
                      inputMode="decimal"
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white"
                      placeholder="Montant brut rubrique 7587"
                    />
                    <p className="text-xs text-slate-400 mt-1">Le 13ème mois = rubrique 7587 / 2 (proratisé)</p>
                  </div>
                )}

              <div>
                <label className="text-xs uppercase tracking-wide text-slate-400">Temps de travail (%)</label>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={tempsEmploi}
                  onChange={(e) => setTempsEmploi(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-slate-200 font-semibold">{tempsEmploi}%</p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-slate-400">Mois travaillés sur l'année</label>
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={monthsWorked}
                  onChange={(e) => setMonthsWorked(Math.max(0, Math.min(12, Number(e.target.value) || 0)))}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white"
                />
                <p className="text-xs text-slate-400 mt-1">{monthsWorked}/12 mois</p>
              </div>
            </div>
          </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-cyan-200">Étape 3</p>
                  <p className="text-sm text-slate-200">Renseignez vos heures et montants</p>
                </div>
                <p className="text-xs text-slate-400">Mode retenu : <span className="text-white font-semibold">{horaireBaseType === 'indice' ? 'Indice + IR' : 'Taux horaire'}</span></p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-xs text-slate-200 space-y-2">
                <p className="text-sm font-semibold text-white">Cas gérés pour les agents horaires</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Rémunération sur IM : montant = (IM + IR) converti en euros × (heures retenues / 910 h).</li>
                  <li>Rémunération au taux SMIC : taux horaire majoré congés → mensualisé (× 151,67) → base 6 mois (÷ 2).</li>
                </ul>
                <p>Pour le taux SMIC : part CR = SMIC/2 (ex : 900,9 €) proratisée, part PS = (base 6 mois - SMIC/2) proratisée.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-400">Période de versement</label>
                  <select
                    value={horairePeriode}
                    onChange={(e) => setHorairePeriode(e.target.value as HorairePeriode)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white"
                  >
                    <option value="juin">Juin (heures Nov → Avril)</option>
                    <option value="novembre">Novembre (heures Mai → Octobre)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-400">Ancienneté sur la période (mois)</label>
                  <input
                    type="number"
                    min={0}
                    max={6}
                    value={horaireAnciennete}
                    onChange={(e) => setHoraireAnciennete(Math.max(0, Math.min(6, Number(e.target.value) || 0)))}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs uppercase tracking-wide text-slate-400">Heures rémunérées dans la période (min {HOURS_MIN}h)</label>
                  <input
                    type="number"
                    min={0}
                    value={horaireHours}
                    onChange={(e) => setHoraireHours(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white"
                  />
                  <p className="text-xs text-slate-400 mt-1">{HOURS_REFERENCE_TEXT}</p>
                </div>

                {horaireBaseType === 'indice' ? (
                  <>
                    <div>
                      <label className="text-xs uppercase tracking-wide text-slate-400">Indice majoré (IM)</label>
                      <input
                        value={horaireIM}
                        onChange={(e) => setHoraireIM(e.target.value)}
                        inputMode="decimal"
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white"
                      />
                      <p className="text-xs text-slate-400 mt-1">Indice converti en euros via 4,92278 pour le calcul.</p>
                    </div>
                    <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-slate-200">
                      <p className="font-semibold text-white">TI converti à partir de l'indice : <span className="text-emerald-300">{formatEUR(horaireTI)}</span></p>
                      <p className="mt-1">IR appliquée automatiquement (3% du TI) : <span className="text-emerald-300">{formatEUR(horaireIRValue)}</span></p>
                      <p className="text-slate-400 mt-1">Les montants IM et IR sont déduits de l'indice saisi conformément à la procédure.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs uppercase tracking-wide text-slate-400">Taux horaire brut (€)</label>
                      <input
                        value={horaireTaux}
                        onChange={(e) => setHoraireTaux(e.target.value)}
                        inputMode="decimal"
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        )}

        {wizardStep >= 3 && (
          <>
            <div className="bg-gradient-to-br from-green-900/40 via-emerald-900/40 to-teal-900/40 border border-emerald-600/40 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-200 uppercase tracking-wide">Étape finale</p>
                  <h4 className="text-xl font-semibold text-white">Calcul du 13ème mois</h4>
                </div>
                <Calculator className="w-10 h-10 text-emerald-300" />
              </div>

              {eligibility.reasons.length > 0 && (
                <div className="bg-amber-900/30 border border-amber-500/30 rounded-lg p-4 text-sm text-amber-100">
                  <p className="font-semibold mb-2">Conditions à respecter :</p>
                  <ul className="space-y-1 text-xs">
                    {eligibility.reasons.map(reason => (
                      <li key={reason}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleCompute}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${eligibility.eligible ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-600/50 text-slate-300 cursor-not-allowed'}`}
                disabled={!eligibility.eligible}
              >
                {eligibility.eligible ? '🧮 Lancer le calcul conforme à la procédure' : 'Complétez les conditions pour calculer'}
              </button>

              {result && (
                <div className="space-y-4">
                  {!result.eligible && (
                    <div className="bg-rose-900/40 border border-rose-500/40 rounded-xl p-4 text-sm text-rose-100">
                      <p className="font-semibold">Situations bloquantes</p>
                      <ul className="mt-2 space-y-1">
                        {result.reasons?.map((reason: string) => (
                          <li key={reason}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.eligible && (
                    <div className="space-y-4">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-xs uppercase tracking-wide text-green-200">Total estimé du 13ème mois</p>
                        <p className="text-4xl font-bold text-white mt-2">{formatEUR(result.total)}</p>
                        <div className="grid grid-cols-2 gap-3 mt-4 text-sm text-slate-200">
                          <div>
                            <p className="text-xs text-slate-400">Complément de rémunération (CR)</p>
                            <p className="font-semibold text-green-200">{formatEUR(result.compRem)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Prime semestrielle (PS)</p>
                            <p className="font-semibold text-green-200">{formatEUR(result.primeSem)}</p>
                          </div>
                        </div>
                        {agentType === 'indiciaire' ? (
                          <p className="text-xs text-slate-400 mt-3">
                            Part fixe = (SMIC brut ÷ 2) proratisé ; Part variable = dépassement du total IM + NBI + IR sur le SMIC versé, proratisé.
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 mt-3">
                            Pour les agents horaires, l'intégralité du montant est basée sur IM+IR ou sur le taux horaire majoré congés et proratisée selon les heures rémunérées.
                          </p>
                        )}
                      </div>

                      <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-3">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Ventilation par échéance</p>
                        <div className="space-y-2">
                          {result.breakdown?.map((item: any) => (
                            <div key={item.month} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                              <div>
                                <p className="text-sm text-white font-semibold">{item.month}</p>
                                <p className="text-xs text-slate-300">{(item.ratio * 100).toFixed(1)}% • {item.note || 'Part réglementaire'}</p>
                              </div>
                              <p className="text-lg font-bold text-emerald-300">{formatEUR(item.amount)}</p>
                            </div>
                          ))}
                        </div>
                        {result.context && (
                          <div className="text-xs text-slate-400 border-t border-slate-700 pt-3">
                            {agentType === 'indiciaire' ? (
                              <p>
                                Prorata année : {(result.context.prorataAnnee * 100).toFixed(0)}% • Temps de travail : {(result.context.tempsRatio * 100).toFixed(0)}%
                                {typeof result.context.tiValue === 'number' && (
                                  <>
                                    {' '}• TI converti : {formatEUR(result.context.tiValue)} • NBI convertie : {formatEUR(result.context.nbiValue || 0)} • IR 3% : {formatEUR(result.context.irValue || 0)}
                                  </>
                                )}
                              </p>
                            ) : (
                              <p>
                                Heures retenues : {(result.context.ratioHeures * 100).toFixed(0)}% de la référence ({HOURS_CAP}h)
                                {result.context.baseType === 'indice' && (
                                  <>
                                    {' '}• Base IM + IR : {formatEUR(result.context.baseReference || 0)}
                                    {' '}• Base 6 mois : {formatEUR(result.context.baseSixMois || 0)}
                                    {' '}• CR horaire : {formatEUR(result.context.crHoraireUnit || 0)} /h
                                    {' '}• Base PS : {formatEUR(result.context.basePS || 0)}
                                  </>
                                )}
                                {result.context.baseType === 'taux' && (
                                  <>
                                    {' '}• Base taux horaire + congés : {formatEUR(result.context.baseReference || 0)} /h
                                  </>
                                )}
                              </p>
                            )}
                            {agentType === 'indiciaire' && typeof result.context.fixedPart === 'number' && (
                              <p className="mt-1">
                                Part fixe (SMIC/2 proratisé) : {formatEUR(result.context.fixedPart)} • Part variable : {formatEUR(result.context.variablePart || 0)} • SMIC versé : {formatEUR(result.context.smicVerse || 0)} • IM+NBI+IR proratisés : {formatEUR(result.context.remunerationProratisee || 0)}
                              </p>
                            )}
                            {agentType === 'horaire' && (
                              <div className="mt-1 space-y-1">
                                {result.context.baseType === 'indice' ? (
                                  <p>
                                    Cas calculé : IM + IR • Montant converti : {formatEUR(result.context.baseReference || 0)} • Heures retenues : {result.context.heuresRetenues}
                                  </p>
                                ) : (
                                  <>
                                    <p>
                                      Cas calculé : Taux horaire + congés • Taux majoré : {formatEUR(result.context.tauxHoraireMajore || 0)} /h • Heures retenues : {result.context.heuresRetenues}
                                    </p>
                                    <p>
                                      Base 6 mois : {formatEUR(result.context.baseSixMois || 0)} • Base CR (SMIC/2) : {formatEUR(result.context.crBase || 0)} • Base PS : {formatEUR(result.context.basePS || 0)}
                                    </p>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="bg-gradient-to-r from-emerald-600/30 via-teal-600/30 to-green-600/30 border border-emerald-500/40 rounded-xl p-4 text-sm text-white">
                        <p className="font-semibold">⚠️ À communiquer à votre gestionnaire RH</p>
                        <p className="text-xs mt-2 text-emerald-50">
                          Ce simulateur reprend la procédure « Gestion du 13ème mois – indiciaires & horaires » (MAJ 01/06/2025). Pour validation officielle, merci de transmettre les éléments justificatifs (tableau heures, rubrique 7587, etc.).
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleReset}
                    className="w-full px-4 py-2 rounded-lg border border-slate-600 text-slate-200 text-sm hover:bg-slate-800"
                  >
                    ↻ Nouvelle simulation
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
