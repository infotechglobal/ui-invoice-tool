import React from 'react';
import axios from 'axios';
import { ArrowUp, ArrowLeft, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from './DatePicker';

function Header({ isInvoice, fileName, parentFolderId, csvFolderId, pdfFolderId }) {
    const downloadData = async () => {
        try {
            console.log('Downloading data...');
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/download`, {
                fileName: 'test2-xpollens',
                parentFolderId: '123456',
                csvFolderId: '1mVpswEqMugnyulMwneG3rOQeeR4kffL4',
                pdfFolderId: '1Xz6juuZOeWgMbYVmnPt8YuA0HbVS_NZg',
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
                }
            } else {
                // Fallback for browsers that don't support showSaveFilePicker
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `test2Xpollens.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
    
        } catch (error) {
            console.error('Error downloading data:', error);
        }
    };

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
                        <Button className="bg-downloadButton-200 h-7" onClick={downloadData}>
                            <Download className='mr-2 mt-0' size={16} color="#f6faff" />Télécharger des données
                        </Button>
                    </>
                ) : (
                    null
                )}
            </div>
        </div>
    );
}

export default Header;


// fileName: 'test2-xpollens',
// parentFolderId: '123456',
// csvFolderId: '1mVpswEqMugnyulMwneG3rOQeeR4kffL4',
// pdfFolderId: '1Xz6juuZOeWgMbYVmnPt8YuA0HbVS_NZg',