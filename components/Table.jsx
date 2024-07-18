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
    console.log("invoiceData", invoiceData)
    const rowPerPage = 7;
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

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        {/* {
                        fileData.length>0 && fileData[0].length>0 &&
                        fileData[0]?.map((item,index)=>{
                            return (
                                <TableHead className="T-head" key={index}>{item}</TableHead>
                            )
                        })
                    } */}
                        <TableHead className="T-head">User Id</TableHead>
                        <TableHead className="T-head">Nom client</TableHead>
                        <TableHead className="T-head">Prénom client</TableHead>
                        <TableHead className="T-head">Code produit</TableHead>
                        <TableHead className="T-head">Descriptifs pour chaque produit facturé</TableHead>
                        <TableHead className="T-head">Date de réalisation de la prestation ou de l&apos;encaissement</TableHead>
                        <TableHead className="T-head">Le montant H.T</TableHead>
                        <TableHead className="T-head">Le taux de TVA</TableHead>
                        <TableHead className="T-head">Le montant TTC</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoiceData?.slice(startIndex, endIndex).map((user, index) => (
                        <TableRow key={index} onClick={() => window.location.href = `/admin/profile/${user.accountNo}`}>
                            <TableCell className="T-data">
                                <Link href={`/admin/profile/${user.accountNo}`}>
                                    {user.accountNo}
                                </Link>
                            </TableCell>

                            <TableCell className="T-data-name">{user.customerName}</TableCell>
                            <TableCell className="T-data-name">{user.customerName.split(' ')[0]}</TableCell>
                            <TableCell className="T-data">{user.codePennylane}</TableCell>
                            <TableCell className="T-data">{user.designation}</TableCell>
                            <TableCell className="T-data">{user.Transactiondate}</TableCell>
                            <TableCell className="T-data">
                                {Number.isInteger(user.HT) ? user.HT : user.HT.toFixed(2)}
                            </TableCell>
                            <TableCell className="T-data">{user.TVA}</TableCell>
                            <TableCell className="T-data">
                                {Number.isInteger(user.TTC) ? user.TTC : user.TTC.toFixed(2)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            className={startIndex == 0 ? "pointer-events-none opacity-50" : undefined}
                            onClick={() => {
                                if (startIndex > 0) {
                                    setPageNo(pageNo - 1);
                                }
                                console.log("prev clicked", startIndex, endIndex);
                                setStartIndex(startIndex - rowPerPage);
                                setEndIndex(endIndex - rowPerPage);
                            }}
                        />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">{pageNo}</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext
                            className={endIndex >= invoiceData?.length ? "pointer-events-none opacity-50" : undefined}
                            onClick={() => {
                                console.log("next clicked", startIndex, endIndex);
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
