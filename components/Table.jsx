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



import { useEffect, useState } from "react";
import Link from "next/link";

export function CustomTable({ invoiceData }) {
    const rowPerPage = 6;
    const [pageNo, setPageNo] = useState(1);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(rowPerPage);
    const [fileData, setFileData] = useState([]);
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

    return (
        <>
            <Table className="w-full text-sm text-gray-700 border border-gray-200 shadow-md rounded-xl overflow-hidden">
                <TableHeader className="bg-gray-100 text-gray-800 uppercase text-xs tracking-wider">
                    <TableRow>
                        <TableHead className="px-4 py-3">IBAN NO</TableHead>
                        <TableHead className="px-4 py-3">Nom Client</TableHead>
                        <TableHead className="px-4 py-3">Prénom Client</TableHead>
                        <TableHead className="px-4 py-3">Code Tarifare</TableHead>
                        <TableHead className="px-4 py-3">Descriptifs pour chaque produit facturé</TableHead>
                        <TableHead className="px-4 py-3">Date de réalisation</TableHead>
                        <TableHead className="px-4 py-3 w-[120px]">Montant H.T</TableHead>
                        <TableHead className="px-4 py-3">Taux de TVA</TableHead>
                        <TableHead className="px-4 py-3 w-[120px]">Montant TTC</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="cursor-pointer">
                    {invoiceData?.slice(startIndex, endIndex).map((user, index) => (
                        <TableRow
                            key={index}
                            className="hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => window.location.href = `/admin/profile/${user.accountNo}`}
                        >
                            <TableCell className="px-4 py-3 font-medium text-blue-600 underline">
                                <Link href={`/admin/profile/${user.accountNo}`}>
                                    {user.accountNo}
                                </Link>
                            </TableCell>
                            <TableCell className="px-4 py-3">{user.customerName}</TableCell>
                            <TableCell className="px-4 py-3">{user.customerName.split(' ')[0]}</TableCell>
                            <TableCell className="px-4 py-3">{user.tarrifCode}</TableCell>
                            <TableCell className="px-4 py-3">{user.designation}</TableCell>
                            <TableCell className="px-4 py-3">{user.Transactiondate}</TableCell>
                            <TableCell className="px-4 py-3">
                                { formatCurrency(user.HT)}
                            </TableCell>
                            <TableCell className="px-4 py-3"> {`${user.TVA}%`}</TableCell>   
                            <TableCell className="px-4 py-3">
                                { formatCurrency(user.TTC)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Pagination className="mt-4">
                <PaginationContent className="gap-2">
                    <PaginationItem>
                        <PaginationPrevious
                            className={`rounded-md px-3 py-1.5 text-sm border border-gray-300 ${startIndex == 0 ? "pointer-events-none opacity-50" : "hover:bg-gray-100"}`}
                            onClick={() => {
                                if (startIndex > 0) {
                                    setPageNo(pageNo - 1);
                                }
                                setStartIndex(startIndex - rowPerPage);
                                setEndIndex(endIndex - rowPerPage);
                            }}
                        />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink
                            href="#"
                            className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm"
                        >
                            {pageNo}
                        </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext
                            className={`rounded-md px-3 py-1.5 text-sm border border-gray-300 ${endIndex >= invoiceData?.length ? "pointer-events-none opacity-50" : "hover:bg-gray-100"}`}
                            onClick={() => {
                                if (endIndex < invoiceData?.length) {
                                    setPageNo(pageNo + 1);
                                }
                                setStartIndex(startIndex + rowPerPage);
                                setEndIndex(endIndex + rowPerPage);
                            }}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>

        </>
    );
}
