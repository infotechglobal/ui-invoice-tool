'use client'
import React from 'react';
import { BrandLogo } from '../src/lib/assets';
import Image from 'next/image';
import { CircleCheck, CircleX, File, LogOut, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';
import { useAlertMessage } from '../store/alertStore';
import { useFileStore } from '../store/uploadedFilesStore';
import Loader from '../src/components/ui/loader.jsx';
import useLoaderStore from '../store/loaderStore';
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

  return (
    <div className='mr-10 flex flex-col w-full h-full justify-between'>
      <div className='flex-1'>
        <header className='px-6 py-4 border-b border-gray-100'>
          <Link href={'/admin/uploads'} className='block'>
            <Image
              src={BrandLogo}
              alt='Picture of the Login page'
              quality={100}
              className='w-auto h-10 hover:opacity-80 transition-opacity duration-200'
            />
          </Link>
        </header>

        <section className='px-4 py-6'>
          <div className='mb-6'>
            <h2 className='text-gray-800 font-Archivo font-bold text-base leading-5 mb-2 flex items-center'>
              <File size={20} className='mr-2' style={{ color: 'rgb(69, 104, 220)' }} />
              Fichiers Facturés
            </h2>
            <p className='text-gray-500 text-xs font-medium'>
              Cliquez sur un fichier pour l'ouvrir
            </p>
          </div>
          <div className='flex flex-col space-y-3 files h-[370px] overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400'>
            {uploadedFiles?.map(
              (item, index) =>
                item.isProcessed && (
                  <button
                    key={index}
                    onClick={() => handlePreview(item.driveId, item.fileName)}
                    className='group flex items-start space-x-4 p-4 rounded-xl bg-white border border-gray-200 transition-all duration-300 cursor-pointer shadow-sm text-left w-full hover:shadow-lg hover:transform hover:-translate-y-0.5'
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
                        {item.fileName.length > 25 ? 
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

      <footer className='mb-3 self-center w-full px-2'>
        {isLoaderLoading && (
          <div className='bg-blue-200 rounded-3xl border-2 border-gray-200 mb-4'>
            <Loader />
          </div>
        )}

        {isLoading && (
          <div className='mb-4'>
            <Alert variant={status}>
              {status === 'Success' ? <CircleCheck size={20} /> : <TriangleAlert size={20} />}
              <div className='flex justify-between'>
                <AlertTitle>{status}</AlertTitle>
                <CircleX size={20} onClick={hideAlert} className='cursor-pointer hover:opacity-70' />
              </div>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          </div>
        )}

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