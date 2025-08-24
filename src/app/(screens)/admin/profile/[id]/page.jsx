'use client'
import React, { useEffect, useState } from 'react';
import Header from '../../../../../../components/Header';
import { pic } from '../../../../../../src/lib/assets';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, ArrowLeft, Search, FileText, Download, Calendar, CreditCard } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { HashLoader } from "react-spinners";

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
    const [loading, setLoading] = useState(true);
    const userId = params.id;

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
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
            } finally {
                setLoading(false);
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
        <div className='h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50'>
            {/* Fixed Header */}
            <div className="flex-shrink-0 pt-6 px-8 pb-4 bg-white/80 backdrop-blur-sm border-b border-slate-200">
                <div className="flex justify-between items-start mb-6">
                    <div className='flex items-end min-w-[600px] justify-between'>
                        <h3 className="text-slate-800 font-bold text-3xl lg:text-4xl tracking-tight">
                            Détails du client
                        </h3>
                    </div>
                    <div className='flex items-end'>
                        <Button 
                            size="default" 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2.5 rounded-lg font-medium"
                            onClick={handleBack}
                        >
                            <ArrowLeft className='mr-2' size={18} />
                            Retourner
                        </Button>
                    </div>
                </div>
                
                <div className='relative'>
                    <Search className='absolute top-1/2 left-4 transform -translate-y-1/2 text-slate-400' size={20} strokeWidth={2} />
                    <input
                        className='w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm text-slate-700 placeholder-slate-400'
                        placeholder='Recherche...'
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="bg-white rounded-2xl p-12 shadow-xl border border-slate-200">
                        <div className="flex flex-col items-center">
                            <HashLoader color="#6366f1" size={80} />
                            <p className="mt-6 text-xl font-semibold text-slate-700">Chargement des données client</p>
                            <p className="mt-2 text-sm text-slate-500">Veuillez patienter un instant...</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='flex-1 overflow-hidden'>
                    {/* Main Content */}
                    <div className='h-full flex gap-6 p-8'>
                        {/* User Details Section */}
                        <div className="w-full lg:w-[535px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                            {/* Profile Header */}
                            <div className='bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white'>
                                <div className='flex justify-between items-center'>
                                    <div className='flex-1'>
                                        <h3 className='text-2xl font-bold mb-2'>
                                            {userData.customerName || 'XXXXXXX'}
                                        </h3>
                                        <div className='flex items-center text-indigo-100'>
                                            <CreditCard size={18} className='mr-2' />
                                            <span className='text-sm font-medium'>
                                                IBAN - {userData.ibanNo || '0000000000'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='ml-4'>
                                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                            <Image
                                                src={pic}
                                                width={60}
                                                height={60}
                                                alt="Profile Picture"
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Factures Section */}
                            <div className='p-6 h-full'>
                                <div className='flex items-center mb-4'>
                                    <FileText size={24} className='text-indigo-600 mr-3' />
                                    <h2 className='text-xl font-bold text-slate-800'>Factures</h2>
                                    <span className='ml-3 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full'>
                                        {factures?.length || 0}
                                    </span>
                                </div>
                                
                                <div className='h-[calc(100vh-320px)] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100'>
                                    {factures?.map((item, index) => (
                                        <div key={index} className="group bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl p-4 transition-all duration-200 hover:shadow-md">
                                            <div className="flex justify-between items-center">
                                                <div className='flex-1'>
                                                    <h4 className='text-slate-800 font-semibold text-base mb-1 group-hover:text-indigo-700 transition-colors'>
                                                        {item.invoiceNo}
                                                    </h4>
                                                    <div className='flex items-center text-slate-500 text-sm'>
                                                        <Calendar size={14} className='mr-1.5' />
                                                        <span>{item.transactionDate}</span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                className="bg-white hover:bg-indigo-600 hover:text-white border-indigo-200 text-indigo-600 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                                            >
                                                                <Download size={16} className='mr-1.5' />
                                                                Ouvrir
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="w-48 bg-white border border-slate-200 shadow-lg rounded-lg">
                                                            <DropdownMenuItem 
                                                                onSelect={openInvoice(item.csvDriveLink)}
                                                                className="hover:bg-green-50 hover:text-green-700 cursor-pointer p-3"
                                                            >
                                                                <FileText size={16} className='mr-2 text-green-600' />
                                                                Facture Excel
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onSelect={openInvoice(item.pdfDriveLink)}
                                                                className="hover:bg-red-50 hover:text-red-700 cursor-pointer p-3"
                                                            >
                                                                <FileText size={16} className='mr-2 text-red-600' />
                                                                Facture PDF
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {(!factures || factures.length === 0) && (
                                        <div className="text-center py-12">
                                            <FileText size={48} className='text-slate-300 mx-auto mb-4' />
                                            <p className="text-slate-500 font-medium">Aucune facture disponible</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Transactions Section */}
                        <div className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                            <div className='p-6 h-full'>
                                <div className='flex items-center mb-4'>
                                    <ArrowLeftRight size={24} className='text-indigo-600 mr-3' />
                                    <h2 className='text-xl font-bold text-slate-800'>Transactions</h2>
                                    <span className='ml-3 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full'>
                                        {transactions?.length || 0}
                                    </span>
                                </div>
                                
                                <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                                    {transactions?.map((item, index) => (
                                        <div key={index} className="group bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl p-4 transition-all duration-200 hover:shadow-md">
                                            <div className="flex justify-between items-start">
                                                <div className='flex-1 pr-4'>
                                                    <h4 className='text-slate-800 font-semibold text-base mb-2 group-hover:text-indigo-700 transition-colors leading-snug'>
                                                        {item.designation}
                                                    </h4>
                                                    <div className='text-sm text-slate-600 font-medium mb-1'>
                                                        ({item.fileName})
                                                    </div>
                                                </div>
                                                <div className='flex flex-col items-end text-right'>
                                                    <div className='bg-indigo-100 p-2 rounded-full mb-2 group-hover:bg-indigo-200 transition-colors'>
                                                        <ArrowLeftRight size={18} className="text-indigo-600" strokeWidth={2} />
                                                    </div>
                                                    <div className='flex items-center text-slate-500 text-xs'>
                                                        <Calendar size={12} className='mr-1' />
                                                        <span>{item.transactionDate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {(!transactions || transactions.length === 0) && (
                                        <div className="text-center py-12">
                                            <ArrowLeftRight size={48} className='text-slate-300 mx-auto mb-4' />
                                            <p className="text-slate-500 font-medium">Aucune transaction disponible</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminProfile;