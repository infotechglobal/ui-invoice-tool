'use client';
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
import useFilteredInvoiceDataStore from '../../../../../../store/FilteredInvoiceStore';
import { useAlertMessage } from '../../../../../../store/alertStore';



function Dashboard() {
    const { invoiceData, setInvoiceData } = useInvoiceData();
    const { showAlert, hideAlert } = useAlertMessage();

    const { filteredInvoiceData, setFilteredInvoiceData } = useFilteredInvoiceDataStore();
    const {isLoading, showLoader, hideLoader } = useLoaderStore();
    const params = useParams();
    const driveId = params.id;
    const { fileName, setFileName } = useFileNameStore();
    const { parentFolderId, setParentFolderId } = useParentFolderIdStore();
    const { csvFolderId, setCsvFolderId } = useCsvFolderIdStore();
    const { pdfFolderId, setPdfFolderId } = usePdfFolderIdStore();
    const { updatedAt, setUpdatedAt } = useUpdatedInvoiceTime();
    const addFile = useFileStore((state) => state.addNewFiles);

    const openInDrive = () => {
        if (parentFolderId !== null) {
            window.open(`https://drive.google.com/drive/folders/${parentFolderId}`);
        }
    };

    useEffect(() => {
        const fetchInvoiceInfo = async () => {
                // hideLoader();
                
                // showLoader('chargement de la facture...');
           
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
                if (error?.response?.data?.message) {
                    showAlert(error.response.data.message, 'Error');
                }
                else {
                    showAlert('Erreur lors de la récupération de la facture', 'Error');

                }
                setTimeout(() => {
                    hideAlert();
                }, 5000);

                console.error('Error fetching invoice info:', error);
            } finally {
                hideLoader();
            }
        };

        fetchInvoiceInfo();
    }, [driveId, setFileName, setParentFolderId, setCsvFolderId, setPdfFolderId, setUpdatedAt, showLoader, hideLoader, showAlert, hideAlert]);

    useEffect(() => {
        const processFile = async () => {
            // showLoader('Processing file...');
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/process/${driveId}`, {
                    fileName: fileName
                });
                if (response.data.statusCode === 200) {
                    setInvoiceData(response.data.summary);
                    setFilteredInvoiceData(response.data.summary);
                    console.log('File processed successfully');
                } else {
                    showAlert('Error processing file', 'Error');
                    console.error('Error processing file:', response.data.message);
                }
            } catch (error) {
                console.error('Error processing file:', error);
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

        if (fileName) {
            processFile();
        }
    }, [driveId, fileName, setInvoiceData, showLoader, hideLoader, setFilteredInvoiceData, showAlert, hideAlert]);


    useEffect(() => {
        const fetchData = async () => {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/getallfiles`);
            console.log(data.allFiles);
            addFile(data.allFiles);
        };

        console.log("fetching uploaded files in invoice/id page");
        fetchData();
    }, [addFile]);

    useEffect(() => {
        // Get the current page location from localStorage
        const currentLocation = localStorage.getItem('pageLocation');
        const newLocation = `/admin/invoice/${driveId}`;
    
        // Check if the current location is different from the new location
        if (currentLocation !== newLocation) {
            localStorage.setItem('pageLocation', newLocation);
        }
    }, [driveId]);
    
    return (
        <div className='pt-2 pr-2 pl-3 flex flex-col'>
            {/* Header */}
            <Header isInvoice={true} />

            {/* Main content */}
            <div className='main flex flex-col pt-5'>
                {/* Dropdown, download, upload to drive button */}
                <div className='dropdowns flex gap-x-5'>
                    {/* Dropdown */}
                    {/* <SelectScrollable /> */}

                    {/* Upload to drive button */}
                    <Button onClick={openInDrive} variant="downloadBtn">Ouvrir dans Drive</Button>
                </div>
                {/* Table */}
                <section className='mt-6'>
                    <CustomTable invoiceData={filteredInvoiceData} />
                </section>
            </div>
        </div>
    );
}

export default Dashboard;
