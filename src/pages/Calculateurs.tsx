import { useState } from 'react'
import { ArrowLeft, TrendingUp, Calculator, DollarSign, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react'
import CalculateurPrimes from '../components/CalculateurPrimes'
import CalculateurCIA from '../components/CalculateurCIA'
import Calculateur13eme from '../components/Calculateur13eme'
import Metiers from './Metiers'

interface CalculateursProps {
  onBack?: () => void
}

// Tous les calculateurs sont maintenant actifs
const CALCULATORS = [
  {
    id: 'primes' as const,
    title: 'PRIMES',
    subtitle: 'IFSE & RIFSEEP',
    description: 'Calculez vos primes de base et sujétions',
    icon: TrendingUp,
    color: { bg: 'from-cyan-500 to-blue-600', border: 'border-cyan-400/50', text: 'text-cyan-300', glow: 'shadow-cyan-500/30' }
  },
  {
    id: 'cia' as const,
    title: 'CIA',
    subtitle: 'Complément Individuel',
    description: 'Complément Individuel d\'Activité',
    icon: Calculator,
    color: { bg: 'from-purple-500 to-pink-600', border: 'border-purple-400/50', text: 'text-purple-300', glow: 'shadow-purple-500/30' }
  },
  {
    id: '13eme' as const,
    title: '13ème Mois',
    subtitle: 'Prime annuelle',
    description: 'Estimez votre prime de fin d\'année',
    icon: DollarSign,
    color: { bg: 'from-green-500 to-emerald-600', border: 'border-green-400/50', text: 'text-green-300', glow: 'shadow-green-500/30' }
  },
  {
    id: 'metiers' as const,
    title: 'Grilles',
    subtitle: 'Indices & Échelons',
    description: 'Consultez les grilles indiciaires',
    icon: BookOpen,
    color: { bg: 'from-amber-500 to-orange-600', border: 'border-amber-400/50', text: 'text-amber-300', glow: 'shadow-amber-500/30' }
  }
]

export default function Calculateurs({ onBack }: CalculateursProps) {
  const [selectedCalculator, setSelectedCalculator] = useState<'primes' | 'cia' | '13eme' | 'metiers' | null>(null)

  const openCalculator = (calc: 'primes' | 'cia' | '13eme' | 'metiers') => {
    setSelectedCalculator(calc);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (selectedCalculator === 'metiers') {
    return <Metiers onClose={() => setSelectedCalculator(null)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-md py-6 border-b border-slate-700/50 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Calculateurs</h1>
              <p className="text-slate-400 text-sm">Estimez vos primes et consultez les grilles</p>
            </div>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/80 hover:bg-red-500 text-white rounded-xl transition-all shadow-lg hover:shadow-red-500/30 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
          )}
        </div>
      </div>

      {/* Grille des calculateurs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {CALCULATORS.map((calc) => {
            const Icon = calc.icon
            return (
              <button
                key={calc.id}
                onClick={() => openCalculator(calc.id)}
                className={`group relative overflow-hidden rounded-2xl p-1 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl \${calc.color.glow}`}
              >
                {/* Bordure animée */}
                <div className={`absolute inset-0 bg-gradient-to-r \${calc.color.bg} rounded-2xl animate-gradient-x opacity-80`} />
                
                {/* Contenu */}
                <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-[14px] p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 bg-gradient-to-br \${calc.color.bg} rounded-xl shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium \${calc.color.text} bg-slate-700/50 border \${calc.color.border}`}>
                      Actif
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{calc.title}</h3>
                    <p className={`text-sm font-medium \${calc.color.text} mb-2`}>{calc.subtitle}</p>
                    <p className="text-slate-400 text-sm">{calc.description}</p>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 text-slate-400 group-hover:text-white transition-colors">
                    <span className="text-sm font-medium">Ouvrir</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        
        {/* Info footer */}
        <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-sm text-slate-400">
            Tous les calculateurs sont basés sur les données officielles de la mairie de Gennevilliers.
          </p>
        </div>
      </div>
      
      {/* Animation CSS */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  )
}
