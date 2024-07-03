"use client"

import React, { useRef, useEffect, useState } from 'react'
import Header from '../../../../../components/Header'
import { ArrowLeft, ArrowUp, Download, Search, Trash2, Upload } from 'lucide-react'
import { sampleFiles } from '../../../../../src/lib/assets'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DatePicker } from '../../../../../components/DatePicker'
import { usefileAlert, useAlertMessage } from '../../../../../store/alertStore'
import { useFileStore } from '../../../../../store/uploadedFilesStore'
import { useInvoiceData } from '../../../../../store/invoiceDataStore'
import axios from 'axios'
import { useRouter } from 'next/navigation';



function Uploads({ isInvoice = true }) {
  const [newFile, setNewFile] = useState();
  const addFile = useFileStore((state) => state.addNewFiles);
  const toggleLoad = usefileAlert((state) => state.toggleState);
  const showAlert = useAlertMessage((state) => state.showAlert);
  const uploadedFiles = useFileStore((state) => state.uploadedFiles);
  const inputFileRef = useRef(null);
  const { invoiceData, setInvoiceData } = useInvoiceData();
  const router = useRouter(); // Initialize the useRouter hook


  const handleUploadClick = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };


  const processFile = async () => {
    try {
      const formData = new FormData();
      formData.append("file", newFile);
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/savefile/`, formData);
      console.log(data);
      addFile(data.allFiles);
      showAlert(data.message, "success");
      toggleLoad();
    } catch (error) {
      console.log(error);
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

  const fetchData = async () => {
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/getallfiles`);
    console.log(data.allFiles);

    addFile(data.allFiles)
    console.log(uploadedFiles);
  }

  const handlePreview = async (driveId, fileName) => {
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/process/${driveId}`, { fileName });
      console.log(data);

      const summary = data.summary; // Extracting the summary array

      if (data.statusCode === 200) {
        showAlert(data.message);
        setInvoiceData(summary); // Setting the invoice data to the summary array
        router.push(`/admin/invoice/${driveId}`);
      } else {
        showAlert(data.message, 'error');
      }
    } catch (error) {
      console.log(error);
      showAlert('Failed to process the file', 'error');
    }
  };

  useEffect(() => {
    if (newFile) {
      processFile();
    }
  }, [newFile]);

  useEffect(() => {
    console.log("Updated uploadedFiles state: ", uploadedFiles);
  }, [uploadedFiles]);

  useEffect(() => {
    fetchData();
  }, [])

  return (
    <div className='pt-2 pr-2 pl-3 flex flex-col '>
      <div className="header flex flex-col w- ">
        <div className='flex justify-between'>
          <div>
            <h3 className="text-violet-gray-900 font-archivo text-[28px] font-bold leading-[32px] normal-font-style">
              Nom du fichier 1
            </h3>
          </div>
        </div>
        {/* select client */}
        <div className='mt-1 flex justify-between'>
          <h3 className='text-violet-gray-800 font-archivo text-custom-18 font-normal leading-custom-24'>
            Sélectionnez Client pour afficher les détails
          </h3>
          <div
            className="rounded-xl px-2 py-1 bg-uploadContainerBg-200 flex justify-center items-center text-black font-semibold mr-7 cursor-pointer"
            onClick={handleUploadClick}
          >
            Téléverser un fichier
            <Upload className="" size={16} />
            <input
              type="file"
              name=""
              id="inputFile"
              className='hidden'
              ref={inputFileRef}
              onChange={handleChange}
              accept=".csv"
            />
          </div>
        </div>
        {/* search bar, date picker, download invoice */}
        <div className='mt-3 flex justify-between relative pr-7'>
          <Search className='absolute top-1 left-3' size={18} color="#403A44" strokeWidth={1.75} />
          <input className='searchField' placeholder='Recherche'></input>
          <Button className="rounded-lg border-2 border-violet-gray-100 h-7 bg-white text-violet-gray-900">
            <Download className='mr-2 mt-0' size={16} color="black" />Télécharger des données
          </Button>
        </div>
      </div>
      {/* files */}
      <div className='h-[550px] overflow-y-scroll no-scrollbar'>
        {uploadedFiles?.map((item, index) => (
          <div key={index} className="flex items-center gap-7 self-stretch files mt-[20px]">
            <div className='flex flex-col w-[1150px] bg-uploadContainerBg-200 rounded-lg p-2 space-y-4 border-black shadow-custom'>
              <div className='space-y-2'>
                <h1 className='text-white font-archivo text-lg font-semibold leading-6'>{item.filename}</h1>
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
              <button onClick={() => handlePreview(item.driveId, item.filename)} className='text-white font-archivo text-sm font-normal leading-4 underline'>
                Aperçu
              </button>
            </div>
            <div className="icons">
              <Trash2 size={20} color="#6f6a73" strokeWidth={2.25} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Uploads
