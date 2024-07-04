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

        if ('showSaveFilePicker' in window) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: `xollensInvoice.zip`,
                    types: [{
                        description: 'ZIP Archive',
                        accept: { 'application/zip': ['.zip'] },
                    }],
                });

                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();

                console.log('File saved successfully');
            } catch (err) {
                console.log('Save cancelled or failed:', err);
                // Fallback to the traditional method if showSaveFilePicker fails
                fallbackDownload(blob);
            }
        } else {
            // Fallback for browsers that don't support showSaveFilePicker
            fallbackDownload(blob);
        }

    } catch (error) {
        console.error('Error downloading data:', error);
    }
};

const fallbackDownload = (blob) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test2Xpollens.zip`;
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
        downloadData(fileName, parentFolderId, csvFolderId, pdfFolderId);
    }, [fileName, parentFolderId, csvFolderId, pdfFolderId]);

    return (
        <div className="header flex flex-col">
            {/* ... (rest of your JSX remains the same) ... */}
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
            {/* ... */}
        </div>
    );
}

export default Header;