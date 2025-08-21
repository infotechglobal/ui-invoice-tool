'use client';
import React from 'react';
import { HashLoader } from 'react-spinners';

import { infoMessages } from '@/utils/message';

const InvoiceProgressOverlay = ({
  isVisible,
  progress,
  onClose
}) => {

  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
    const [messageIndex, setMessageIndex] = React.useState(0);
      const [fade, setFade] = React.useState(true);


  // Auto increment elapsed time
  React.useEffect(() => {
    let interval;
    if (isVisible && progress?.percentage !== 100) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVisible, progress?.percentage]);

  
    React.useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % infoMessages.length);
        setFade(true);
      }, 300); // allow fade out before changing message
    }, 6000); // every 6 seconds

    return () => clearInterval(interval);
  }, []);
 
  const percentage = progress?.percentage ?? 0;
  const processedItems = progress?.processedItems ?? 0;
  const totalItems = progress?.totalItems ?? 0;
  const elapsedTime = progress?.elapsedTime ?? 0;
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
      case 'generating-summary': return 'Génération du fichier récapitulatif...';
      case 'summary-complete': return 'Fichier récapitulatif généré';
      case 'completed': return 'Terminé';
      case 'finalizing': return 'Finalisation...';
      default: return 'Traitement en cours...';
    }
  };

  //information Messages with icons and color themes
 
  




 if (!isVisible) return null;
  return (
     <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
      {/* ...existing overlay content... */}
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Génération des factures
          </h2>
          <p className="text-gray-600">
            Traitement en cours, veuillez patienter...
          </p>
        </div>
        
        {/* Enhanced Message Section with Dynamic Colors */}
        <div className={`mb-6 p-4 bg-gradient-to-r ${infoMessages[messageIndex].bgColor} rounded-lg border-l-4 ${infoMessages[messageIndex].borderColor} shadow-sm transition-all duration-700 ease-in-out h-[88px] flex flex-col justify-between`}>
          <div className="flex items-center space-x-3">
           
            <div className={`text-sm ${infoMessages[messageIndex].textColor} font-semibold flex-1 transition-all duration-500 ease-in-out overflow-hidden ${
              fade ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}>
              <div className={`line-clamp-2`}>
                {infoMessages[messageIndex].text}
              </div>
            </div>
            {/* Speed indicator animation */}
            <div className="flex space-x-1 flex-shrink-0">
              <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
          
          {/* Enhanced Progress dots indicator with theme colors */}
          <div className="flex justify-center mt-3 space-x-1">
            {infoMessages.map((msg, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === messageIndex 
                    ? `${msg.iconColor.replace('text-', 'bg-')} scale-125 animate-pulse` 
                    : `${msg.iconColor.replace('text-', 'bg-').replace('-500', '-200')} hover:scale-110`
                }`}
              />
            ))}
          </div>
        </div>

        {/* Enhanced Progress Circle with Speed Indicators */}
        <div className="flex justify-center mb-6 relative">
          <div className="relative">
            {/* Outer glowing ring for speed effect */}
            <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"></div>
            <div className="absolute inset-0 rounded-full bg-blue-300 opacity-10 animate-pulse"></div>
            
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
              {/* Progress circle with enhanced animation */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - (progress?.percentage || 0) / 100)}`}
                className="transition-all duration-300 ease-out"
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Percentage text with animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-800 animate-pulse">
                {`${Number(percentage)}%`}
              </span>
            </div>
            
            {/* Speed particles effect */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
            </div>
            <div className="absolute bottom-0 right-2 transform translate-y-2">
              <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
            </div>
            <div className="absolute top-2 right-0 transform translate-x-2">
              <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.6s'}}></div>
            </div>
          </div>
          
       
        </div>

        {/* Current Item Info */}
        {progress?.currentItem && (
          <div className="mb-6 p-6 bg-blue-50 rounded-lg min-h-[120px] flex flex-col justify-between">
            <div>
              <div className="font-semibold text-gray-800 text-lg mb-2">
                {progress.currentItem.accountNo}
              </div>
              <div className="text-base text-gray-600 break-words">
                {progress.currentItem.name}
              </div>
            </div>
            <div className="text-sm text-blue-600 mt-3 font-medium">
              {getStatusText(progress.currentItem.status)}
            </div>
          </div>
        )}

        {/* Enhanced Progress Stats with Speed Indicators */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
          <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-green-400 animate-pulse"></div>
            <div className="text-sm text-gray-600 flex items-center justify-center space-x-1">
              <span>📊 Traités</span>
            </div>
            <div className="font-bold text-gray-800 text-lg">
              {`${Number(processedItems)} / ${Number(totalItems)}`}
            </div>
            {/* <div className="text-xs text-green-600 font-medium">
              {processedItems > 0 && `${Math.round((processedItems/totalItems) * 100)}% complete`}
            </div> */}
          </div>
          <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"></div>
            <div className="text-sm text-gray-600 flex items-center justify-center space-x-1">
              <span>⏱️ Temps écoulé</span>
            </div>
            <div className="font-bold text-gray-800 text-lg">
              {formatTime(elapsedSeconds)}
            </div>
            {/* <div className="text-xs text-blue-600 font-medium">
              {elapsedSeconds > 0 && processedItems > 0 && 
                `${Math.round(processedItems/elapsedSeconds * 60)} items/min`
              }
            </div> */}
          </div>
        </div>

        {/* Enhanced Loading Animation with Speed Effect */}
        {progress?.percentage !== 100 && (
          <div className="flex flex-col items-center mb-4 space-y-2">
            <div className="flex items-center space-x-3">
              
             
            </div>
            
            {/* Speed bars animation */}
           
          </div>
        )}
        <div className='flex justify-center'>

         <HashLoader color='blue' size={25} />
        </div>
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

      {/* Cancel Button (show only during processing) */}

    </div>
  );
};

export default InvoiceProgressOverlay;