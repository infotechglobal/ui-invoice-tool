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
// import { useRouter } from 'next/router';



function Dashboard() {
    // const router = useRouter();
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


 

    useEffect(() => {
        const fetchInvoiceInfo = async () => {
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
                // Check for authentication errors
                if (error?.response?.status === 401) {
                    showAlert("Veuillez autoriser l'accès à Google Drive", "Error");
                    // Redirect immediately on auth error
                    window.location.href = '/admin/uploads';
                    return;
                }
                
                // Handle other errors
                if (error?.response?.data?.message) {
                    showAlert(error.response.data.message, 'Error');
                } else {
                    showAlert('Erreur lors de la récupération de la facture', 'Error');
                }
                setTimeout(() => {
                    hideAlert();
                }, 5000);
                
                // Redirect to uploads page after showing error
                setTimeout(() => {
                    window.location.href = '/admin/uploads';
                }, 2000);

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
                    fileName: fileName,
                    reqPath:"invoices"
                });

                if (response.data.statusCode === 200) {
                    setInvoiceData(response.data.summary);
                    setFilteredInvoiceData(response.data.summary);
                    console.log('File processed successfully');
                } 
                else if (response.data.statusCode === 400 && response.data.message === 'File has not been processed') {
                    showAlert("File has not been processed. Redirecting to upload page...", "Error");
                    // Redirect to upload page
                    setTimeout(() => {
                        window.location.href = '/admin/uploads'; // Adjust the path as needed
                    }, 2000);
                }
                
                else {
                    showAlert('Error processing file', 'Error');
                    console.error('Error processing file:', response.data.message);
                }
            } catch (error) {
                console.error('Error processing file:', error);

                if (error?.response?.status == 401) {
                    showAlert("Veuillez autoriser l'accès à Google Drive", "Error");
                        setTimeout(() => {
                        window.location.href = '/admin/uploads'; // Adjust the path as needed
                    }, 1690);
                }
                else if (error?.response?.status == 400 && error?.response?.data?.message === 'File has not been processed') {
                    showAlert("File has not been processed. Redirecting to upload page...", "Error");
                    // Redirect to upload page
                    setTimeout(() => {
                        window.location.href = '/admin/uploads'; // Adjust the path as needed
                    }, 2000);
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
    <div className='h-screen overflow-hidden'>
        <div className='h-full flex flex-col'>
            {/* Header - Fixed height */}
            <div className='flex-shrink-0 px-6 py-4 border-b border-gray-200'>
                <Header isInvoice={true} parentFolderId={parentFolderId}/>
            </div>

            {/* Main content - Flexible height */}
            <div className='flex-1 px-6 py-4 overflow-hidden'>
                {/* Table Section */}
                <div className='h-full'>
                    <CustomTable invoiceData={filteredInvoiceData} />
                </div>
            </div>
        </div>
    </div>
);
}

export default Dashboard;