'use client'
import React, { useEffect, useState } from 'react';
import Header from '../../../../../../components/Header';
import { pic } from '../../../../../../src/lib/assets';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, ArrowLeft, Search } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function AdminProfile({ params }) {
    const router = useRouter();
    const [userData, setUserData] = useState({});
    const [transactions, setTransactions] = useState([]);
    const [factures, setFactures] = useState([]);
    const userId = params.id;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/getUserInfo/${userId}`);
                const { message, transactions } = response.data;

                if (message === 'User transactions fetched successfully' && transactions && transactions.length > 0) {
                    const user = transactions[0];
                    setUserData(user);
                    const uniqueInvoices = filterUniqueInvoices(user.transactions || []);
                    setTransactions(user.transactions || []);
                    setFactures(uniqueInvoices);
                } else {
                    console.error('User data not found or empty.');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [userId]);

    const filterUniqueInvoices = (transactions) => {
        const uniqueInvoices = [];
        const seenInvoiceNumbers = new Set();

        transactions.forEach(item => {
            if (!seenInvoiceNumbers.has(item.invoiceNo)) {
                seenInvoiceNumbers.add(item.invoiceNo);
                uniqueInvoices.push(item);
            }
        });

        return uniqueInvoices;
    };

    const formatDateToFrench = (dateString) => {
        const date = new Date(dateString);
        const options = { month: 'long', year: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    };

    const handleBack = () => {
        localStorage.getItem('pageLocation') ? router.push(localStorage.getItem('pageLocation')) : router.push('/admin/uplads');
    };

    const openInvoice = (pdfDriveLink) => {
        return () => {
            window.open(pdfDriveLink);
        };
    };

    return (
        <div className='pt-2 pr-8 pl-8 flex flex-col max-h-[100vh]'>
            <div className="header flex flex-col">
                <div className='flex justify-between'>
                    <div className='flex items-end min-w-[600px] justify-between'>
                        <h3 className="text-violet-gray-900 font-archivo text-[35px] font-bold leading-[32px] normal-font-style">
                            Détails du client
                        </h3>
                    </div>
                    <div className='flex items-end'>
                        <Button size="btn" className="bg-downloadButton-200 h-6 ml-3" onClick={handleBack}>
                            <ArrowLeft className='mr-2 mt-0' size={16} color="#f6faff" />Retourner
                        </Button>
                    </div>
                </div>
                <div className='mt-3 flex justify-between relative'>
                    <Search className='absolute top-1 left-3' size={18} color="#403A44" strokeWidth={1.75} />
                    <input
                        className='searchField'
                        placeholder='Recherche'
                    />
                </div>
            </div>

            {/* Main section */}
            <section className='flex mt-[14px]'>
                <div className="userDetails w-[535px]">
                    {/* Header with profile pic and details */}
                    <header className='flex w-[535px] justify-between items-center'>
                        <div className='mt-20 ml-9 h-max'>
                            <h3 className='customerName'>
                                {userData.customerName || 'XXXXXXX'}
                            </h3>
                            <h4 className='customerIBM'>
                                {`IBN - ${userData.ibanNo}` || 'IBN - 0000000000'}
                            </h4>
                        </div>
                        <div className='h-max mr-4'>
                            <Image
                                src={pic}
                                width={220}
                                height={200}
                                alt="Profile Picture"
                                quality={100}
                                className="relative top-6"
                            />
                        </div>
                    </header>

                    {/* Invoices section */}
                    <main className='mt-3'>
                        <h1 className='customerName text-left'>Factures</h1>
                        <div className='invoiceDetails h-[354px] overflow-y-scroll no-scrollbar'>
                            {factures?.map((item, index) => (
                                <div key={index} className="flex justify-between border-2 border-gray-200 rounded p-2">
                                    <section className='flex flex-col gap-2'>
                                    <h4 className='text-VioletGray-900 font-Archivo text-base font-medium'>
                                        {item.invoiceNo}
                                    </h4>
                                        <p className='text-VioletGray-500 font-Archivo text-10px font-normal non-italic'>{formatDateToFrench(item.transactionDate)}</p>
                                        </section>
                                    <div className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="downloadBtn">
                                                    Ouvrir
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onSelect={openInvoice(item.csvDriveLink)}>Facture Excel</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={openInvoice(item.pdfDriveLink)}>Facture PDF</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>

                {/* Transactions section */}
                <div className="transactions px-3 py-3 flex-1">
                    <h1 className='customerName text-left mb-3'>Transactions</h1>
                    <div className="transactionDetails h-[550px] overflow-y-scroll no-scrollbar">
                        {transactions?.map((item, index) => (
                            <div key={index} className="flex justify-between border-2 border-gray-200 rounded-lg gap-y-6 p-2">
                                <h4 className='text-VioletGray-900 font-Archivo text-14px font-medium non-italic'>
                                    {item.designation}  ({item.fileName})
                                </h4>
                                <div className='flex flex-col mr-7'>
                                    <ArrowLeftRight className='w-max place-self-end' color="#908b89" strokeWidth={1.25} />
                                    <h3 className='text-VioletGray-500 font-Archivo text-10px font-normal non-italic'>
                                        {item.transactionDate}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AdminProfile;
