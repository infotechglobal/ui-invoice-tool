import React, { useCallback } from 'react';
import axios from 'axios';
import { ArrowUp, ArrowLeft, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from './DatePicker';
import { useFileNameStore, useCsvFolderIdStore, useParentFolderIdStore, usePdfFolderIdStore } from '../store/invoiceIdsStore';

const downloadData = async (fileName, parentFolderId, csvFolderId, pdfFolderId) => {
    try {
        console.log('Downloading data...');
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/download`, {
            fileName,
            parentFolderId,
            csvFolderId,
            pdfFolderId,
        }, {
            responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/zip' });

        // Call saveFile directly within the downloadData function
        await saveFile(blob, fileName);

    } catch (error) {
        console.error('Error downloading data:', error);
    }
};

const saveFile = async (blob, fileName) => {
    if ('showSaveFilePicker' in window) {
      
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: `${fileName}.zip`,
                types: [{
                    description: 'ZIP Archive',
                    accept: { 'application/zip': ['.zip'] },
                }],
            });
            console.log("checkpoint1")
            const writable = await handle.createWritable();
           

            await writable.write(blob);
            

            await writable.close();
            


            console.log('File saved successfully');
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
    console.log('Falling back to anchor download');
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
    const { parentFolderId } = useParentFolderIdStore();
    const { csvFolderId } = useCsvFolderIdStore();
    const { pdfFolderId } = usePdfFolderIdStore();

    const handleDownload = useCallback(() => {
        // Invoke downloadData directly in the user gesture handler
        downloadData(fileName, parentFolderId, csvFolderId, pdfFolderId);
    }, [fileName, parentFolderId, csvFolderId, pdfFolderId]);

    return (
        <div className="header flex flex-col">
            <div className='flex justify-between'>
                <div>
                    <h3 className="text-violet-gray-900 font-archivo text-[28px] font-bold leading-[32px] normal-font-style">
                        {fileName}
                    </h3>
                </div>
                <div className='flex items-end'>
                    <Button size="btn" className="bg-downloadButton-200 h-6">
                        <ArrowUp className='mr-2 mt-0' size={16} color="#f6faff" strokeWidth={3} />
                        Dernière mise à jour : 8 mai 2024 à 13h00
                    </Button>
                    <Button size="btn" className="bg-downloadButton-200 h-6 ml-3">
                        <ArrowLeft className='mr-2 mt-0' size={16} color="#f6faff" />Retourner
                    </Button>
                </div>
            </div>
            <div className='mt-1'>
                <h3 className='text-violet-gray-800 font-archivo text-custom-18 font-normal leading-custom-24'>Sélectionnez Client pour afficher les détails</h3>
            </div>
            <div className='mt-3 flex justify-between relative'>
                <Search className='absolute top-1 left-3' size={18} color="#403A44" strokeWidth={1.75} />
                <input className='searchField' placeholder='Recherche'></input>
                {isInvoice ? (
                    <>
                        <div className='flex relative right-40'>
                            <DatePicker className={"h-4"} />
                        </div>
                        <Button className="bg-downloadButton-200 h-7" onClick={handleDownload}>
                            <Download className='mr-2 mt-0' size={16} color="#f6faff" />Télécharger des données
                        </Button>
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default Header;
