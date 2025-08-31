import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export function CustomTable({ invoiceData }) {
    // Change from 6 to 8 records per page
    const rowPerPage = 8;
    const [pageNo, setPageNo] = useState(1);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(rowPerPage);
    const [fileData, setFileData] = useState([]);
    const scrollContainerRef = useRef(null);
    const tableRef = useRef(null);

    useEffect(() => {
        // Check if `window` is defined and `localStorage` is available
        if (typeof window !== 'undefined' && localStorage.getItem('fileData')) {
            const item = localStorage.getItem('fileData');
            if (item) {
                setFileData(JSON.parse(item));
            }
        }
    }, []);

    const formatCurrency = (amount) => {
        return `${amount} €`;
    };

    const handlePreviousClick = () => {
        if (startIndex > 0) {
            setPageNo(pageNo - 1);
            setStartIndex(startIndex - rowPerPage);
            setEndIndex(endIndex - rowPerPage);
        }
    };

    const handleNextClick = () => {
        if (endIndex < invoiceData?.length) {
            setPageNo(pageNo + 1);
            setStartIndex(startIndex + rowPerPage);
            setEndIndex(endIndex + rowPerPage);
        }
    };

    const totalPages = Math.ceil((invoiceData?.length || 0) / rowPerPage);

    return (
        <div className="flex flex-col h-full max">
            {/* Table Container with horizontal scroll */}
            <div className="flex-1 flex flex-col min-h-0">
                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-x-auto overflow-y-hidden border border-gray-200 rounded-xl shadow-md bg-white"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    <Table
                        ref={tableRef}
                        className="w-full min-w-[1200px] text-sm text-gray-700"
                    >
                        <TableHeader className="bg-gray-100 text-gray-800 uppercase text-xs tracking-wider sticky top-0 z-10">
                            <TableRow>
                                <TableHead className="px-4 py-3 min-w-[140px] font-semibold">
                                    IBAN NO
                                </TableHead>
                                <TableHead className="px-4 py-3 min-w-[250px] font-semibold">
                                    Nom Client
                                </TableHead>
                                <TableHead className="px-4 py-3 min-w-[150px] font-semibold">
                                    Prénom Client
                                </TableHead>
                                <TableHead className="px-4 py-3 min-w-[120px] font-semibold">
                                    Code Tarifare
                                </TableHead>
                                <TableHead className="px-4 py-3 min-w-[350px] font-semibold">
                                    Descriptifs pour chaque produit facturé
                                </TableHead>
                                <TableHead className="px-4 py-3 min-w-[140px] font-semibold">
                                    Date de réalisation
                                </TableHead>
                                <TableHead className="px-4 py-3 min-w-[120px] font-semibold text-right">
                                    Montant H.T
                                </TableHead>
                                <TableHead className="px-4 py-3 min-w-[100px] font-semibold text-center">
                                    Taux de TVA
                                </TableHead>
                                <TableHead className="px-4 py-3 min-w-[120px] font-semibold text-right">
                                    Montant TTC
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoiceData?.slice(startIndex, endIndex).map((user, index) => (
                            <TableRow
  key={index}
  className="
    border-b border-gray-100 cursor-pointer group
    transition-all duration-300 ease-in-out
    hover:bg-gradient-to-r hover:from-blue-50 hover:to-white
    hover:shadow-lg hover:shadow-blue-100/60
    hover:scale-[1.002] hover:border-blue-200
    rounded-md
  "
  onClick={() => window.location.href = `/admin/profile/${user.accountNo}`}
>

                                    <TableCell className="px-4 py-4">
                                        <Link
                                            href={`/admin/profile/${user.accountNo}`}
                                            className="font-medium text-blue-600 hover:text-blue-800 underline decoration-1 underline-offset-2 hover:decoration-2 transition-all duration-200"
                                        >
                                            {user.accountNo}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="px-4 py-4 font-medium text-gray-900">
                                        {user.customerName}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-gray-700">
                                        {user.customerName?.split(' ')[0] || ''}
                                    </TableCell>
                                    <TableCell className="px-4 py-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 group-hover:bg-gray-200 transition-colors duration-200">
                                            {user.tarrifCode}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-gray-700 max-w-[250px]">
                                        <div className="" title={user.designation}>
                                            {user.designation}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-gray-700">
                                        {user.Transactiondate}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-right font-semibold text-green-700">
                                        {formatCurrency(user.HT)}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-center">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                            {`${user.TVA}%`}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-right font-bold text-gray-900">
                                        {formatCurrency(user.TTC)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>


            </div>

            {/* Enhanced Pagination */}
            <div className="flex-shrink-0 mt-6">
                <div className="flex items-center justify-between px-4">
                    {/* Results info */}
                    <div className="text-sm text-gray-600 w-[200px]">
                        Affichage {startIndex + 1} à {Math.min(endIndex, invoiceData?.length || 0)} sur {invoiceData?.length || 0} résultats
                    </div>

                    {/* Centered Pagination controls */}
                    <div className="flex-1 flex justify-center">
                        <Pagination>
                            <PaginationContent className="gap-1">
                                <PaginationItem>
                                    <PaginationPrevious
                                        className={`rounded-lg px-3 py-2 text-sm border transition-all duration-200 ${
                                            startIndex === 0
                                                ? "pointer-events-none opacity-40 bg-gray-50 text-gray-400 border-gray-200"
                                                : "hover:bg-gray-100 bg-white text-gray-700 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow"
                                        }`}
                                        onClick={handlePreviousClick}
                                    />
                                </PaginationItem>

                                {/* Page numbers */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNumber;
                                    if (totalPages <= 5) {
                                        pageNumber = i + 1;
                                    } else if (pageNo <= 3) {
                                        pageNumber = i + 1;
                                    } else if (pageNo >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + i;
                                    } else {
                                        pageNumber = pageNo - 2 + i;
                                    }

                                    return (
                                        <PaginationItem key={pageNumber}>
                                            <PaginationLink
                                                href="#"
                                                className={`px-3 py-2 rounded-lg text-sm border transition-all duration-200 ${pageNumber === pageNo
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow"
                                                    }`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    const newStartIndex = (pageNumber - 1) * rowPerPage;
                                                    const newEndIndex = newStartIndex + rowPerPage;
                                                    setPageNo(pageNumber);
                                                    setStartIndex(newStartIndex);
                                                    setEndIndex(newEndIndex);
                                                }}
                                            >
                                                {pageNumber}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        className={`rounded-lg px-3 py-2 text-sm border transition-all duration-200 ${endIndex >= (invoiceData?.length || 0)
                                            ? "pointer-events-none opacity-40 bg-gray-50 text-gray-400 border-gray-200"
                                            : "hover:bg-gray-100 bg-white text-gray-700 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow"
                                        }`}
                                        onClick={handleNextClick}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>

                    {/* Empty div for symmetrical spacing */}
                    <div className="w-[200px]"></div>
                </div>
            </div>
        </div>
    );
}