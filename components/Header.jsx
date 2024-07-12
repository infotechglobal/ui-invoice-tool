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

function Header({ isInvoice }) {
    const { fileName } = useFileNameStore();
    const { updatedAt, setupdatedAt } = useUpdatedInvoiceTime();
    const { invoiceData } = useInvoiceData();
    const { setFilteredInvoiceData } = useFilteredInvoiceDataStore();
    const router = useRouter();
    const isLoading = useLoaderStore((state) => state.isLoading);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);

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
        filterInvoices(e.target.value, selectedDate);
    };

    const handleDatePick = (date) => {
        console.log('Selected date:', date);
        setSelectedDate(date);
        filterInvoices(searchTerm, date);
    };

    const filterInvoices = (searchTerm, selectedDate) => {
        if (!invoiceData) return;
        
        let filteredData = invoiceData;
        
      if (searchTerm) {
    const searchTermNumber = Number(searchTerm);
    filteredData = filteredData.filter(invoice => 
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.accountNo === searchTermNumber ||
        invoice.codePennylane.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.Transactiondate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.TVA.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.HT.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.TTC.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

        }

        if (selectedDate) {
            filteredData = filteredData.filter(invoice => 
                new Date(invoice.date).toDateString() === new Date(selectedDate).toDateString()
            );
        }

        setFilteredInvoiceData(filteredData);
    };

    return (
        <div className="header flex flex-col">
            <div className='flex justify-between'>
                <div className='flex items-end min-w-[600px] justify-between'>
                    <h3 className="text-violet-gray-900 font-archivo text-[35px] font-bold leading-[32px] normal-font-style">
                        {fileName}
                    </h3>
                    <h3 className='font-archivo ml-3 mt-1 text-lg font-semibold'>
                        Résumé de la facture
                    </h3>
                </div>
                <div className='flex items-end'>
                    <Button size="btn" className="bg-downloadButton-200 h-6">
                        <ArrowUp className='mr-2 mt-0' size={16} color="#f6faff" strokeWidth={3} />
                        Dernière mise à jour : {formatDate(updatedAt)}
                    </Button>
                    <Button size="btn" className="bg-downloadButton-200 h-6 ml-3" onClick={handleBack}>
                        <ArrowLeft className='mr-2 mt-0' size={16} color="#f6faff" />Retourner
                    </Button>
                </div>
            </div>
            <div className='mt-1'>
                <h3 className='text-violet-gray-800 font-archivo text-custom-18 font-normal leading-custom-24'>Sélectionnez Client pour afficher les détails</h3>
            </div>
            <div className='mt-3 flex justify-between relative'>
                <Search className='absolute top-1 left-3' size={18} color="#403A44" strokeWidth={1.75} />
                <input 
                    className='searchField' 
                    placeholder='Recherche'
                    value={searchTerm}
                    onChange={handleSearch}
                />
                {isInvoice ? (
                    <>
                        <div className='flex relative right-40'>
                            <DatePicker className={"h-4"} onDateChange={handleDatePick} />
                        </div>
                        <Button className="bg-downloadButton-200 h-7" onClick={handleDownload} disabled={isLoading}>
                            <Download className='mr-2 mt-0' size={16} color="#f6faff" />Télécharger des données
                        </Button>
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default Header;
