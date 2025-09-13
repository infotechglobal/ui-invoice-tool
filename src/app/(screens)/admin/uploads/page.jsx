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
import { ChevronRight, Play, Loader2, Eye } from 'lucide-react';

import { Calendar, CalendarDays } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  const { socket, isConnected, subscribeToFile } = useSocket();
  const [showTarrifDialog, setShowTarrifDialog] = useState(false);
  const [showErrorsDialog, setShowErrorsDialog] = useState(false);
  const [driveAuth, setDriveAuth] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const rowPerPage = 5;
  const [pageNo, setPageNo] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(rowPerPage);




  // Custom notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info'
  });

  // Socket and progress overlay state
  // const { socket, isConnected } = useSocket();

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
  const [activeFileId, setActiveFileId] = useState(null);


  const resumeFromStatus = useCallback(async (fileId) => {
    try {
      if (!fileId) return false; // Return false if no fileId

      subscribeToFile(fileId);
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/status/${fileId}`);

      if (data.isProcessed) {
        // Done while we were away → redirect
        router.push(`/admin/invoice/${fileId}`);
        localStorage.removeItem('activeFileId');
        setProgress((p) => ({ ...p, isVisible: false }));
        return false; // No active processing
      }

      if (data.isProcessing) {
        setProgress((prev) => ({
          ...prev,
          isVisible: true,
          ...(data.progress ? {
            percentage: Number(data.progress.percentage) || 0,
            currentItem: data.progress.currentItem || prev.currentItem,
            totalItems: Number(data.progress.totalItems) || 0,
            processedItems: Number(data.progress.processedItems) || 0,
            estimatedTimeRemaining: data.progress.estimatedTimeRemaining || 0,
            elapsedTime: data.progress.elapsedTime || 0,
            errors: data.progress.errors || []
          } : {})
        }));
        return true; // Active processing resumed
      } else {
        setProgress((p) => ({ ...p, isVisible: false }));
        localStorage.removeItem('activeFileId'); // Clean up if not processing
        return false; // No active processing
      }
    } catch (e) {
      console.error('Failed to resume status:', e);
      localStorage.removeItem('activeFileId'); // Clean up on error
      return false; // No active processing
    }
  }, [router, subscribeToFile]);

  useEffect(() => {
    const remembered = typeof window !== "undefined" ? localStorage.getItem("activeFileId") : null;
    const processing = uploadedFiles?.find((f) => f.isProcessing);
    const fileId = processing?.driveId || remembered;

    const initializeLoader = async () => {
      if (fileId) {
        console.log('Found file to resume:', fileId);
        setActiveFileId(fileId);

        // Show loader immediately when there's a file to check
        // showLoader("Vérification du statut de traitement...");

        // Check if there's actual processing happening
        const isActivelyProcessing = await resumeFromStatus(fileId);

        if (!isActivelyProcessing) {
          // If no active processing, hide loader immediately
          hideLoader();
        }
        // If actively processing, loader will be hidden when progress overlay shows
      } else {
        // No file to resume, hide loader immediately
        hideLoader();
      }
    };

    initializeLoader();
  }, [uploadedFiles, resumeFromStatus, showLoader, hideLoader]);

  // Hide loader when progress overlay becomes visible
  useEffect(() => {
    if (progress.isVisible) {
      hideLoader();
    }
  }, [progress.isVisible, hideLoader]);

  // Additional cleanup: hide loader after a reasonable timeout if nothing happens
  useEffect(() => {
    const timer = setTimeout(() => {
      // If no progress overlay is showing after 5 seconds, ensure loader is hidden
      if (!progress.isVisible) {
        hideLoader();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [progress.isVisible, hideLoader]);



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
      setProgress((prev) => ({
        ...prev,
        isVisible: true,
        percentage: Number(data.percentage) || 0,
        currentItem: data.currentItem || prev.currentItem,
        totalItems: Number(data.totalItems) || 0,
        processedItems: Number(data.processedItems) || 0,
        estimatedTimeRemaining: data.estimatedTimeRemaining || 0,
        elapsedTime: data.elapsedTime || 0,
        errors: data.errors || prev.errors
      }));

      setTimeout(() => {
        console.log('Progress state after update (async check):', progress);
      }, 100);
    };

    const handleProcessingStart = (data) => {
      if (data?.fileId) {
        setActiveFileId(data.fileId);
        localStorage.setItem('activeFileId', data.fileId);
      }
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
      setProgress((prev) => ({ ...prev, isVisible: false }));
      localStorage.removeItem('activeFileId');
    };


    const handleComplete = (data) => {
      // redirect even after refresh
      const fid = data?.fileId || activeFileId;
      setProgress((prev) => ({ ...prev, percentage: 100 }));
      setTimeout(() => setProgress((prev) => ({ ...prev, isVisible: false })), 500);
      if (fid) {
        localStorage.removeItem('activeFileId');
        router.push(`/admin/invoice/${fid}`); // Always redirect after completion
      }
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
      else {
        showAlert(data.message, "Success");
        setTimeout(() => {
          hideAlert();
        }, 3000);
      }
    } catch (error) {

      console.log("err", error);
      if (error.response) {
        if (error.response.status === 400) {
          showAlert(error.response.data.message || "Le fichier a déjà été téléchargé.", "Error");
        } else if (error.response.status === 401) {
          showAlert("Veuillez autoriser l'accès à Google Drive", "Error");
          setDriveAuth(false);
        }

        else if (error.response.status === 422) {
          console.log("422 error", error.response.data.errors);
          showAlert(error.response.data.message || "Le fichier a déjà été téléchargé.", "Error");
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

  const handlePreview = async (driveId, fileName, isProcessed) => {
    hideAlert();

    // Validate invoice date is selected
    if (!isProcessed && !invoiceDate) {
      showAlert("Veuillez sélectionner une date de facture avant de traiter le fichier.", "Error");
      setTimeout(() => {
        hideAlert();
      }, 3000);
      return;
    }

    // Validate invoice date is not in future
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    if (invoiceDate && invoiceDate > today) {
      showAlert("La date de facture ne peut pas être dans le futur.", "Error");
      setTimeout(() => {
        hideAlert();
      }, 3000);
      return;
    }

    console.log('🚀 Starting file processing...');
    console.log('📡 Socket ID being sent to backend:', socket?.id);
    console.log('🔌 Socket connected status:', socket?.connected);

    try {
      console.log('🚀 About to send invoice processing request');
      console.log('Socket object:', socket);
      console.log('Socket ID being sent:', socket?.id);
      console.log('Socket connected:', socket?.connected);
      setActiveFileId(driveId);
      localStorage.setItem('activeFileId', driveId);
      if (isConnected) {
        subscribeToFile(driveId);
      }

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

      // Format date as dd/mm/yyyy string
      let formattedDate =format(new Date(), "dd/MM/yyyy");
      if(!isProcessed)formattedDate= format(invoiceDate, "dd/MM/yyyy");

      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/process/${driveId}`, {
        fileName,
        invoiceDate: formattedDate, // Pass formatted date to backend
      });
      setDriveAuth(true);

      if (data.statusCode === 202 || data.statusCode === 409) {
        // Reset date after successful submission
        setInvoiceDate(null);
        setSelectedFileId(null);
        return;
      }

      // Process regular success response
      const summary = data.summary;

      if (data.statusCode === 200) {
        showAlert(data.message, "Success");
        setTimeout(() => {
          hideAlert();
        }, 6200);
        setInvoiceData(summary);
        localStorage.removeItem('activeFileId');
        setProgress((p) => ({ ...p, isVisible: false }));
        router.push(`/admin/invoice/${driveId}`);

        setProgress(prev => ({ ...prev, isVisible: false }));
        hideLoader();
        router.push(`/admin/invoice/${driveId}`);

        // Reset date after successful processing
        setInvoiceDate(null);
        setSelectedFileId(null);
      } else {
        showAlert(data.message, 'Error');
        setTimeout(() => {
          hideAlert();
        }, 5000);
        setProgress(prev => ({ ...prev, isVisible: false }));
      }
    } catch (error) {
      console.log(error);
      setProgress(prev => ({ ...prev, isVisible: false }));
      hideLoader();

      // Handle specific error cases
      if (error?.response?.status === 401) {
        showAlert("Veuillez autoriser l'accès à Google Drive", "Error");
        setDriveAuth(false);
      } else if (error?.response?.status === 409) {
        // Another file is being processed
        const message = error.response.data?.message || "Un autre fichier est en cours de traitement.";
        showAlert(message, "Warning");
      } else if (error?.response?.status === 500) {
        hideLoader();
        showAlert(error.response.data?.cause ? error.response.data.cause : "Something went wrong while processing the file", "Error");
      } else {
        showAlert("Something went wrong while processing the file", "Error");
      }

      setTimeout(() => {
        hideAlert();
      }, 5000);
    }
  };

  const downloadInvoice = async (item) => {
    const { fileName } = item;
    const { parentFolderId } = item;
    const { isProcessed } = item;
    if (!isProcessed) {
      showAlert("Veuillez prévisualiser le fichier avant de le télécharger", 'Error');
      setTimeout(() => {
        hideAlert();
      }, 3000);
      return;
    }

    try {
      showLoader('Téléchargement des factures...');
      console.log('Downloading data...');
      console.log('fileName:', fileName);
      console.log('parentFolderId:', parentFolderId);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/download`, {
        fileName,
        parentFolderId,
        // We no longer need to specify csvFolderId and pdfFolderId as we're downloading the entire folder structure
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
    console.log('Opening Google Drive folder...', process.env.NEXT_FOLDER_ID);
    window.open(`https://drive.google.com/drive/folders/${process.env.NEXT_PUBLIC_FOLDER_ID}`);
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

  const handlePreviousClick = () => {
    if (startIndex > 0) {
      setPageNo(pageNo - 1);
      setStartIndex(startIndex - rowPerPage);
      setEndIndex(endIndex - rowPerPage);
    }
  };

  const handleNextClick = () => {
    if (endIndex < filteredFiles?.length) {
      setPageNo(pageNo + 1);
      setStartIndex(startIndex + rowPerPage);
      setEndIndex(endIndex + rowPerPage);
    }
  };

  const totalPages = Math.ceil((filteredFiles?.length || 0) / rowPerPage);

  if (!hasMounted) {
    return null;
  }
  const isAnyFileProcessing = uploadedFiles?.some(file => file.isProcessing);
  return (
    <div className="flex flex-col h-screen pr-6 pb-3">
      {/* Custom Notification */}
      <CustomNotification
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
        duration={5000}
      />

      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-gray-900 font-semibold text-xl lg:text-2xl mb-2">
              Fichiers téléchargés
            </h1>
            <p className='text-gray-600 text-sm leading-relaxed'>
              Cliquez sur Aperçu pour afficher les détails de la facture
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={authenticate}
              disabled={isAnyFileProcessing}
              className={`px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 shadow-sm text-sm ${isAnyFileProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Authentifier
            </button>
            <button
              className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm text-sm ${isLoading || isAnyFileProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleUploadClick}
              disabled={isLoading || isAnyFileProcessing}
            >
              <Upload size={16} />
              <span className="hidden sm:inline">Téléverser un fichier</span>
              <span className="sm:hidden">Upload</span>
              <input
                type="file"
                className='hidden'
                ref={inputFileRef}
                onChange={handleChange}
                accept=".csv, .xlsx"
              />
            </button>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
              <input
                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Rechercher un fichier..."
                disabled={isLoading}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  className={`h-10 px-3 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isLoading || isAnyFileProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={isLoading || isAnyFileProcessing}
                >
                  <option value="all">Tous les ans</option>
                  {[...new Set(uploadedFiles?.map(file => dayjs(file.updatedAt).year()))].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                <select
                  className={`h-10 px-3 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isLoading || isAnyFileProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  disabled={isLoading || isAnyFileProcessing}
                >
                  <option value="all">Tous les mois</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>{dayjs().month(month - 1).format('MMMM')}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm text-sm ${isLoading || isAnyFileProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => setShowTarrifDialog(true)}
                  disabled={isLoading || isAnyFileProcessing}
                >
                  <span className="hidden sm:inline">Gérer Tarif</span>
                  <span className="sm:hidden">Tarif</span>
                </button>
                <TarrifDialog open={showTarrifDialog} onClose={() => setShowTarrifDialog(false)} />

                <Button
                  onClick={openInDrive}
                  className="px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors duration-200 shadow-sm text-sm"
                  disabled={isLoading}
                >
                  <Image src={driveIcon} alt="Drive Icon" className="w-4 h-4" />
                  <span className="hidden sm:inline">Afficher dans Drive</span>
                  <span className="sm:hidden">Drive</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Files Content - Scrollable area */}
      <div className='flex-1 min-h-0 overflow-y-auto px-4 py-4'>
        {filteredFiles?.slice(startIndex, endIndex).map((item, index) => (
          <div key={index} className="flex items-center gap-7 self-stretch files mt-[20px]">
            <div className={`flex justify-between w-full rounded-lg p-2 space-y-4 border-black shadow-custom 
              ${item.isProcessed
                ? 'bg-blue-600 border-l-4 border-l-blue-300' // Darker blue with indicator border for processed files
                : item.isProcessing
                  ? 'bg-orange-600 border-l-4 border-l-orange-300' // Orange for files being processed
                  : 'bg-uploadContainerBg-200' // Original color for unprocessed files
              }`}>
              <div className='flex mainContainer flex-grow space-y-4'>
                <div className='w-full space-y-3'>
                  {item.isProcessed && (
                    <div className="flex items-center justify-between">
                      <div className='flex items-center'>
                      <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                      <span className="text-blue-300 text-xs font-medium">Déjà traité</span>
                      </div>
                        <div className="text-white text-xs font-extrabold bg-white/20 px-2 py-1 rounded">
                            Date sélectionnée :  {item.invoiceDate? item.invoiceDate : 'Date de facture non définie'}
                            </div>
                    </div>
                  )}
                  {item.isProcessing && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-orange-300 mr-2 animate-pulse"></div>
                      <span className="text-orange-300 text-xs font-medium">En traitement...</span>
                    </div>
                  )}
                  <h1 className='text-white font-archivo text-lg font-semibold leading-6'>{item.fileName}</h1>
                  <h2 className='text-white font-syne text-base font-normal leading-4'>
                    dernière modification {dayjs(item.updatedAt).format('DD MMM YYYY')} {dayjs(item.updatedAt).format('HH:mm:ss')}
                  </h2>
                  <div className='flex justify-between'>
                    <div className="flex items-center gap-3">
                      <a
                        href={item.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className='text-white font-archivo text-sm font-normal leading-4 underline'
                      >
                        Ouvrir dans Drive
                      </a>

                      {/* Calendar icon for unprocessed files only */}
                      {!item.isProcessed && !item.isProcessing && (
                        <>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                className={`p-1 hover:bg-white/10 rounded transition-colors ${isLoading || isAnyFileProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading || isAnyFileProcessing}
                                aria-label="Select invoice date"
                                onClick={() => setSelectedFileId(item.driveId)}
                              >
                                <CalendarDays size={16} color="#ffffff" strokeWidth={2.25} />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={selectedFileId === item.driveId ? invoiceDate : null}
                                onSelect={(date) => {
                                  setInvoiceDate(date);
                                  setSelectedFileId(item.driveId);
                                }}
                                disabled={(date) => date > new Date()}
                                initialFocus
                                locale={fr}
                              />
                            </PopoverContent>
                          </Popover>

                          {/* Show selected date */}
                        
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handlePreview(item.driveId, item.fileName, item.isProcessed)}
                      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        font-archivo text-sm font-medium
        transition-all duration-200
        ${item.isProcessed
                          ? 'bg-blue-500  text-white'
                          : item.isProcessing
                            ? 'bg-orange-500 cursor-not-allowed text-white'
                            : (selectedFileId === item.driveId && invoiceDate)
                              ? 'bg-white hover:bg-gray-50 text-blue-600 hover:text-blue-700'
                              : 'bg-gray-300 cursor-not-allowed text-gray-500'
                        }
        ${(isLoading || isAnyFileProcessing) && !item.isProcessing
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                        }
        relative right-[500px] shadow-sm
      `}
                      disabled={
                        isLoading ||
                        item.isProcessing ||
                        isAnyFileProcessing ||
                        (!item.isProcessed && (!invoiceDate || selectedFileId !== item.driveId))
                      }
                    >
                      {item.isProcessed ? (
                        <>
                          <span>Suivant</span>
                          <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                        </>
                      ) : item.isProcessing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>En traitement...</span>
                        </>
                      ) : (
                        <>
                          <Eye size={16} />
                          <span>Traiter</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 relative top-[14px] left-1">
                {item.isProcessed ? (
                  // Show download button only for processed files
                  <button
                    onClick={() => downloadInvoice(item)}
                    disabled={isLoading || isAnyFileProcessing}
                    className={`h-fit ${isLoading || isAnyFileProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Download invoice"
                  >
                    <Download size={20} color="#ffffff" strokeWidth={2.25} />
                  </button>
                ) : item.isProcessing ? (
                  // Show processing indicator
                  <div className="h-fit">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  </div>
                ) : (
                  // Show delete button only for unprocessed files
                  <button
                    onClick={() => handleDelete(item.driveId)}
                    disabled={isLoading || isAnyFileProcessing}
                    className={`h-fit ${isLoading || isAnyFileProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Delete file"
                  >
                    <Trash2 size={20} color="white" strokeWidth={2.25} />
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      <div className="flex-shrink-0 z-30">
        <div className="flex items-center justify-around py-4 px-6">
          {/* Left side info */}
          <div className="flex items-center w-full gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
              <span className="text-gray-700 text-sm font-semibold">
                Total: {filteredFiles?.length || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
              <span className="text-gray-700 text-sm font-semibold">
                Traités: {filteredFiles?.filter(f => f.isProcessed).length || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></div>
              <span className="text-gray-700 text-sm font-semibold">
                Non traités: {filteredFiles?.filter(f => !f.isProcessed).length || 0}
              </span>
            </div>
          </div>

          {/* Right side pagination */}
          <Pagination className="w-fit">
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  className={`rounded-lg px-3 py-2 text-sm border transition-all duration-200 ${startIndex === 0
                    ? "pointer-events-none opacity-40 bg-gray-50 text-gray-400 border-gray-200"
                    : "hover:bg-gray-100 bg-white text-gray-700 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow"
                    }`}
                  onClick={handlePreviousClick}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (pageNo <= 3) {
                  pageNumber = i + 1;
                } else if (pageNo >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = pageNo - 2 + i;
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      className={`px-3 py-2 rounded-lg text-sm border transition-all duration-200 ${pageNumber === pageNo
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow"
                        }`}
                      onClick={(e) => {
                        e.preventDefault();
                        const newStartIndex = (pageNumber - 1) * rowPerPage;
                        const newEndIndex = newStartIndex + rowPerPage;
                        setPageNo(pageNumber);
                        setStartIndex(newStartIndex);
                        setEndIndex(newEndIndex);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  className={`rounded-lg px-3 py-2 text-sm border transition-all duration-200 ${endIndex >= (filteredFiles?.length || 0)
                    ? "pointer-events-none opacity-40 bg-gray-50 text-gray-400 border-gray-200"
                    : "hover:bg-gray-100 bg-white text-gray-700 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow"
                    }`}
                  onClick={handleNextClick}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>


      <UploadErrorsDialog
        errors={uploadErrors}
        open={showErrorsDialog}
        onClose={() => setShowErrorsDialog(false)}
      />
      <InvoiceProgressOverlay isVisible={progress.isVisible} progress={progress} />
    </div>
  );

}

export default Uploads;