// components/Dashboard.jsx
'use client'
import React, { useEffect,useState } from 'react';
import { Button } from "@/components/ui/button";
import { SelectScrollable } from '../../../../../../components/Select';
import { CustomTable } from '../../../../../../components/Table';
import Header from '../../../../../../components/Header';
import { Navigation } from 'lucide-react';
import axios from 'axios';
import { useFileNameStore, useParentFolderIdStore, useCsvFolderIdStore, usePdfFolderIdStore } from '../../../../../../store/invoiceIdsStore';
import { useParams } from 'next/navigation';
import { useInvoiceData } from '../../../../../../store/invoiceDataStore'


function Dashboard() {
    const { invoiceData, setInvoiceData } = useInvoiceData();
     // Default driveId
    // const driveId = '1C7G0DzU1929PaQNqb6fTIDZwOFbAdZ1q'; // Default driveId

    const params = useParams();
    const driveId = params.id;
    console.log('driveId in id page is ', driveId);


    const { fileName, setFileName } = useFileNameStore();
    const { parentFolderId, setParentFolderId } = useParentFolderIdStore();
    const { csvFolderId, setCsvFolderId } = useCsvFolderIdStore();
    const { pdfFolderId, setPdfFolderId } = usePdfFolderIdStore();


    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching invoice info...');
                const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/getInvoiceInfo`, {
                    driveId: driveId
                });
                console.log('response', response.data);
                const fileName = response.data.filename;
                const parentFolderId = response.data.parentFolderId;
                const csvFolderId = response.data.csvFolderId;
                const pdfFolderId = response.data.pdfFolderId;

                // Store in Zustand stores
                setFileName(fileName);
                setParentFolderId(parentFolderId);
                setCsvFolderId(csvFolderId);
                setPdfFolderId(pdfFolderId);

                console.log('Invoice info fetched successfully');



            } catch (error) {
                console.error('Error fetching invoice info:', error);
            }
        };

        fetchData();
    }, [driveId]);

    return (
        <div className='pt-2 pr-2 pl-3 flex flex-col'>
            {/* Header */}
            <Header
                isInvoice={true}
            />

            {/* Main content */}
            <div className='main flex flex-col pt-5'>
                {/* Dropdown, download, upload to drive button */}
                <div className='dropdowns flex gap-x-5'>
                    {/* Dropdown */}
                    <SelectScrollable />

                    {/* Button with icon */}
                    <Button variant="downloadBtn" size="icon">
                        <Navigation size={48} color="#403A44" strokeWidth={1.75} />
                    </Button>
                    {/* Download button */}
                    <Button variant="downloadBtn">Télécharger</Button>
                    {/* Upload to drive button */}
                    <Button variant="downloadBtn">Télécharger dans Drive</Button>
                </div>
                {/* Table */}
                <section className='mt-6'>
                    <CustomTable invoiceData={invoiceData} />
                </section>
            </div>
        </div>
    );
}

export default Dashboard;
