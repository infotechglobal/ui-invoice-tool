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
import { useSocket } from '../../../../../context/SocketContext';
import InvoiceProgressOverlay from '../../../../../../components/InvoiceProgressOverlay';



function Dashboard() {
    const { invoiceData, setInvoiceData } = useInvoiceData();
    const { showAlert, hideAlert } = useAlertMessage();
    const { socket, isConnected } = useSocket();
    const [progressData, setProgressData] = useState(null);
    const [showProgress, setShowProgress] = useState(false);

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

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        const handleProgressUpdate = (data) => {
            console.log('Progress update:', data);
            setProgressData(data);
        };

        const handleProcessingStart = (data) => {
            console.log('Processing started:', data);
            setShowProgress(true);
            setProgressData({
                percentage: 0,
                processedItems: 0,
                totalItems: 0,
                currentItem: null,
                estimatedTimeRemaining: null,
                elapsedTime: 0,
                errors: []
            });
        };

        const handleError = (error) => {
            console.log('Processing error:', error);
        };

        const handleComplete = (data) => {
            console.log('Processing complete:', data);
            setProgressData(data);
            if (data.success) {
                showAlert('Factures générées avec succès !', 'Success');
            } else {
                showAlert(`Traitement terminé avec ${data.errors.length} erreurs`, 'Warning');
            }
        };

        socket.on('invoiceProgress', handleProgressUpdate);
        socket.on('invoiceProcessingStart', handleProcessingStart);
        socket.on('invoiceError', handleError);
        socket.on('invoiceComplete', handleComplete);

        return () => {
            socket.off('invoiceProgress', handleProgressUpdate);
            socket.off('invoiceProcessingStart', handleProcessingStart);
            socket.off('invoiceError', handleError);
            socket.off('invoiceComplete', handleComplete);
        };
    }, [socket, showAlert]);

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
            if (!socket || !isConnected) {
                console.warn('Socket not connected, using fallback processing...');
                showLoader('Processing file...');
            }

            try {
                const requestData = {
                    fileName: fileName
                };

                // Add socketId if connected
                if (socket?.id) {
                    requestData.socketId = socket.id;
                }

                const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/process/${driveId}`, requestData);
                
                if (response.data.statusCode === 200) {
                    setInvoiceData(response.data.summary);
                    setFilteredInvoiceData(response.data.summary);
                    console.log('File processed successfully');
                    
                    // If not using socket, show success message
                    if (!socket?.id) {
                        showAlert('Fichier traité avec succès', 'Success');
                    }
                } else {
                    showAlert('Error processing file', 'Error');
                    console.error('Error processing file:', response.data.message);
                }
            } catch (error) {
                console.error('Error processing file:', error);
                setShowProgress(false); // Hide progress on error
                
                if (error?.response?.status == 401) {
                    showAlert("Please Authorize to google drive", "Error");
                } else {
                    showAlert("Something went wrong while processing the file", "Error");
                }
                setTimeout(() => {
                    hideAlert();
                }, 5000);
            } finally {
                if (!socket?.id) {
                    hideLoader();
                }
            }
        };

        if (fileName) {
            processFile();
        }
    }, [driveId, fileName, setInvoiceData, showLoader, hideLoader, setFilteredInvoiceData, showAlert, hideAlert, socket, isConnected]);


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

            {/* Progress Overlay */}
            <InvoiceProgressOverlay
                isVisible={showProgress}
                progress={progressData}
                onClose={() => setShowProgress(false)}
            />
        </div>
    );
}

export default Dashboard;
