import React from "react";
import { ArrowLeft } from "lucide-react";
import NewsList from "./components/NewsList";

interface PublicPageProps {
  onBack?: () => void;
}

const PublicPage: React.FC<PublicPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour au menu</span>
              </button>
            )}
            <div className="flex items-center justify-center gap-4 flex-1">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 via-orange-500 to-red-400 rounded-full blur-2xl opacity-80 animate-pulse"></div>
                <div className="relative bg-white rounded-full w-16 h-16 shadow-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="./logo-cfdt.jpg"
                    alt="Logo CFDT"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                  CFDT Gennevilliers
                </h1>
                <p className="text-gray-600 mt-1">Actualités et informations</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <NewsList />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-4">
            <h4 className="text-xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Contact CFDT
            </h4>
            <div className="space-y-2 text-gray-300">
              <p>📞 01 40 85 64 64</p>
              <p>📧 cfdt-interco@ville-gennevilliers.fr</p>
              <p>📍 Mairie de Gennevilliers</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-4">
            <p className="text-gray-400">
              © 2025 CFDT Gennevilliers - Informations syndicales
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;
