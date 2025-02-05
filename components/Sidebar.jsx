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
      <div>
        <header>
          <Link href={'/admin/uploads'}>
            <Image
              src={BrandLogo}
              alt='Picture of the Login page'
              quality={100}
              className='mt-8 mb-10 ml-6'
            />
          </Link>
        </header>

        <section className='pl-2'>
          <h2 className='text-violet-gray-900 font-Archivo font-bold text-sm leading-4 w-max'>
            fichiers facturés
          </h2>
          <div className='flex flex-col space-y-1 files ml-3 mt-3 w-max h-[400px] overflow-y-scroll no-scrollbar'>
            {uploadedFiles?.map(
              (item, index) =>
                item.isProcessed && (
                  <button
                    key={index}
                    onClick={() => handlePreview(item.driveId, item.fileName)}
                    className='flex space-x-2 cursor-default'
                  >
                    <div className='icon'>
                      <File className='mt-1' size={16} color='#6f6a73' strokeWidth={2.25} />
                    </div>
                    <div className='text-VioletGray-600 font-Archivo text-sm  font-semibold leading-6 w-max'>
                      {item.fileName}
                    </div>
                  </button>
                )
            )}
          </div>
        </section>
      </div>

      <footer className='mb-3 self-center'>
        {isLoaderLoading && (
          <div className='bg-blue-200 rounded-3xl border-2 border-gray-200 '>
            <Loader />
          </div>
        )}

        {isLoading && (
          <Alert variant={status}>
            {status === 'Success' ? <CircleCheck size={20} /> : <TriangleAlert size={20} />}
            <div className='flex justify-between'>
              <AlertTitle>{status}</AlertTitle>
              <CircleX size={20} onClick={hideAlert} />
            </div>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className='mb-1 flex justify-center mt-2 '>
          <button onClick={handleLogout} className=' max-w-xs w-60 rounded-xl px-2 py-1 bg-uploadContainerBg-200 flex items-center justify-center text-white font-semibold'>
            <LogOut color="#ffffff" className='mr-3' />
            Se déconnecter
          </button>
        </div>
      <ToastContainer  />
      </footer>
    </div>
  );
}

export default Sidebar;
