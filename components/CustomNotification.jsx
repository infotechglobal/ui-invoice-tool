'use client'
import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';

const CustomNotification = ({ 
  isVisible, 
  message, 
  onClose, 
  duration = 5000,
  type = 'info' 
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Delay unmounting to allow exit animation
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

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
          icon: <Info size={20} className="text-white" />
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          border: 'border-yellow-400',
          icon: <Info size={20} className="text-white" />
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          border: 'border-red-400',
          icon: <Info size={20} className="text-white" />
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
              Données nettoyées
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
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20 rounded-b-lg overflow-hidden">
        <div 
          className="h-full bg-white bg-opacity-30 transition-all duration-linear"
          style={{ 
            animation: isVisible ? `shrink ${duration}ms linear` : 'none',
            transformOrigin: 'left'
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CustomNotification;