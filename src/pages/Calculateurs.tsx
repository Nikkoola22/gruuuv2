import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, Calculator, DollarSign, BookOpen } from 'lucide-react'
import CalculateurPrimes from '../components/CalculateurPrimes'
import CalculateurCIA from '../components/CalculateurCIA'
import Calculateur13eme from '../components/Calculateur13eme'
import Metiers from './Metiers'

interface CalculateursProps {
  onBack?: () => void
}

interface CalculatorStatus {
  primes: boolean;
  cia: boolean;
  treizeme: boolean;
  grilles: boolean;
}

export default function Calculateurs({ onBack }: CalculateursProps) {
  const [selectedCalculator, setSelectedCalculator] = useState<'primes' | 'cia' | '13eme' | 'metiers' | null>(null)
  const [calculatorsStatus, setCalculatorsStatus] = useState<CalculatorStatus>(() => {
    const saved = localStorage.getItem('calculators-status');
    return saved ? JSON.parse(saved) : { primes: true, cia: true, treizeme: true, grilles: true };
  })

  useEffect(() => {
    const handleCalculatorsStatusChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      setCalculatorsStatus(customEvent.detail);
    };
    window.addEventListener('calculators-status-changed', handleCalculatorsStatusChanged);
    return () => window.removeEventListener('calculators-status-changed', handleCalculatorsStatusChanged);
  }, []);

  if (selectedCalculator === 'primes') {
    return <CalculateurPrimes onClose={() => setSelectedCalculator(null)} />
  }

  if (selectedCalculator === 'cia') {
    return <CalculateurCIA onClose={() => setSelectedCalculator(null)} />
  }

  if (selectedCalculator === '13eme') {
    return <Calculateur13eme onClose={() => setSelectedCalculator(null)} />
  }

  if (selectedCalculator === 'metiers') {
    return <Metiers onClose={() => setSelectedCalculator(null)} />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold">Calculateurs</h1>
          <p className="text-sm text-gray-600">Choisissez un calculateur ou consultez les grilles</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Calculateur PRIMES */}
        <button
          onClick={() => setSelectedCalculator('primes')}
          disabled={!calculatorsStatus.primes}
          className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 ${
            calculatorsStatus.primes
              ? 'bg-gradient-to-br from-cyan-100/70 to-blue-100/70 border-2 border-cyan-200 hover:bg-gradient-to-br hover:from-cyan-100 hover:to-blue-100 hover:border-cyan-400 hover:shadow-2xl hover:-translate-y-2 cursor-pointer'
              : 'bg-gradient-to-br from-slate-200/70 to-slate-300/70 border-2 border-slate-300 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className={`relative p-6 rounded-3xl shadow-xl ${calculatorsStatus.primes ? 'bg-gradient-to-br from-cyan-500 to-blue-600 group-hover:rotate-3 group-hover:scale-110 transition-transform' : 'bg-gradient-to-br from-slate-500 to-slate-600'}`}>
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
            <div className="text-center">
              <h3 className={`text-2xl font-bold ${calculatorsStatus.primes ? 'text-gray-800 group-hover:text-cyan-700' : 'text-gray-600'}`}>PRIMES</h3>
              <p className={`text-center mt-2 ${calculatorsStatus.primes ? 'text-gray-600' : 'text-gray-500'}`}>Prime de base et sujétion<br /><span className="text-sm">{calculatorsStatus.primes ? 'Calculer vos primes' : 'Actuellement indisponible'}</span></p>
            </div>
            <div className={`mt-4 px-4 py-2 rounded-lg text-sm font-semibold ${calculatorsStatus.primes ? 'bg-cyan-500/20 text-cyan-700' : 'bg-slate-400/20 text-slate-600'}`}>
              {calculatorsStatus.primes ? 'Cliquez pour ouvrir' : 'Désactivé'}
            </div>
          </div>
        </button>

        {/* Calculateur CIA */}
        <button
          onClick={() => setSelectedCalculator('cia')}
          disabled={!calculatorsStatus.cia}
          className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 ${
            calculatorsStatus.cia
              ? 'bg-gradient-to-br from-purple-100/70 to-pink-100/70 border-2 border-purple-200 hover:bg-gradient-to-br hover:from-purple-100 hover:to-pink-100 hover:border-purple-400 hover:shadow-2xl hover:-translate-y-2 cursor-pointer'
              : 'bg-gradient-to-br from-slate-200/70 to-slate-300/70 border-2 border-slate-300 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className={`relative p-6 rounded-3xl shadow-xl ${calculatorsStatus.cia ? 'bg-gradient-to-br from-purple-500 to-pink-600 group-hover:rotate-3 group-hover:scale-110 transition-transform' : 'bg-gradient-to-br from-slate-500 to-slate-600'}`}>
              <Calculator className="w-12 h-12 text-white" />
            </div>
            <div className="text-center">
              <h3 className={`text-2xl font-bold ${calculatorsStatus.cia ? 'text-gray-800 group-hover:text-purple-700' : 'text-gray-600'}`}>Calculateur CIA</h3>
              <p className={`text-center mt-2 ${calculatorsStatus.cia ? 'text-gray-600' : 'text-gray-500'}`}>Complément individuel d'activité<br /><span className="text-sm">{calculatorsStatus.cia ? 'Calculer votre CIA' : 'Actuellement indisponible'}</span></p>
            </div>
            <div className={`mt-4 px-4 py-2 rounded-lg text-sm font-semibold ${calculatorsStatus.cia ? 'bg-purple-500/20 text-purple-700' : 'bg-slate-400/20 text-slate-600'}`}>
              {calculatorsStatus.cia ? 'Cliquez pour ouvrir' : 'Désactivé'}
            </div>
          </div>
        </button>

        {/* Calculateur 13ème Mois */}
        <button
          onClick={() => setSelectedCalculator('13eme')}
          disabled={!calculatorsStatus.treizeme}
          className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 ${
            calculatorsStatus.treizeme
              ? 'bg-gradient-to-br from-green-100/70 to-emerald-100/70 border-2 border-green-200 hover:bg-gradient-to-br hover:from-green-100 hover:to-emerald-100 hover:border-green-400 hover:shadow-2xl hover:-translate-y-2 cursor-pointer'
              : 'bg-gradient-to-br from-slate-200/70 to-slate-300/70 border-2 border-slate-300 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className={`relative p-6 rounded-3xl shadow-xl ${calculatorsStatus.treizeme ? 'bg-gradient-to-br from-green-500 to-emerald-600 group-hover:rotate-3 group-hover:scale-110 transition-transform' : 'bg-gradient-to-br from-slate-500 to-slate-600'}`}>
              <DollarSign className="w-12 h-12 text-white" />
            </div>
            <div className="text-center">
              <h3 className={`text-2xl font-bold ${calculatorsStatus.treizeme ? 'text-gray-800 group-hover:text-green-700' : 'text-gray-600'}`}>13ème Mois</h3>
              <p className={`text-center mt-2 ${calculatorsStatus.treizeme ? 'text-gray-600' : 'text-gray-500'}`}>Prime de 13ème mois<br /><span className="text-sm">{calculatorsStatus.treizeme ? 'Calculer votre 13ème mois' : 'Actuellement indisponible'}</span></p>
            </div>
            <div className={`mt-4 px-4 py-2 rounded-lg text-sm font-semibold ${calculatorsStatus.treizeme ? 'bg-green-500/20 text-green-700' : 'bg-slate-400/20 text-slate-600'}`}>
              {calculatorsStatus.treizeme ? 'Cliquez pour ouvrir' : 'Désactivé'}
            </div>
          </div>
        </button>

        {/* Grilles Indiciaires */}
        <button
          onClick={() => setSelectedCalculator('metiers')}
          disabled={!calculatorsStatus.grilles}
          className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 ${
            calculatorsStatus.grilles
              ? 'bg-gradient-to-br from-amber-100/70 to-orange-100/70 border-2 border-amber-200 hover:bg-gradient-to-br hover:from-amber-100 hover:to-orange-100 hover:border-amber-400 hover:shadow-2xl hover:-translate-y-2 cursor-pointer'
              : 'bg-gradient-to-br from-slate-200/70 to-slate-300/70 border-2 border-slate-300 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className={`relative p-6 rounded-3xl shadow-xl ${calculatorsStatus.grilles ? 'bg-gradient-to-br from-amber-500 to-orange-600 group-hover:rotate-3 group-hover:scale-110 transition-transform' : 'bg-gradient-to-br from-slate-500 to-slate-600'}`}>
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${calculatorsStatus.grilles ? 'text-gray-800 group-hover:text-amber-700' : 'text-gray-600'}`}>Grilles Indiciaires</h3>
              <p className={`text-center mt-2 ${calculatorsStatus.grilles ? 'text-gray-600' : 'text-gray-500'}`}>Filières et métiers<br /><span className="text-sm">{calculatorsStatus.grilles ? 'Consulter les grilles' : 'Actuellement indisponible'}</span></p>
            </div>
            <div className={`mt-4 px-4 py-2 rounded-lg text-sm font-semibold ${calculatorsStatus.grilles ? 'bg-amber-500/20 text-amber-700' : 'bg-slate-400/20 text-slate-600'}`}>
              {calculatorsStatus.grilles ? 'Cliquez pour ouvrir' : 'Désactivé'}
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
