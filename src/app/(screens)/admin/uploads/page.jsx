'use client'
import React, { useRef, useEffect, useState } from 'react';
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

function Uploads({ isInvoice = true }) {
  const [newFile, setNewFile] = useState();
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
    }
  };

  const processFile = async () => {
    try {
      const formData = new FormData();
      formData.append("file", newFile);
      showLoader("Téléchargement du fichier, veuillez patienter...");
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/savefile/`, formData);
      console.log(data);
      addFile(data.allFiles);

      showAlert(data.message, "Success");
      setTimeout(() => {
        hideAlert();
      }, 3000);
    } catch (error) {
      console.log("err",error);
      showAlert(error.response.data.message, "Error");
      setTimeout(() => {
        hideAlert();
      }, 5000);
    } finally {
      hideLoader();
    }
  };

  const handleChange = (event) => {
    const selectedFile = event.target.files?.[0];
    console.log("file ", selectedFile);
    if (!selectedFile) {
      console.log("No file selected.");
      return;
    }
    setNewFile(selectedFile);
  };

  // const fetchData = async () => {
  //   const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/getallfiles`);
  //   console.log(data.allFiles);
  //   addFile(data.allFiles);
  //   console.log(uploadedFiles);
  // }

  const handleDelete = async (driveId) => {
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
    }
    catch (error) {
      console.log(error);
      showAlert(error.response.data.message, "Error");
    } finally {
      setTimeout(() => {
        hideAlert();
      }, 3000);

      hideLoader();
    }
  };

  const handlePreview = async (driveId, fileName) => {

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
      showAlert(error.message, "Error");
      setTimeout(() => {
        hideAlert();
      }, 5000);

    } finally {
      hideLoader();
    }
  };

  const openInDrive = () => {
    window.open(`https://drive.google.com/drive/folders/1gCTxY8KsOkMPGT5K-WUoTxS2rQypV2Je`);

  };

  useEffect(() => {
    if (newFile) {
      processFile();
    }
  }, [newFile]);

  // useEffect(() => {
  //   console.log("Updated uploadedFiles state: ", uploadedFiles);
  // }, [uploadedFiles]);



  return (
    <div className='pt-2 pr-2 pl-3 flex flex-col '>
      <div className="header flex flex-col w- ">
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
          <button
            className="rounded-xl px-2 py-1 bg-uploadContainerBg-200 flex justify-center items-center text-white font-semibold mr-7 cursor-pointer"
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
        <div className='mt-3 flex justify-between relative pr-7'>
          <Search className='absolute top-1 left-3' size={18} color="#403A44" strokeWidth={1.75} />
          <input className='searchField' placeholder='Recherche' disabled={isLoading} />

          <Button onClick={openInDrive} className="rounded-lg border-2 border-violet-gray-100 h-8 w-fit bg-white text-violet-gray-900 text-sm hover:bg-slate-50 pointer" disabled={isLoading}>
            <Image src={driveIcon} alt="Drive Icon" className="w-5 h-5 mr-1" />
            Afficher tous les fichiers dans Drive
          </Button>
        </div>
      </div>
      {/* files */}
      <div className='h-[550px] overflow-y-scroll no-scrollbar'>
        {uploadedFiles?.map((item, index) => (
          <div key={index} className="flex items-center gap-7 self-stretch files mt-[20px]">
            <div className='flex flex-col w-[1150px] bg-uploadContainerBg-200 rounded-lg p-2 space-y-4 border-black shadow-custom'>
              <div className='space-y-2'>
                <h1 className='text-white font-archivo text-lg font-semibold leading-6'>{item.fileName}</h1>
                <h2 className='text-white font-syne text-base font-normal leading-4'>
                  dernière modification {item.createdAt}
                </h2>
                <a
                  href={item.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='text-white font-archivo text-sm font-normal leading-4 underline'
                >
                  Ouvrir dans Drive
                </a>
              </div>
              <button
                onClick={() => handlePreview(item.driveId, item.fileName)}
                className='text-white font-archivo text-sm font-normal leading-4 underline'
                disabled={isLoading}
              >
                Aperçu
              </button>
            </div>
            {!item.isProcessed && (
                <button onClick={()=>handleDelete(item.driveId)}  className="icons" disabled={ isLoading}>
                <Trash2 size={20} color="#6f6a73" strokeWidth={2.25} />
              </button>

              )}
           {/* <button onClick={()=>handleDelete(item.driveId)}  className="icons" disabled={ isLoading}>
                <Trash2 size={20} color="#6f6a73" strokeWidth={2.25} />
              </button> */}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Uploads;
