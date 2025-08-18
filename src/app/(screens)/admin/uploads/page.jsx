'use client'
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Header from '../../../../../components/Header';
import { ArrowLeft, ArrowUp, Download, Search, Trash2, Upload } from 'lucide-react';
import { sampleFiles } from '../../../../../src/lib/assets';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DatePicker } from '../../../../../components/DatePicker';
import { useAlertMessage } from '../../../../../store/alertStore';
import { useFileStore } from '../../../../../store/uploadedFilesStore';
import { useInvoiceData } from '../../../../../store/invoiceDataStore';
import useLoaderStore from '../../../../../store/loaderStore';
import axios from 'axios';
import driveIcon from '../../../../../public/assets/drive.png'; // Import the drive icon
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dayjs from 'dayjs';
import 'dayjs/locale/fr'; // Import French locale
dayjs.locale('fr')
import TarrifDialog from '../../../../../components/TarrifDialog';
import { set } from 'date-fns';
import UploadErrorsDialog from '../../../../../components/UploadErrorsDialog';
import { useSocket } from '../../../../context/SocketContext';
import InvoiceProgressOverlay from '../../../../../components/InvoiceProgressOverlay';
import CustomNotification from '../../../../../components/CustomNotification'; // Import custom notification

const saveFile = async (blob, fileName) => {
  const { showAlert, hideAlert } = useAlertMessage.getState();
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${fileName}.zip`,
        types: [{
          description: 'ZIP Archive',
          accept: { 'application/zip': ['.zip'] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      console.log('File saved successfully');
      showAlert('Invoice Downloaded Successfully', "Success");
      setTimeout(hideAlert, 3000);
    } catch (err) {
      console.log('Save cancelled or failed:', err);
      fallbackDownload(blob, fileName);
    }
  } else {
    console.log('showSaveFilePicker not supported');
    fallbackDownload(blob, fileName);
  }
};

const fallbackDownload = (blob, fileName) => {
  const { showAlert, hideAlert } = useAlertMessage.getState();
  console.log('Falling back to anchor download');
  showAlert('Invoice Downloaded Successfully', "Success");
  setTimeout(hideAlert, 3000);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

function Uploads({ isInvoice = true }) {
  const [newFile, setNewFile] = useState();
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [searchTerm, setSearchTerm] = useState(''); // State for the search term
  const addFile = useFileStore((state) => state.addNewFiles);
  const { showAlert, hideAlert } = useAlertMessage();
  const uploadedFiles = useFileStore((state) => state.uploadedFiles);
  const inputFileRef = useRef(null);
  const [uploadErrors, setUploadErrors] = useState([]);
  const { invoiceData, setInvoiceData } = useInvoiceData();
  const router = useRouter();
  const { showLoader, hideLoader, isLoading } = useLoaderStore();
  const [showTarrifDialog, setShowTarrifDialog] = useState(false);
  const [showErrorsDialog, setShowErrorsDialog] = useState(false);
  
  // Custom notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info'
  });
  
  // Socket and progress overlay state
  const { socket, isConnected } = useSocket();
  const [progress, setProgress] = useState({
    isVisible: false,
    percentage: 0,
    currentItem: { accountNo: '', name: '', status: 'starting' },
    totalItems: 0,
    processedItems: 0,
    estimatedTimeRemaining: 0,
    elapsedTime: 0,
    errors: []
  });

  // Hydration fix
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Function to show custom notification
  const showNotification = (message, type = 'info') => {
    setNotification({
      isVisible: true,
      message,
      type
    });
  };

  // Function to hide custom notification
  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  // Socket event listeners for progress tracking
  useEffect(() => {
    if (!socket) {
      console.log('Socket not available');
      return;
    }

    console.log('Setting up socket listeners. Socket ID:', socket.id);
    console.log('Socket connected:', socket.connected);

    const handleProgressUpdate = (data) => {
      console.log('🔄 Progress update received:', data);
      setProgress(prev => {
        console.log('Previous progress state:', prev);
        const newProgress = {
          ...prev,
          percentage: Number(data.percentage) || 0,
          currentItem: data.currentItem || { accountNo: '', name: '', status: 'processing' },
          totalItems: Number(data.totalItems) || 0,
          processedItems: Number(data.processedItems) || 0,
          estimatedTimeRemaining: data.estimatedTimeRemaining || 0,
          elapsedTime: data.elapsedTime || 0,
          errors: data.errors || []
        };
        return newProgress;
      });
      
      setTimeout(() => {
        console.log('Progress state after update (async check):', progress);
      }, 100);
    };

    const handleProcessingStart = (data) => {
      console.log('🚀 Processing started:', data);
      setProgress({
        isVisible: true,
        percentage: 0,
        currentItem: { accountNo: '', name: '', status: 'starting' },
        totalItems: Number(data.totalItems) || 0,
        processedItems: 0,
        estimatedTimeRemaining: 0,
        elapsedTime: 0,
        errors: []
      });
    };

    const handleError = (error) => {
      console.log('❌ Processing error:', error);
      setProgress(prev => ({
        ...prev,
        status: 'error',
        errors: [...(prev.errors || []), error.message || 'Unknown error']
      }));
    };

    const handleComplete = (data) => {
      console.log('✅ Processing complete:', data);
      setProgress(prev => ({
        ...prev,
        percentage: 100,
        status: 'complete'
      }));
      setTimeout(() => {
        setProgress(prev => ({ ...prev, isVisible: false }));
      }, 2000);
      if (data.success) {
        showAlert('Factures générées avec succès !', 'Success');
      } else {
        const errorCount = data.errors?.length || 0;
      }
      setTimeout(() => {
        hideAlert();
      }, 3000);
    };

    console.log('📡 Setting up socket event listeners...');
    socket.on('invoiceProgress', handleProgressUpdate);
    socket.on('invoiceProcessingStart', handleProcessingStart);
    socket.on('invoiceError', handleError);
    socket.on('invoiceComplete', handleComplete);
    socket.on('invoiceProcessingComplete', handleComplete);
    socket.on('invoiceProcessingError', handleError);

    socket.on('connect', () => {
      console.log('✅ Socket connected with ID:', socket.id);
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    console.log('🧪 Testing socket connection...');
    socket.emit('test', 'Hello from frontend');
    
    return () => {
      console.log('🧹 Cleaning up socket listeners...');
      socket.off('invoiceProgress', handleProgressUpdate);
      socket.off('invoiceProcessingStart', handleProcessingStart);
      socket.off('invoiceError', handleError);
      socket.off('invoiceComplete', handleComplete);
      socket.off('invoiceProcessingComplete', handleComplete);
      socket.off('invoiceProcessingError', handleError);
    };
  }, [socket, showAlert, hideAlert, progress]);

  const handleUploadClick = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
      inputFileRef.current.value = null;
    }
  };

  const processFile = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append("file", newFile);
      hideAlert();
      showLoader("Téléchargement du fichier, veuillez patienter...");
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/savefile/`, formData);
      console.log(data);
      addFile(data.allFiles);
      
      // Show regular success alert
      showAlert(data.message, "Success");
      setTimeout(() => {
        hideAlert();
      }, 3000);
      
      // Check if there's cleaning information and show custom notification
      if (data.cleaningInfo && data.cleaningInfo.removedRowsCount > 0) {
        const { removedRowNumbers, removedRowsCount, originalRowCount } = data.cleaningInfo;
        const rowNumbersText = removedRowNumbers.length <= 5 
          ? removedRowNumbers.join(', ')
          : `${removedRowNumbers.slice(0, 5).join(', ')} et ${removedRowsCount - 5} autres`;
        
        // Show cleaning info using custom notification
        showNotification(
          `${removedRowsCount} ligne(s) sur ${originalRowCount} ont été supprimées car elles contenaient des données insuffisantes (lignes: ${rowNumbersText}).`,
          'info'
        );
      }
    } catch (error) {

      console.log("err", error);
      if (error.response) {
        if (error.response.status === 400) {
          showAlert(error.response.data.message || "Le fichier a déjà été téléchargé.", "Error");
        } else if (error.response.status === 401) {
          showAlert("Veuillez autoriser l'accès à Google Drive", "Error");
        }
        else if (error.response.status === 422) {
          console.log("422 error", error.response.data.errors);
          showAlert(error.response.data.message ||  "Le fichier a déjà été téléchargé.", "Error");
          setUploadErrors(error?.response?.data?.errors);
          setShowErrorsDialog(true);
        }
        else {
          showAlert("Erreur de serveur, veuillez réessayer plus tard", "Error");
        }
      } else {
        showAlert("Erreur réseau, veuillez réessayer plus tard", "Error");
      }
      setTimeout(() => {
        hideAlert();
      }, 5000);
    } finally {
      hideLoader();
      setNewFile(null);
    }
  }, [newFile, addFile, showLoader, hideLoader, showAlert, hideAlert]);

  const handleChange = (event) => {
    const selectedFile = event.target.files?.[0];
    console.log("file ", selectedFile);
    if (!selectedFile) {
      console.log("No file selected.");
      return;
    }
    setNewFile(selectedFile);
  };

  const handleDelete = async (driveId) => {
    hideAlert();
    showLoader('Suppression du fichier. Cela prendra quelques minutes...');
    try {
      const { data } = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/deletefile/${driveId}`);
      console.log(data);
      if (data.statusCode === 200) {
        showAlert(data.message, "Success");
        setTimeout(() => {
          hideAlert();
        }, 3000);
        addFile(data.allFiles);
      } else {
        showAlert(data.message, "Error");
      }
    } catch (error) {
      console.log(error);
      showAlert(error.response.data.message, "Error");
    } finally {
      setTimeout(() => {
        hideAlert();
      }, 3000);
      hideLoader();
    }
  };
  const authenticate = () => {
    window.open(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/auth/google`);
  };

  const handlePreview = async (driveId, fileName) => {
    hideAlert();
    showLoader('Traitement du fichier. Cela prendra quelques minutes...')
    
    console.log('🚀 Starting file processing...');
    console.log('📡 Socket ID being sent to backend:', socket?.id);
    console.log('🔌 Socket connected status:', socket?.connected);
    
    setProgress({
      isVisible: true,
      percentage: 0,
      currentItem: { accountNo: '', name: '', status: 'starting' },
      totalItems: 0,
      processedItems: 0,
      estimatedTimeRemaining: 0,
      elapsedTime: 0,
      errors: []
    });
    
    try {
      console.log('🚀 About to send invoice processing request');
      console.log('Socket object:', socket);
      console.log('Socket ID being sent:', socket?.id);
      console.log('Socket connected:', socket?.connected);
      
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/process/${driveId}`, { 
        fileName,
        socketId: socket?.id 
      });
      // console.log("processed data", data)
      const summary = data.summary;

      if (data.statusCode === 200) {
        showAlert(data.message, "Success");
        setTimeout(() => {
          hideAlert();
        }, 6200);
        setInvoiceData(summary);
        
        setProgress(prev => ({ ...prev, isVisible: false }));
        hideLoader();
        router.push(`/admin/invoice/${driveId}`);
      } else {
        showAlert(data.message, 'Error');
        setTimeout(() => {
          hideAlert();
        }, 5000);
      }
    } catch (error) {
      console.log(error);
       setProgress(prev => ({ ...prev, isVisible: false }));
      hideLoader();
      if (error?.response?.status == 401) {
        showAlert("Veuillez autoriser l'accès à Google Drive", "Error");
      }
      else if (error?.response?.status == 500) {
        // setProgress(prev => ({ ...prev, isVisible: false }));
        hideLoader();
        showAlert(error.response.data?.cause ? error.response.data.cause : "Something went wrong while processing the file", "Error")
      }
      else {
        showAlert("Something went wrong whilee processing the file", "Error");
      }
      setTimeout(() => {
        hideAlert();
      }, 5000);
    } finally {
      // Additional cleanup if needed
    }
  };

  const downloadInvoice = async (item) => {
    const { fileName } = item;
    const { parentFolderId } = item;
    const { csvFolderId } = item;
    const { pdfFolderId } = item;
    const { isProcessed } = item;
    if (!isProcessed) {
      showAlert("Veuillez prévisualiser le fichier avant de le télécharger", 'Error');
      setTimeout(() => {
        hideAlert();
      }, 3000);
      return;
    }

    try {
      showLoader('Télécharger des factures...');
      console.log('Downloading data...');
      console.log('fileName:', fileName);
      console.log('parentFolderId:', parentFolderId);
      console.log('csvFolderId:', csvFolderId);
      console.log('pdfFolderId:', pdfFolderId);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/download`, {
        fileName,
        parentFolderId,
        csvFolderId,
        pdfFolderId,
      }, {
        responseType: 'blob',
      });

      if (response.status !== 200) {
        const errorBlob = response.data;
        const errorText = await errorBlob.text();
        const errorJson = JSON.parse(errorText);
        showAlert(errorJson.message, 'Error');
        setTimeout(hideAlert, 3000);
        return;
      }

      const blob = new Blob([response.data], { type: 'application/zip' });
      await saveFile(blob, fileName);

    } catch (error) {
      console.error('Error downloading data:', error);
      if (error.response && error.response.data) {
        const errorJson = JSON.parse(await error.response.data.text());
        showAlert(errorJson.message, 'Error');
      } else {
        showAlert('Error downloading data', 'Error');
      }
      setTimeout(hideAlert, 3000);
    } finally {
      hideLoader();
    }
  };

  const openInDrive = () => {
    window.open(`https://drive.google.com/drive/folders/1q83H2RcUy2nEfTYhrd9dNC1f96jtBwyt`);
  };

  useEffect(() => {
    if (newFile) {
      processFile();
    }
  }, [newFile, processFile]);

  const filterFiles = () => {
    return uploadedFiles?.filter(file => {
      const fileDate = dayjs(file.updatedAt);
      const fileYear = fileDate.year();
      const fileMonth = fileDate.month() + 1;

      const yearMatch = selectedYear === 'all' || selectedYear == fileYear;
      const monthMatch = selectedMonth === 'all' || selectedMonth == fileMonth;
      const searchMatch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase());

      return yearMatch && monthMatch && searchMatch;
    });
  };

  const filteredFiles = filterFiles();

  if (!hasMounted) {
    return null;
  }

  return (
    <div className='pt-2 pr-2 pl-3 flex flex-col '>
      {/* Custom Notification */}
      <CustomNotification
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
        duration={5000}
      />

      <div className="header flex flex-col ">
        <div className='flex justify-between'>
          <div>
            <h3 className="text-violet-gray-900 font-archivo text-[28px] font-bold leading-[32px] normal-font-style">
              Fichiers téléchargés
            </h3>
          </div>
        </div>
        {/* select client */}
        <div className='mt-1 flex justify-between'>
          <h3 className='text-violet-gray-800 font-archivo text-custom-18 font-normal leading-custom-24'>
            Cliquez sur Aperçu pour afficher les détails de la facture
          </h3>
          <div className="flex gap-5 mr-8">
            <button onClick={authenticate} className='  rounded-lg border-2 p-2 border-violet-gray-100  w-fit bg-white text-violet-gray-900 font-archivo font-semibold'>Authentifier</button>
            <button
              className="rounded-xl px-2 py-1 bg-uploadContainerBg-200 flex justify-center items-center text-white font-semibold  cursor-pointer"
              onClick={handleUploadClick}
              disabled={isLoading}
            >
              Téléverser un fichier
              <Upload className="ml-2" size={16} />
              <input
                type="file"
                name=""
                id="inputFile"
                className='hidden'
                ref={inputFileRef}
                onChange={handleChange}
                accept=".csv, .xlsx"
              />
            </button>
          </div>
        </div>
        {/* search bar, date picker, download invoice */}
        <div className="mt-3 h-14 flex items-center justify-between gap-4">
          {/* Search Input with Icon */}
          <div className="relative flex items-center w-1/3 min-w-[200px]">
            <Search className="absolute left-3" size={18} color="#403A44" strokeWidth={1.75} />
            <input
              className="searchField h-8 pl-9 w-full"
              placeholder="Recherche"
              disabled={isLoading}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mr-32">
            <select
              className="selectFilter"
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={isLoading}
            >
              <option className="font-semibold" value="all">Tous les ans</option>
              {[...new Set(uploadedFiles?.map(file => dayjs(file.updatedAt).year()))].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              className="selectFilter"
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={isLoading}
            >
              <option className="font-semibold" value="all">Tous les mois</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{dayjs().month(month - 1).format('MMMM')}</option>
              ))}
            </select>
          </div>
          <button
            className='rounded-xl px-2 py-1 bg-uploadContainerBg-200 flex justify-center items-center text-white font-semibold w-[120px] '
            onClick={() => setShowTarrifDialog(true)} >
          Gérer Tarif</button>
          <TarrifDialog open={showTarrifDialog} onClose={() => setShowTarrifDialog(false)} />

          {/* Drive Button */}
          <Button
            onClick={openInDrive}
            className="rounded-lg border-2 mr-6 border-violet-gray-100 h-8 bg-white text-violet-gray-900 text-sm hover:bg-slate-50 flex items-center px-3"
            disabled={isLoading}
          >
            <Image src={driveIcon} alt="Drive Icon" className="w-5 h-5 mr-2" />
            Afficher tous les fichiers dans Drive
          </Button>
        </div>
      </div>

      {/* files */}
      <div className='h-[550px] overflow-y-scroll no-scrollbar'>
        {filteredFiles?.map((item, index) => (
          <div key={index} className="flex items-center gap-7 self-stretch files mt-[20px]">
            <div className={`flex justify-between w-[1150px] rounded-lg p-2 space-y-4 border-black shadow-custom ${
              item.isProcessed 
                ? 'bg-blue-600 border-l-4 border-l-blue-300' // Darker blue with indicator border for processed files
                : 'bg-uploadContainerBg-200' // Original color for unprocessed files
            }`}>
              <div className='flex mainContainer flex-grow space-y-4'>
                <div className='w-full space-y-3'>
                  {item.isProcessed && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                      <span className="text-blue-300 text-xs font-medium">Traité</span>
                    </div>
                  )}
                  <h1 className='text-white font-archivo text-lg font-semibold leading-6'>{item.fileName}</h1>
                  <h2 className='text-white font-syne text-base font-normal leading-4'>
                    dernière modification {dayjs(item.updatedAt).format('DD MMM YYYY')}
                  </h2>
                  <div className='flex justify-between'>
                    <a
                      href={item.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className='text-white font-archivo text-sm font-normal leading-4 underline'
                    >
                      Ouvrir dans Drive
                    </a>
                    <button
                      onClick={() => handlePreview(item.driveId, item.fileName)}
                      className={`font-archivo text-sm font-normal leading-4 underline relative right-[500px] ${
                        item.isProcessed 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-white hover:text-gray-200'
                      }`}
                      disabled={isLoading}
                    >
                      {item.isProcessed ? 'Déjà traité' : 'Aperçu'}
                    </button>
                  </div>
                </div>
              </div>
              
              <button onClick={() => downloadInvoice(item)} className='h-fit relative top-[14px] left-1'>
                <Download size={20} color="#ffffff" strokeWidth={2.25} />
              </button>
            </div>
            {!item.isProcessed && (
              <button onClick={() => handleDelete(item.driveId)} className="icons" disabled={isLoading}>
                <Trash2 size={20} color="#6f6a73" strokeWidth={2.25} />
              </button>
            )}
          </div>
        ))}
      </div>

      <UploadErrorsDialog
        errors={uploadErrors}
        open={showErrorsDialog}
        onClose={() => setShowErrorsDialog(false)}
      />
      <InvoiceProgressOverlay 
        isVisible={progress.isVisible}
        progress={progress}
      />
    </div>

  )
}

export default Uploads;