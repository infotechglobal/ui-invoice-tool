import React, { useState, useEffect } from "react";
import { HashLoader } from "react-spinners";
import loaderStore from "../../../store/loaderStore";

const override = {
  display: "block",
  margin: "auto 8px",
  marginRight: "16px",
};

function Loader() {
  const { isLoading, message } = loaderStore();
  const [color, setColor] = useState("#3B82F6"); // Modern blue
  
  // Optional: Dynamic color cycling
  const colors = ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"];
  
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setColor(colors[Math.floor(Math.random() * colors.length)]);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm'>
          <div className='bg-white/95 backdrop-blur-md rounded-2xl border-2 border-gray-200 shadow-2xl p-6 min-w-[300px] max-w-[500px] w-auto mx-4 animate-fadeIn'>
            <div className='flex items-center space-x-4'>
              <div className='relative flex-shrink-0'>
                <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center'>
                  <div className='w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                </div>
                <div className='absolute inset-0 w-12 h-12 rounded-full bg-blue-500/20 animate-pulse'></div>
              </div>
              
              <div className='flex-1 min-w-0'>
                <h3 className='text-lg font-semibold text-gray-800 leading-tight mb-2'>
                  Chargement en cours
                </h3>
                <p className='text-sm text-gray-600 break-words whitespace-pre-wrap leading-relaxed'>
                  {loaderStore().message || 'Veuillez patienter...'}
                </p>
                <div className='w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden'>
                  <div 
                    className='h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-progress'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}

export default Loader;