import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { ArrowUp, ArrowLeft, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from './DatePicker';
import { useFileNameStore, useCsvFolderIdStore, useParentFolderIdStore, usePdfFolderIdStore, useUpdatedInvoiceTime } from '../store/invoiceIdsStore';
import useLoaderStore from '../store/loaderStore';
import { useAlertMessage } from '../store/alertStore';
import { useRouter } from 'next/navigation';
import { useInvoiceData } from '../store/invoiceDataStore';
import useFilteredInvoiceDataStore from '../store/FilteredInvoiceStore.js';
import { useDateStore } from '../store/filteredDateStore';

const downloadData = async () => {
    const { fileName } = useFileNameStore.getState();
    const { parentFolderId } = useParentFolderIdStore.getState();
    const { csvFolderId } = useCsvFolderIdStore.getState();
    const { pdfFolderId } = usePdfFolderIdStore.getState();
    const { showLoader, hideLoader } = useLoaderStore.getState();
    const { showAlert, hideAlert } = useAlertMessage.getState();

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

function Header({ isInvoice, parentFolderId }) {
    const { fileName } = useFileNameStore();
    const { updatedAt, setupdatedAt } = useUpdatedInvoiceTime();
    const { invoiceData } = useInvoiceData();
    const { setFilteredInvoiceData } = useFilteredInvoiceDataStore();
    const router = useRouter();
    const isLoading = useLoaderStore((state) => state.isLoading);
    const { date, setDate } = useDateStore();

    const [searchTerm, setSearchTerm] = useState('');

    // Function to format the date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const handleBack = () => {
        router.push('/admin/uploads');
    };

    const handleDownload = useCallback(() => {
        downloadData();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        filterInvoices(e.target.value,date);
    };
        const openInDrive = () => {
        if (parentFolderId !== null) {
            window.open(`https://drive.google.com/drive/folders/${parentFolderId}`);
        }
    };

    const filterbyDate= (date)=>{

        filterInvoices(searchTerm, date);
    }

    const filterInvoices = (searchTerm, selectedDate) => {
        if (!invoiceData) return;
        
        let filteredData = invoiceData;
        if (searchTerm) {
            const searchTermLower = searchTerm.toLowerCase();
            const searchTermNumber = Number(searchTerm);
            filteredData = filteredData.filter(invoice =>
                invoice.customerName.toLowerCase().includes(searchTermLower) ||
                invoice.accountNo === searchTermNumber ||
                invoice.codePennylane.toLowerCase().includes(searchTermLower) ||
                invoice.designation.toLowerCase().includes(searchTermLower) ||
                invoice.Transactiondate.toLowerCase().includes(searchTermLower) ||
                invoice.TVA.toString().toLowerCase().includes(searchTermLower) ||
                invoice.HT.toString().toLowerCase().includes(searchTermLower) ||
                invoice.TTC.toString().toLowerCase().includes(searchTermLower)
            );
        }
    
        if (selectedDate && selectedDate.from && selectedDate.to) {
            const fromDate = new Date(selectedDate.from);
            fromDate.setHours(0, 0, 0, 0);

            const toDate = new Date(selectedDate.to);
            toDate.setHours(23, 59, 59, 999);

            filteredData = filteredData.filter(invoice => {
                // Parse DD/MM/YYYY to Date
                const [day, month, year] = invoice.Transactiondate.split('/').map(Number);
                const transactionDate = new Date(year, month - 1, day);
                transactionDate.setHours(0, 0, 0, 0);
                return transactionDate >= fromDate && transactionDate <= toDate;
            });
        }
    
        setFilteredInvoiceData(filteredData);
    };
return (
    <div className="space-y-4">
        {/* Title Section */}
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3'>
            <div className='flex-1 min-w-0'>
                <div className='flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6'>
                    <h3 className="text-2xl font-bold text-violet-gray-900 font-archivo truncate">
                        {fileName?.length > 35 ? `${fileName.substring(0, 35)}...` : fileName}
                    </h3>
                    <div className='flex items-center gap-2'>
                        <div className='hidden lg:block w-px h-5 bg-gray-300'></div>
                        <h3 className='text-lg font-semibold text-gray-700 font-archivo'>
                            Résumé de la facture
                        </h3>
                    </div>
                </div>
                <p className='text-gray-600 font-archivo mt-2'>
                    Sélectionnez Client pour afficher les détails
                </p>
            </div>
            
            <div className='flex flex-wrap items-center gap-2 px-4'>
                <Button size="sm" className="bg-downloadButton-200 text-white hover:bg-downloadButton-300 transition-colors text-xs px-3 py-2">
                    <ArrowUp className='mr-1' size={14} strokeWidth={2} />
                    <span className="hidden sm:inline">Mise à jour:</span>
                    <span className="font-medium ml-1">{formatDate(updatedAt)}</span>
                </Button>
                <Button size="sm" className="bg-downloadButton-200 text-white hover:bg-downloadButton-300 transition-colors text-xs px-8 py-2" onClick={handleBack}>
                    <ArrowLeft className='mr-1' size={14} strokeWidth={2} />
                    Retour
                </Button>
            </div>
        </div>


<div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
  
  {/* Search bar */}
  <div className="flex items-center flex-1 max-w-sm h-10 border border-gray-300 rounded-md bg-white px-3">
    <Search size={14} className="text-gray-500 mr-2" strokeWidth={2} />
    <input
      type="text"
      className="w-full text-sm placeholder-gray-500 focus:outline-none"
      placeholder="Recherche..."
      value={searchTerm}
      onChange={handleSearch}
    />
  </div>

  {isInvoice && (
    <div className="flex flex-1 items-center gap-3">
      
      {/* Date Picker */}
      <div className="flex h-10 flex-1 max-w-xs">
        <DatePicker className="h-full w-full text-sm" filter={filterbyDate} />
      </div>

      {/* Action Buttons (pushed to right) */}
      <div className="flex items-center gap-2 ml-auto">
   
        
        <Button
          className="bg-downloadButton-200 text-white hover:bg-downloadButton-300 transition-colors h-10 px-4 text-sm flex items-center"
          onClick={openInDrive}
        >
         Ouvrir dans Drive
        </Button>
             <Button
          className="bg-downloadButton-200 text-white hover:bg-downloadButton-300 transition-colors h-10 px-4 text-sm flex items-center"
          onClick={handleDownload}
          disabled={isLoading}
        >
          <Download className="mr-1" size={14} strokeWidth={2} />
          Télécharger
        </Button>
      </div>
    </div>
  )}
</div>


    </div>
);
}

export default Header;
