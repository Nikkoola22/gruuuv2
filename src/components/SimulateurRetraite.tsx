import React, { useState } from 'react';
import { ArrowLeft, Calculator } from 'lucide-react';

interface SimulateurRetraiteProps {
  onClose: () => void;
}

const SimulateurRetraite: React.FC<SimulateurRetraiteProps> = ({ onClose }) => {
  // Configuration data
  const CONFIG = {
    pointValue: 4.92278,
    maxLiquidationRate: 75,
    decoteRate: 1.25,
    surcoteRate: 1.25,
    maxDecoteQuarters: 20,
    cancelDecoteAge: {
      sedentaire: 67,
      active: 62
    },
    socialContributionsRate: 0.091, // 9.10% (CSG 8.3% + CRDS 0.5% + CASA 0.3%)
    requiredQuarters: {
      1960: 167, 1961: 168, 1962: 169, 1963: 170, 1964: 171,
      1965: 172, 1966: 172, 1967: 172
    },
    legalAgeSedentaire: {
      1960: {years: 62, months: 0}, 1961: {years: 62, months: 0},
      1962: {years: 62, months: 6}, 1963: {years: 62, months: 9},
      1964: {years: 63, months: 0}, 1965: {years: 63, months: 3},
      1966: {years: 63, months: 6}, 1967: {years: 63, months: 9}
    },
    legalAgeActive: {
      1968: 57, 1969: 58, 1970: 58, 1971: 58, 1972: 59
    }
  };

  // State
  const [formData, setFormData] = useState({
    birthDate: '',
    category: 'sedentaire',
    quarters: '',
    indice: '',
    isPartTime: false,
    partTimePercent: ''
  });
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getRequiredQuarters = (birthYear: number) => {
    if (birthYear >= 1968) return 172;
    return CONFIG.requiredQuarters[birthYear as keyof typeof CONFIG.requiredQuarters] || 172;
  };

  const getLegalAge = (birthYear: number, category: string) => {
    if (category === 'active') {
      if (birthYear < 1968) return {years: 57, months: 0};
      if (birthYear >= 1973) return {years: 59, months: 0};
      return {years: CONFIG.legalAgeActive[birthYear as keyof typeof CONFIG.legalAgeActive] || 57, months: 0};
    } else {
      if (birthYear >= 1968) return {years: 64, months: 0};
      return CONFIG.legalAgeSedentaire[birthYear as keyof typeof CONFIG.legalAgeSedentaire] || {years: 64, months: 0};
    }
  };

  const calculateRetirement = () => {
    setError('');
    setResults(null);

    const birthDate = new Date(formData.birthDate);
    const quarters = parseInt(formData.quarters);
    const indice = parseInt(formData.indice);
    const category = formData.category;
    const isPartTime = formData.isPartTime;
    const partTimePercent = parseInt(formData.partTimePercent);

    if (!birthDate || isNaN(quarters) || isNaN(indice)) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (indice <= 0) {
      setError('L\'indice majoré doit être supérieur à 0.');
      return;
    }

    if (quarters < 0) {
      setError('Le nombre de trimestres ne peut pas être négatif.');
      return;
    }

    if (isPartTime && (isNaN(partTimePercent) || partTimePercent <= 0 || partTimePercent >= 100)) {
      setError('Le pourcentage de temps partiel doit être entre 1 et 99%.');
      return;
    }

    const birthYear = birthDate.getFullYear();
    const requiredQuarters = getRequiredQuarters(birthYear);
    const legalAge = getLegalAge(birthYear, category);

    const today = new Date();
    const currentAgeYears = today.getFullYear() - birthDate.getFullYear();
    const currentAgeMonths = today.getMonth() - birthDate.getMonth();
    const adjustedCurrentAgeYears = currentAgeMonths < 0 ? currentAgeYears - 1 : currentAgeYears;
    const adjustedCurrentAgeMonths = currentAgeMonths < 0 ? 12 + currentAgeMonths : currentAgeMonths;

    const legalRetirementDate = new Date(birthDate);
    legalRetirementDate.setFullYear(birthDate.getFullYear() + legalAge.years);
    legalRetirementDate.setMonth(birthDate.getMonth() + legalAge.months);

    let quartersUntilLegal = 0;
    if (legalRetirementDate > today) {
      const monthsUntilLegal = (legalRetirementDate.getFullYear() - today.getFullYear()) * 12 + 
                               (legalRetirementDate.getMonth() - today.getMonth());
      quartersUntilLegal = Math.floor(monthsUntilLegal / 3);
    }

    const projectedQuarters = quarters + quartersUntilLegal;

    let grossSalary = indice * CONFIG.pointValue;
    if (isPartTime) {
      grossSalary = grossSalary * (partTimePercent / 100);
    }

    let liquidationRate = CONFIG.maxLiquidationRate;
    let adjustmentType = 'none';
    let adjustmentQuarters = 0;
    let adjustmentRate = 0;
    let decoteCalc1 = 0;
    let decoteCalc2 = 0;

    if (projectedQuarters < requiredQuarters) {
      const cancelAge = CONFIG.cancelDecoteAge[category as keyof typeof CONFIG.cancelDecoteAge];
      const ageCancelDecote = new Date(birthDate);
      ageCancelDecote.setFullYear(birthDate.getFullYear() + cancelAge);
      
      const monthsBetween = (ageCancelDecote.getFullYear() - legalRetirementDate.getFullYear()) * 12 + 
                           (ageCancelDecote.getMonth() - legalRetirementDate.getMonth());
      decoteCalc1 = Math.floor(monthsBetween / 3);
      
      decoteCalc2 = requiredQuarters - projectedQuarters;
      
      adjustmentQuarters = Math.min(decoteCalc1, decoteCalc2, CONFIG.maxDecoteQuarters);
      adjustmentRate = adjustmentQuarters * CONFIG.decoteRate;
      liquidationRate = Math.max(0, liquidationRate - adjustmentRate);
      adjustmentType = 'decote';
    } else if (projectedQuarters > requiredQuarters) {
      adjustmentQuarters = projectedQuarters - requiredQuarters;
      adjustmentRate = adjustmentQuarters * CONFIG.surcoteRate;
      liquidationRate = Math.min(100, liquidationRate + adjustmentRate);
      adjustmentType = 'surcote';
    }

    const pensionRate = (projectedQuarters / requiredQuarters) * (liquidationRate / 100);
    const monthlyPensionGross = grossSalary * pensionRate;
    const annualPensionGross = monthlyPensionGross * 12;
    
    const monthlyPensionNet = monthlyPensionGross * (1 - CONFIG.socialContributionsRate);
    const annualPensionNet = annualPensionGross * (1 - CONFIG.socialContributionsRate);

    setResults({
      currentAge: {years: adjustedCurrentAgeYears, months: adjustedCurrentAgeMonths},
      legalAge,
      grossSalary,
      requiredQuarters,
      quarters,
      projectedQuarters,
      quartersUntilLegal,
      liquidationRate,
      adjustmentType,
      adjustmentQuarters,
      adjustmentRate,
      decoteCalc1,
      decoteCalc2,
      monthlyPensionGross,
      monthlyPensionNet,
      annualPensionGross,
      annualPensionNet,
      indice,
      isPartTime,
      partTimePercent,
      category
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-md py-6 border-b border-slate-700/50 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
              <Calculator className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Simulateur de Retraite</h1>
              <p className="text-slate-400 text-sm">Fonction Publique Territoriale</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/80 hover:bg-red-500 text-white rounded-xl transition-all shadow-lg hover:shadow-red-500/30 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Form */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Informations de l'agent</h2>
          
          <form onSubmit={(e) => { e.preventDefault(); calculateRetirement(); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Date de naissance</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Catégorie</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="sedentaire">Sédentaire</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre de trimestres cotisés <span className="text-slate-400">(à ce jour)</span>
                </label>
                <input
                  type="number"
                  name="quarters"
                  value={formData.quarters}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Indice majoré actuel</label>
                <input
                  type="number"
                  name="indice"
                  value={formData.indice}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  step="1"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPartTime"
                name="isPartTime"
                checked={formData.isPartTime}
                onChange={handleInputChange}
                className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isPartTime" className="text-sm font-medium text-slate-300">Temps partiel</label>
            </div>

            {formData.isPartTime && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Pourcentage du temps partiel (%)
                </label>
                <input
                  type="number"
                  name="partTimePercent"
                  value={formData.partTimePercent}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  max="99"
                  step="1"
                  placeholder="Ex: 80"
                />
              </div>
            )}

            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
              <p className="text-sm text-slate-400">
                💡 <strong>Note :</strong> Valeur du point d'indice au 1er juillet 2023 : 4,92278 €
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30"
            >
              Calculer ma retraite
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-8">
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-6">Résultats de la simulation</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                  <div className="text-sm text-slate-400 mb-1">Âge actuel</div>
                  <div className="text-2xl font-bold text-white">
                    {results.currentAge.years} ans{results.currentAge.months > 0 ? ` ${results.currentAge.months} mois` : ''}
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                  <div className="text-sm text-slate-400 mb-1">Âge légal de départ</div>
                  <div className="text-2xl font-bold text-white">
                    {results.legalAge.years} ans{results.legalAge.months > 0 ? ` ${results.legalAge.months} mois` : ''}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                  <div className="text-sm text-slate-400 mb-1">Traitement indiciaire brut</div>
                  <div className="text-xl font-bold text-white">{results.grossSalary.toFixed(2)} €</div>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                  <div className="text-sm text-slate-400 mb-1">Trimestres requis (taux plein)</div>
                  <div className="text-xl font-bold text-white">{results.requiredQuarters}</div>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                  <div className="text-sm text-slate-400 mb-1">Taux de liquidation</div>
                  <div className="text-xl font-bold text-white">{results.liquidationRate.toFixed(2)} %</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-500/30 mb-8">
                <div className="text-sm text-slate-400 mb-2">💰 Montant de votre pension mensuelle</div>
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Brut</div>
                    <div className="text-3xl font-bold text-white">{results.monthlyPensionGross.toFixed(2)} €</div>
                  </div>
                  <div className="text-2xl text-slate-500">→</div>
                  <div>
                    <div className="text-sm text-indigo-400 mb-1 font-semibold">Net</div>
                    <div className="text-3xl font-bold text-indigo-400">{results.monthlyPensionNet.toFixed(2)} €</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                <div className="text-sm text-slate-400 mb-2">📅 Montant de votre pension annuelle</div>
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Brut</div>
                    <div className="text-2xl font-bold text-white">{results.annualPensionGross.toFixed(2)} €</div>
                  </div>
                  <div className="text-2xl text-slate-500">→</div>
                  <div>
                    <div className="text-sm text-indigo-400 mb-1 font-semibold">Net</div>
                    <div className="text-2xl font-bold text-indigo-400">{results.annualPensionNet.toFixed(2)} €</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4">📝 Détail du calcul</h3>
              <div className="space-y-4 text-sm text-slate-300">
                <div>
                  <strong>Projection des trimestres à l'âge légal :</strong>
                  <p>Trimestres cotisés à ce jour: {results.quarters}</p>
                  <p>Trimestres potentiels jusqu'à l'âge légal: +{results.quartersUntilLegal}</p>
                  <p><strong>Trimestres projetés à l'âge légal: {results.projectedQuarters}</strong></p>
                </div>

                {results.adjustmentType === 'decote' && (
                  <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                    <strong>📉 CALCUL DE LA DÉCOTE (Méthode officielle):</strong>
                    <p>CALCUL 1 - Trimestres entre âge légal et âge d'annulation décote: {results.decoteCalc1} trimestres</p>
                    <p>CALCUL 2 - Trimestres manquants: {results.decoteCalc2} trimestres</p>
                    <p>On retient le MINIMUM: {results.adjustmentQuarters} trimestres</p>
                    <p>Décote appliquée: -{results.adjustmentRate.toFixed(2)}%</p>
                  </div>
                )}

                {results.adjustmentType === 'surcote' && (
                  <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                    <strong>📈 CALCUL DE LA SURCOTE:</strong>
                    <p>Trimestres excédentaires: {results.adjustmentQuarters} trimestres</p>
                    <p>Surcote appliquée: +{results.adjustmentRate.toFixed(2)}%</p>
                  </div>
                )}

                <div>
                  <strong>Calcul de la pension brute :</strong>
                  <p>Traitement brut × (trimestres projetés / trimestres requis) × taux de liquidation</p>
                  <p><strong>= {results.monthlyPensionGross.toFixed(2)} € par mois (brut)</strong></p>
                </div>

                <div>
                  <strong>Calcul de la pension nette :</strong>
                  <p>Pension brute × (1 - 0,091) [Prélèvements sociaux]</p>
                  <p><strong>= {results.monthlyPensionNet.toFixed(2)} € par mois (net)</strong></p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
              <p className="text-yellow-400 text-sm">
                ⚠️ <strong>Avertissement :</strong> Cette simulation est purement indicative et ne constitue pas un engagement.
                Pour une estimation officielle, veuillez contacter la CNRACL ou votre service des ressources humaines.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulateurRetraite;
