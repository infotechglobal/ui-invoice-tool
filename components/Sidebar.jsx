'use client'
import React from 'react';
import { BrandLogo } from '../src/lib/assets';
import Image from 'next/image';
import { CircleCheck, CircleX, File, LogOut, TriangleAlert, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';
import { useAlertMessage } from '../store/alertStore';
import { useFileStore } from '../store/uploadedFilesStore';
import useLoaderStore from '../store/loaderStore';
import loaderStore from '../store/loaderStore';
import axios from 'axios';
import { useInvoiceData } from '../store/invoiceDataStore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '@/components/ui/loader';

function Sidebar() {
  const uploadedFiles = useFileStore((state) =>
    state.uploadedFiles?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  );
  const { message, status, showAlert, hideAlert, isLoading } = useAlertMessage();
  const { invoiceData, setInvoiceData } = useInvoiceData();
  const { showLoader, hideLoader } = useLoaderStore();
  
  const isLoaderLoading = useLoaderStore((state) => state.isLoading);
  const router = useRouter();

  // Add this check to determine if any file is currently being processed
  const isAnyFileProcessing = uploadedFiles?.some(file => file.isProcessing);

  const handlePreview = async (driveId, fileName) => {
    // If any file is processing, don't allow preview
    if (isAnyFileProcessing) {
      toast.warning('Un fichier est en cours de traitement. Veuillez patienter.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    showLoader('Chargement de la facture...');
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/process/${driveId}`,
        { fileName }
      );
      const summary = data.summary;

      if (data.statusCode === 200) {
        setInvoiceData(summary);
        router.push(`/admin/invoice/${driveId}`);
      }
    } catch (error) {
      console.log(error);
      if(error?.response?.status === 401) {
        showAlert("Veuillez autoriser l'accès à Google Drive", "Error");
        // Redirect immediately on auth error
       
        return;
      }
    } finally {
      hideLoader();
    }
  };

  const handleLogout = () => {
    deleteCookie('token');
    toast.success('Vous avez été déconnecté avec succès', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    setTimeout(() => {
      router.push('/login');
    }, 1500); // Delay redirect by 1.5 seconds to allow alert to be visible
  }

function getFrenchText(status) {
  switch (status?.toLowerCase()) {
    case 'success':
      return 'Succès';
    case 'error':
      return 'Erreur';
    case 'warning':
      return 'Avertissement';
    case 'info':
      return 'Info';
    default:
      return 'Inconnu';
  }
}

  // Function to get the appropriate icon based on status
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return <CircleCheck size={22} strokeWidth={2.5} />;
      case 'error':
        return <CircleX size={22} strokeWidth={2.5} />;
      case 'warning':
        return <TriangleAlert size={22} strokeWidth={2.5} />;
      case 'info':
        return <Info size={22} strokeWidth={2.5} />;
      default:
        return <AlertCircle size={22} strokeWidth={2.5} />;
    }
  };

  // Function to get the appropriate variant based on status
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Info';
      default:
        return 'default';
    }
  };

  return (
    <div className='mr-10 flex flex-col w-full h-full justify-between'>
      <div className='flex-1 overflow-hidden flex flex-col'>
        <header className='px-6 py-4 border-b border-gray-100 flex-shrink-0'>
          <Link href={'/admin/uploads'} className='block'>
            <Image
              src={BrandLogo}
              alt='Picture of the Login page'
              quality={100}
              className='w-auto h-10 hover:opacity-80 transition-opacity duration-200'
            />
          </Link>
        </header>

        <section className='px-4 py-6 flex-1 overflow-hidden flex flex-col'>
          <div className='mb-6 flex-shrink-0'>
            <h2 className='text-gray-800 font-Archivo font-bold text-base leading-5 mb-2 flex items-center'>
              <File size={20} className='mr-2' style={{ color: 'rgb(69, 104, 220)' }} />
              Fichiers déjà traités
            </h2>
            <p className='text-gray-500 text-xs font-medium'>
              Cliquez sur un fichier pour l&apos;ouvrir
            </p>
            
            {/* Add processing indicator if any file is being processed */}
            {isAnyFileProcessing && (
              <div className="mt-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-md flex items-center">
                <div className="w-2 h-2 rounded-full bg-orange-400 mr-2 animate-pulse"></div>
                <span className="text-orange-700 text-xs">Traitement en cours...</span>
              </div>
            )}
          </div>
          
          {/* Make this section scrollable with auto height */}
          <div className='flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400'>
            {uploadedFiles?.map(
              (item, index) =>
                item.isProcessed && (
                  <button
                    key={index}
                    onClick={() => handlePreview(item.driveId, item.fileName)}
                    className={`group flex items-start space-x-4 p-4 rounded-xl border transition-all duration-300 text-left w-full mb-3 ${
                      isAnyFileProcessing 
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-70' 
                        : 'bg-white border-gray-200 cursor-pointer shadow-sm hover:shadow-lg hover:transform hover:-translate-y-0.5'
                    }`}
                    style={{ 
                      '--hover-bg': isAnyFileProcessing ? 'rgb(243, 244, 246)' : 'rgba(69, 104, 220, 0.05)',
                      '--hover-border': isAnyFileProcessing ? 'rgb(229, 231, 235)' : 'rgba(69, 104, 220, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isAnyFileProcessing) {
                        e.currentTarget.style.backgroundColor = 'rgba(69, 104, 220, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(69, 104, 220, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isAnyFileProcessing) {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = 'rgb(229, 231, 235)';
                      }
                    }}
                    disabled={isAnyFileProcessing}
                  >
                    <div className='flex-shrink-0 mt-1'>
                      <div 
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                          isAnyFileProcessing 
                            ? 'bg-gray-200' 
                            : 'bg-blue-50'
                        }`}
                        style={{ backgroundColor: isAnyFileProcessing ? 'rgba(229, 231, 235)' : 'rgba(69, 104, 220, 0.1)' }}
                        onMouseEnter={(e) => {
                          if (!isAnyFileProcessing) {
                            e.currentTarget.style.backgroundColor = 'rgba(69, 104, 220, 0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isAnyFileProcessing) {
                            e.currentTarget.style.backgroundColor = 'rgba(69, 104, 220, 0.1)';
                          }
                        }}
                      >
                        <File 
                          size={20} 
                          style={{ color: isAnyFileProcessing ? 'rgb(156, 163, 175)' : 'rgb(69, 104, 220)' }}
                          strokeWidth={2} 
                        />
                      </div>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div 
                        className='font-Archivo text-sm font-semibold leading-5 break-words mb-1 transition-colors duration-300'
                        style={{ color: isAnyFileProcessing ? 'rgb(107, 114, 128)' : 'rgb(55, 65, 81)' }}
                        onMouseEnter={(e) => {
                          if (!isAnyFileProcessing) {
                            e.currentTarget.style.color = 'rgb(69, 104, 220)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isAnyFileProcessing) {
                            e.currentTarget.style.color = 'rgb(55, 65, 81)';
                          }
                        }}
                      >
                        {item?.fileName?.length > 25 ? 
                          `${item.fileName.substring(0, 25)}...` : 
                          item.fileName
                        }
                      </div>
                      <div 
                        className='text-xs transition-colors duration-300'
                        style={{ color: isAnyFileProcessing ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
                        onMouseEnter={(e) => {
                          if (!isAnyFileProcessing) {
                            e.currentTarget.style.color = 'rgb(69, 104, 220)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isAnyFileProcessing) {
                            e.currentTarget.style.color = 'rgb(107, 114, 128)';
                          }
                        }}
                      >
                        Facture • {new Date(item.updatedAt).toLocaleDateString('fr-FR')}
                      </div>
                      {isAnyFileProcessing ? (
                        <div className='text-xs mt-2 text-gray-400'>
                          En attente de la fin du traitement
                        </div>
                      ) : (
                        <div 
                          className='text-xs mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 font-medium'
                          style={{ color: 'rgb(69, 104, 220)' }}
                        >
                          → Cliquer pour ouvrir
                        </div>
                      )}
                    </div>
                  </button>
                )
            )}
          </div>
        </section>
      </div>

      {/* Loader notification - centered on screen */}
      {isLoaderLoading && (
        <Loader />
      )}

      {/* Enhanced Alert - now appears as popup */}
      {isLoading && (
        <Alert 
          variant={getStatusVariant(status)}
          onClose={hideAlert}
          autoClose={true}
          autoCloseDelay={5000}
        >
          {getStatusIcon(status)}
          <div>
            <AlertTitle>{getFrenchText(status)}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </div>
        </Alert>
      )}

      {/* Fixed height footer */}
      <footer className='mb-3 self-center w-full px-2 flex-shrink-0'>
        {/* Logout button - always at the bottom */}
        <div className='flex justify-center'>
          <button 
            onClick={handleLogout} 
            className='w-full max-w-xs rounded-xl px-4 py-3 bg-uploadContainerBg-200 hover:bg-opacity-90 flex items-center justify-center text-white font-semibold transition-all duration-200 hover:shadow-lg transform hover:scale-105'
          >
            <LogOut color="#ffffff" className='mr-3' size={18} />
            Se déconnecter
          </button>
        </div>
        <ToastContainer />
      </footer>
    </div>
  );
}

export default Sidebar;