'use client'
import React from 'react'
import { Button } from "@/components/ui/button"
import { SelectScrollable } from '../../../../../components/Select'
import { CustomTable } from '../../../../../components/Table'
import Header from '../../../../../components/Header'
import { Navigation } from 'lucide-react'

function Dashboard() {

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
                    <CustomTable />

                </section>
            </div>

        </div>
    )
}

export default Dashboard
