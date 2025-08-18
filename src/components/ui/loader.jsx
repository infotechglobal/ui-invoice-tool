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
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl p-4 min-w-[200px]">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <HashLoader
              color={color}
              loading={true}
              cssOverride={override}
              size={24}
              aria-label="Loading Spinner"
              data-testid="loader"
              speedMultiplier={1.2}
            />
            {/* Subtle glow effect */}
            <div 
              className="absolute inset-0 rounded-full blur-sm opacity-20"
              style={{ backgroundColor: color }}
            />
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-800 leading-tight">
              {message || "Loading..."}
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2 overflow-hidden">
              <div 
                className="h-full rounded-full animate-pulse"
                style={{ 
                  backgroundColor: color,
                  animation: "progress 2s ease-in-out infinite"
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Loader;