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
  const { invoiceData, setInvoiceData } = useInvoiceData();
  const router = useRouter();
  const { showLoader, hideLoader, isLoading } = useLoaderStore();

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

      showAlert(data.message, "Success");
      setTimeout(() => {
        hideAlert();
      }, 3000);
    } catch (error) {
      console.log("err", error);
      if (error.response?.status == 401) {
        showAlert("Please authorize to Gooole Drive", "Error");
      }
      else{
        showAlert("Network Error, Please Try Again Later", "Error");
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
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/process/${driveId}`, { fileName });
      console.log("processed data", data)
      const summary = data.summary; // Extracting the summary array

      if (data.statusCode === 200) {
        showAlert(data.message, "Success");
        setTimeout(() => {
          hideAlert();
        }, 6200);
        setInvoiceData(summary); // Setting the invoice data to the summary array
        router.push(`/admin/invoice/${driveId}`);
      } else {
        showAlert(data.message, 'Error');
        setTimeout(() => {
          hideAlert();
        }, 5000);
      }
    } catch (error) {
      console.log(error);
      if (error?.response?.status == 401) {
        showAlert("Please Authorize to google drive", "Error");

      }
      else {

        showAlert("Something went wrong while processing the file", "Error");
      }
      setTimeout(() => {
        hideAlert();
      }, 5000);
    } finally {
      hideLoader();
    }
  };

  const downloadInvoice = async (item) => {
    const { fileName } = item;
    const { parentFolderId } = item;
    const { csvFolderId } = item;
    const { pdfFolderId } = item;
    const { isProcessed } = item;
    if (!isProcessed) {
      showAlert("Veuillez traiter le fichier avant de le télécharger", 'Error');
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

  return (
    <div className='pt-2 pr-2 pl-3 flex flex-col '>
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
          <button onClick={authenticate} className='relative left-40  rounded-lg border-2 p-2 border-violet-gray-100  w-fit bg-white text-violet-gray-900 font-archivo font-semibold'>Authentifier</button>
          <button
            className=" relative right-14 rounded-xl px-2 py-1 bg-uploadContainerBg-200 flex justify-center items-center text-white font-semibold  cursor-pointer"
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
              accept=".csv"
            />
          </button>
        </div>
        {/* search bar, date picker, download invoice */}
        <div className='mt-3 h-14 flex justify-between relative pr-7'>
          <Search className='absolute top-1 left-3' size={18} color="#403A44" strokeWidth={1.75} />
          <input
            className='searchField h-8'
            placeholder='Recherche'
            disabled={isLoading}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Update search term on change
          />

          {/* filters */}
          <div className="text-lg flex self-start gap-4 relative right-32">
            <select className='selectFilter' onChange={(e) => setSelectedYear(e.target.value)} disabled={isLoading}>
              <option className='font-semibold' value="all">Tous les ans</option>
              {[...new Set(uploadedFiles?.map(file => dayjs(file.updatedAt).year()))].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select className='selectFilter' onChange={(e) => setSelectedMonth(e.target.value)} disabled={isLoading}>
              <option className='font-semibold' value="all">Tous les mois</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{dayjs().month(month - 1).format('MMMM')}</option>
              ))}
            </select>
          </div>
          <Button onClick={openInDrive} className="relative right-8 rounded-lg border-2 border-violet-gray-100 h-8 w-fit bg-white text-violet-gray-900 text-sm hover:bg-slate-50 pointer" disabled={isLoading}>
            <Image src={driveIcon} alt="Drive Icon" className="w-5 h-5 mr-1" />
            Afficher tous les fichiers dans Drive
          </Button>
        </div>

      </div>
      {/* files */}
      <div className='h-[550px] overflow-y-scroll no-scrollbar'>
        {filteredFiles?.map((item, index) => (

          <div key={index} className="flex items-center gap-7 self-stretch files mt-[20px]">
            <div className='flex justify-between w-[1150px] bg-uploadContainerBg-200 rounded-lg p-2 space-y-4 border-black shadow-custom'>
              <div className='flex mainContainer flex-grow space-y-4'>
                <div className='w-full space-y-3'>
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
                      className='text-white font-archivo text-sm font-normal leading-4 underline relative right-[500px]'
                      disabled={isLoading}
                    >
                      Aperçu
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={() => downloadInvoice(item)} className='h-fit relative top-[14px] left-1'>
                <Download size={20} color="#ffffff" strokeWidth={2.25} />
              </button>
            </div>

            
            <button onClick={() => handleDelete(item.driveId)} className="icons" disabled={isLoading}>
              <Trash2 size={20} color="#6f6a73" strokeWidth={2.25} />
            </button>
          
          </div>
        ))}
      </div>
    </div>

  )
}

export default Uploads;