'use client'
import React, {useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { SelectScrollable } from '../../../../../../components/Select'
import { CustomTable } from '../../../../../../components/Table'
import Header from '../../../../../../components/Header'
import { Navigation } from 'lucide-react'
import { useInvoiceData } from '../../../../../../store/invoiceDataStore'

function Dashboard() {
const { invoiceData, setInvoiceData } = useInvoiceData();
const[fileName,setFileName]=useState('');
const[parentFolderId,setParentFolderId]=useState('');
const[csvfolderId,setCsvFolderId]=useState('');
const[pdfFolderId,setPdfFolderId]=useState('');

// console.log("invoiceData",invoiceData);

useEffect(() => {
//fectch the filename, parentFolderId, csvfolderId, pdfFolderId from the database
//store in the state

}, []);

    return (
        <div className='pt-2 pr-2 pl-3 flex flex-col '>
            {/* header  */}
        <Header isInvoice={true}/>
            {/* main */}
            <div className='main flex flex-col pt-5 '>
                {/* dropdown, download, upload to drive button */}
                <div className='dropdowns flex gap-x-5 '>
                    {/* //dropdown */}
                    <SelectScrollable />

                    {/* //button with img */}
                    <Button variant="downloadBtn" size="icon">
                    <Navigation size={48} color="#403A44" strokeWidth={1.75} />
                    </Button>
                    {/* //download button */}
                    <Button variant="downloadBtn">Télécharger</Button>
                    {/* //upload to drive */}
                    <Button variant="downloadBtn">Télécharger dans Drive</Button>

                </div>
                {/*table  */}
                <section className='mt-6'>
                    <CustomTable invoiceData={invoiceData}/>
                </section>
            </div>

        </div>
    )
}

export default Dashboard
