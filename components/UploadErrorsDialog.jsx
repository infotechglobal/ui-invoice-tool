import React, { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";

const UploadErrorsDialog = ({ errors = [], open, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!isVisible && !open) return null;
  
  if (!errors?.length) return null;
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 min-w-[350px] max-w-[600px] w-[90%] relative transition-all duration-300 transform ${open ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}>
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-shrink-0 p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Erreurs lors du téléchargement
          </h3>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
           Le fichier n&pos;a pas pu être téléchargé. Veuillez vérifier le format et réessayer.
          </p>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          <ul className="space-y-2">
            {errors.map((err, idx) => (
              <li key={idx} className="flex items-start gap-3 py-2 px-3 bg-gray-50 dark:bg-gray-700/30 rounded-md border-l-4 border-red-400 dark:border-red-500">
                <span className="text-sm text-gray-800 dark:text-gray-200 leading-tight">
                  {err.includes("Row") ? (
                    <>
                      <span className="font-bold text-red-500 dark:text-red-400">
                        {err.substring(0, err.indexOf(":") + 1)}
                      </span>
                      {err.substring(err.indexOf(":") + 1)}
                    </>
                  ) : (
                    err
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadErrorsDialog;