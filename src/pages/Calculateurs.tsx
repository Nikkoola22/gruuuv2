import { useState } from 'react'
import { ArrowLeft, TrendingUp, Calculator, DollarSign, Table } from 'lucide-react'
import CalculateurPrimes from '../components/CalculateurPrimes'
import CalculateurCIA from '../components/CalculateurCIA'
import Calculateur13eme from '../components/Calculateur13eme'

interface CalculateursProps {
  onBack?: () => void
}

export default function Calculateurs({ onBack }: CalculateursProps) {
  const [selectedCalculator, setSelectedCalculator] = useState<'primes' | 'cia' | '13eme' | null>(null)

  const handleGrillesClick = () => {
    window.open('/cfdt-metiers.html', '_blank')
  }

  if (selectedCalculator === 'primes') {
    return <CalculateurPrimes onClose={() => setSelectedCalculator(null)} />
  }

  if (selectedCalculator === 'cia') {
    return <CalculateurCIA onClose={() => setSelectedCalculator(null)} />
  }

  if (selectedCalculator === '13eme') {
    return <Calculateur13eme onClose={() => setSelectedCalculator(null)} />
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
            className="px-4 py-2 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Calculateur PRIMES - À VENIR */}
        <button
          disabled
          title="Le calculateur PRIMES sera bientôt disponible"
          className="group relative overflow-hidden bg-gradient-to-br from-cyan-100/70 to-blue-100/70 border-2 border-cyan-200 rounded-3xl p-8 transition-all duration-500 opacity-50 cursor-not-allowed"
        >
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="relative p-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl shadow-xl">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800">PRIMES</h3>
              <p className="text-center text-gray-600 mt-2 font-semibold">À VENIR</p>
            </div>
            <div className="mt-4 px-4 py-2 bg-cyan-500/20 rounded-lg text-cyan-700 text-sm font-semibold">
              Bientôt disponible
            </div>
          </div>
        </button>

        {/* Calculateur CIA - À VENIR */}
        <button
          disabled
          title="Le calculateur CIA sera bientôt disponible"
          className="group relative overflow-hidden bg-gradient-to-br from-purple-100/70 to-pink-100/70 border-2 border-purple-200 rounded-3xl p-8 transition-all duration-500 opacity-50 cursor-not-allowed"
        >
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="relative p-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl shadow-xl">
              <Calculator className="w-12 h-12 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800">Calculateur CIA</h3>
              <p className="text-center text-gray-600 mt-2 font-semibold">À VENIR</p>
            </div>
            <div className="mt-4 px-4 py-2 bg-purple-500/20 rounded-lg text-purple-700 text-sm font-semibold">
              Bientôt disponible
            </div>
          </div>
        </button>

        {/* Calculateur 13ème Mois - À VENIR */}
        <button
          disabled
          title="Le calculateur 13ème Mois sera bientôt disponible"
          className="group relative overflow-hidden bg-gradient-to-br from-green-100/70 to-emerald-100/70 border-2 border-green-200 rounded-3xl p-8 transition-all duration-500 opacity-50 cursor-not-allowed"
        >
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="relative p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-xl">
              <DollarSign className="w-12 h-12 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800">Calculateur 13ème Mois</h3>
              <p className="text-center text-gray-600 mt-2 font-semibold">À VENIR</p>
            </div>
            <div className="mt-4 px-4 py-2 bg-green-500/20 rounded-lg text-green-700 text-sm font-semibold">
              Bientôt disponible
            </div>
          </div>
        </button>

        {/* Grilles Indiciaires - CLICABLE */}
        <button
          onClick={handleGrillesClick}
          className="group relative overflow-hidden bg-gradient-to-br from-orange-100/70 to-red-100/70 border-2 border-orange-200 rounded-3xl p-8 transition-all duration-500 hover:bg-gradient-to-br hover:from-orange-100 hover:to-red-100 hover:border-orange-400 hover:shadow-2xl hover:-translate-y-2"
        >
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="relative p-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-xl group-hover:rotate-3 group-hover:scale-110 transition-transform">
              <Table className="w-12 h-12 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-orange-700">Grilles Indiciaires</h3>
              <p className="text-center text-gray-600 mt-2">
                Vos métiers CFDT<br />
                <span className="text-sm">Accès aux grilles par filière</span>
              </p>
            </div>
            <div className="mt-4 px-4 py-2 bg-orange-500/20 rounded-lg text-orange-700 text-sm font-semibold">
              Cliquez pour ouvrir
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
