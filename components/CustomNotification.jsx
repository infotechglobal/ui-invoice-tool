'use client'
import React, { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const CustomNotification = ({ 
  isVisible, 
  message, 
  onClose, 
  type = 'info' 
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Remove the auto-hide timeout
    } else {
      // Delay unmounting to allow exit animation
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'info':
        return {
          bg: 'bg-blue-500',
          border: 'border-blue-400',
          icon: <Info size={20} className="text-white" />
        };
      case 'success':
        return {
          bg: 'bg-green-500',
          border: 'border-green-400',
          icon: <CheckCircle size={20} className="text-white" />
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          border: 'border-yellow-400',
          icon: <AlertTriangle size={20} className="text-white" />
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          border: 'border-red-400',
          icon: <AlertCircle size={20} className="text-white" />
        };
      default:
        return {
          bg: 'bg-blue-500',
          border: 'border-blue-400',
          icon: <Info size={20} className="text-white" />
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div 
      className={`
        fixed top-5 right-5 z-[9999] max-w-[400px] min-w-[300px]
        ${typeStyles.bg} ${typeStyles.border} border
        rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="p-4 pr-12">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {typeStyles.icon}
          </div>
          <div className="flex-1">
            <div className="text-white text-sm font-medium leading-5">
              {type === 'info' ? 'Données nettoyées' : 
               type === 'success' ? 'Succès' :
               type === 'warning' ? 'Attention' : 'Erreur'}
            </div>
            <div className="text-white text-sm leading-5 mt-1 opacity-90">
              {message}
            </div>
          </div>
        </div>
      </div>
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-white hover:text-gray-200 transition-colors duration-200"
        aria-label="Fermer la notification"
      >
        <X size={18} />
      </button>
      
      {/* Remove the progress bar since we don't have auto-closing anymore */}
    </div>
  );
};

export default CustomNotification;