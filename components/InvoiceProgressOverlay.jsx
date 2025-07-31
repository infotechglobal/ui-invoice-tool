'use client';
import React from 'react';
import { HashLoader } from 'react-spinners';

const InvoiceProgressOverlay = ({ 
  isVisible, 
  progress, 
  onClose 
}) => {
  console.log('🎯 InvoiceProgressOverlay render - isVisible:', isVisible);
  console.log('🎯 InvoiceProgressOverlay render - progress object:', progress);
  console.log('🎯 Progress percentage value:', progress?.percentage, 'type:', typeof progress?.percentage);
  console.log('🎯 Progress percentage !== undefined:', progress?.percentage !== undefined);
  console.log('🎯 Math.round result:', progress?.percentage !== undefined ? Math.round(progress.percentage) : 'undefined');
  
  if (!isVisible) return null;

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'calculating': return 'Calcul des tarifs...';
      case 'generating-csv': return 'Génération du fichier CSV...';
      case 'generating-pdf': return 'Génération de la facture PDF...';
      case 'completed': return 'Terminé';
      case 'finalizing': return 'Finalisation...';
      default: return 'Traitement en cours...';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Génération des factures
          </h2>
          <p className="text-gray-600">
            Traitement en cours, veuillez patienter...
          </p>
        </div>

        {/* Progress Circle */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - (progress?.percentage || 0) / 100)}`}
                className="transition-all duration-300 ease-out"
              />
            </svg>
            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-800">
                {progress.percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Current Item Info */}
        {progress?.currentItem && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Compte en cours:</div>
            <div className="font-semibold text-gray-800">
              {progress.currentItem.accountNo}
            </div>
            <div className="text-sm text-gray-600">
              {progress.currentItem.name}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {getStatusText(progress.currentItem.status)}
            </div>
          </div>
        )}

        {/* Progress Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Traités</div>
            <div className="font-bold text-gray-800">
              {progress?.processedItems || 0} / {progress?.totalItems || 0}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Temps restant</div>
            <div className="font-bold text-gray-800">
              {progress?.estimatedTimeRemaining ? formatTime(progress.estimatedTimeRemaining) : '--'}
            </div>
          </div>
        </div>

        {/* Time Info */}
        <div className="text-center text-sm text-gray-600 mb-6">
          Temps écoulé: {progress?.elapsedTime ? formatTime(progress.elapsedTime) : '0s'}
        </div>

        {/* Errors */}
        {progress?.errors && progress.errors.length > 0 && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm font-semibold text-red-800 mb-2">
              Erreurs ({progress.errors.length}):
            </div>
            <div className="max-h-20 overflow-y-auto">
              {progress.errors.slice(-3).map((error, index) => (
                <div key={index} className="text-xs text-red-600 mb-1">
                  {error.accountNo}: {error.error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading Animation */}
        {progress?.percentage !== 100 && (
          <div className="flex justify-center mb-4">
            <HashLoader
              color="#3b82f6"
              loading={true}
              size={30}
              aria-label="Loading Spinner"
            />
          </div>
        )}

        {/* Close Button (only show when completed) */}
        {progress?.percentage === 100 && (
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fermer
          </button>
        )}

        {/* Cancel Button (show during processing) */}
        {progress?.percentage !== 100 && (
          <button
            onClick={onClose}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Masquer (le traitement continue)
          </button>
        )}
      </div>
    </div>
  );
};

export default InvoiceProgressOverlay;
