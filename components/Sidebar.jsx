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

function Sidebar() {
  const uploadedFiles = useFileStore((state) =>
    state.uploadedFiles?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  );
  const { message, status, showAlert, hideAlert, isLoading } = useAlertMessage();
  const { invoiceData, setInvoiceData } = useInvoiceData();
  const { showLoader, hideLoader } = useLoaderStore();
  const isLoaderLoading = useLoaderStore((state) => state.isLoading);
  const router = useRouter();

  const handlePreview = async (driveId, fileName) => {
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

  // Function to get the appropriate icon based on status
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return <CircleCheck size={20} />;
      case 'error':
        return <CircleX size={20} />;
      case 'warning':
        return <TriangleAlert size={20} />;
      case 'info':
        return <Info size={20} />;
      default:
        return <AlertCircle size={20} />;
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
          </div>
          {/* Make this section scrollable with auto height */}
          <div className='flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400'>
            {uploadedFiles?.map(
              (item, index) =>
                item.isProcessed && (
                  <button
                    key={index}
                    onClick={() => handlePreview(item.driveId, item.fileName)}
                    className='group flex items-start space-x-4 p-4 rounded-xl bg-white border border-gray-200 transition-all duration-300 cursor-pointer shadow-sm text-left w-full hover:shadow-lg hover:transform hover:-translate-y-0.5 mb-3'
                    style={{ 
                      '--hover-bg': 'rgba(69, 104, 220, 0.05)',
                      '--hover-border': 'rgba(69, 104, 220, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(69, 104, 220, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(69, 104, 220, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = 'rgb(229, 231, 235)';
                    }}
                  >
                    <div className='flex-shrink-0 mt-1'>
                      <div 
                        className='w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300'
                        style={{ backgroundColor: 'rgba(69, 104, 220, 0.1)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(69, 104, 220, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(69, 104, 220, 0.1)';
                        }}
                      >
                        <File 
                          size={20} 
                          style={{ color: 'rgb(69, 104, 220)' }}
                          strokeWidth={2} 
                        />
                      </div>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div 
                        className='font-Archivo text-sm font-semibold leading-5 break-words mb-1 transition-colors duration-300'
                        style={{ color: 'rgb(55, 65, 81)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'rgb(69, 104, 220)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'rgb(55, 65, 81)';
                        }}
                      >
                        {item?.fileName?.length > 25 ? 
                          `${item.fileName.substring(0, 25)}...` : 
                          item.fileName
                        }
                      </div>
                      <div 
                        className='text-xs transition-colors duration-300'
                        style={{ color: 'rgb(107, 114, 128)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'rgb(69, 104, 220)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'rgb(107, 114, 128)';
                        }}
                      >
                        Facture • {new Date(item.updatedAt).toLocaleDateString('fr-FR')}
                      </div>
                      <div 
                        className='text-xs mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 font-medium'
                        style={{ color: 'rgb(69, 104, 220)' }}
                      >
                        → Cliquer pour ouvrir
                      </div>
                    </div>
                  </button>
                )
            )}
          </div>
        </section>
      </div>

      {/* Loader notification - centered on screen */}
      {isLoaderLoading && (
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
          <div className='flex justify-between items-start'>
            <AlertTitle>{status}</AlertTitle>
          </div>
          <AlertDescription>{message}</AlertDescription>
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