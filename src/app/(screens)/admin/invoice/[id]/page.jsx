'use client'
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { SelectScrollable } from '../../../../../../components/Select';
import { CustomTable } from '../../../../../../components/Table';
import Header from '../../../../../../components/Header';
import { Navigation } from 'lucide-react';
import axios from 'axios';
import { useFileNameStore, useParentFolderIdStore, useCsvFolderIdStore, usePdfFolderIdStore, useUpdatedInvoiceTime } from '../../../../../../store/invoiceIdsStore';
import { useParams } from 'next/navigation';
import { useInvoiceData } from '../../../../../../store/invoiceDataStore';
import useLoaderStore from '../../../../../../store/loaderStore';
import { useFileStore } from '../../../../../../store/uploadedFilesStore';

function Dashboard() {
    const { invoiceData, setInvoiceData } = useInvoiceData();
    const { showLoader, hideLoader } = useLoaderStore();
    const params = useParams();
    const driveId = params.id;
    const { fileName, setFileName } = useFileNameStore();
    const { parentFolderId, setParentFolderId } = useParentFolderIdStore();
    const { csvFolderId, setCsvFolderId } = useCsvFolderIdStore();
    const { pdfFolderId, setPdfFolderId } = usePdfFolderIdStore();
    const { updatedAt, setUpdatedAt } = useUpdatedInvoiceTime();
    const addFile = useFileStore((state) => state.addNewFiles);


    const fetchData = async () => {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/getallfiles`);
      console.log(data.allFiles);
      addFile(data.allFiles);
    }

    const openInDrive = () => {
        if (parentFolderId !== null) {
            window.open(`https://drive.google.com/drive/folders/${parentFolderId}`);
        }
    };

    useEffect(() => {
        const fetchInvoiceInfo = async () => {
            showLoader('Fetching invoice info...');
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/getInvoiceInfo`, {
                    driveId: driveId
                });
                const { fileName, parentFolderId, csvFolderId, pdfFolderId, updatedAt } = response.data;

                // Store in Zustand stores
                setFileName(fileName);
                setParentFolderId(parentFolderId);
                setCsvFolderId(csvFolderId);
                setPdfFolderId(pdfFolderId);
                setUpdatedAt(updatedAt);

                console.log('Invoice info fetched successfully');
            } catch (error) {
                console.error('Error fetching invoice info:', error);
            } finally {
                hideLoader();
            }
        };

        fetchInvoiceInfo();
    }, [driveId, setFileName, setParentFolderId, setCsvFolderId, setPdfFolderId, setUpdatedAt, showLoader, hideLoader]);

    useEffect(() => {
        const processFile = async () => {
            showLoader('Processing file...');
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/process/${driveId}`, {
                    fileName: fileName
                });
                if (response.data.statusCode === 200) {
                    setInvoiceData(response.data.summary);
                    console.log('File processed successfully');
                } else {
                    console.error('Error processing file:', response.data.message);
                }
            } catch (error) {
                console.error('Error processing file:', error);
            } finally {
                hideLoader();
            }
        };

        if (fileName) {
            processFile();
        }
    }, [driveId, fileName, setInvoiceData, showLoader, hideLoader]);

   
    useEffect(() => {
      console.log("fetching uploaded files in invoice/id page");
      fetchData();
    }, [])

    return (
        <div className='pt-2 pr-2 pl-3 flex flex-col'>
            {/* Header */}
            <Header isInvoice={true} />

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

                    {/* Upload to drive button */}
                    <Button onClick={openInDrive} variant="downloadBtn">Ouvrir dans Drive</Button>
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
