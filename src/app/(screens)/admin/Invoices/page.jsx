'use client'
import React from 'react'
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DatePicker } from '../../../../../components/DatePicker'
import { SelectScrollable } from '../../../../../components/Select'
import {CustomTable} from '../../../../../components/Table'
function Dashboard() {
    return (
        <div className='pt-2 pr-2 pl-3 flex flex-col '>
            {/* header  */}
            <div className="header flex flex-col">
                <div className='flex justify-between'>
                    <div>
              
                        <h3 className="text-violet-gray-900 font-archivo text-[28px] font-bold leading-[32px] normal-font-style">
                            Nom du fichier 1
                        </h3>

                    </div>
                    {/* buttons */}
                    <div className='flex items-end'>
                        <Button className="bg-downloadButton-200 h-6 ">
                            <Mail className="mr-2 h-4 w-4" /> Dernière mise à jour : 8 mai 2024 à 13h00
                        </Button>
                        <Button className="bg-downloadButton-200 h-6 ml-3">
                            <Mail className="mr-2 h-4 w-4" /> Retourner
                        </Button>
                    </div>
                </div>
                {/* seclect client */}
                <div className='mt-1'>
                    <h3 className='text-violet-gray-800 font-archivo text-custom-18 font-normal leading-custom-24'>Sélectionnez Client pour afficher les détails</h3>
                </div>
                {/* search bar, date picker, download invoice */}
                <div className='mt-3 flex justify-between relative'>
                    <input className='w-[400px] h-7 rounded-lg border-2  border-bunker-neutrals-100 bg-white-custom' placeholder='Recherche'></input>
                    <div className='flex relative right-40'>

                    <DatePicker className={"h-4"}/>
                    </div>
                    <Button className="bg-downloadButton-200 h-7 ">
                            <Mail className="mr-2 h-4 w-4" />Download
                        </Button>

                </div>
            </div>

            {/* main */}
            <div className='main flex flex-col pt-5 '>
                {/* dropdown, download, upload to drive button */}
                <div className='dropdowns flex gap-x-5 '>
                    {/* //dropdown */}
                    <SelectScrollable/>

                    {/* //button with img */}
                    <Button variant="downloadBtn" size="icon">i</Button>
                    {/* //download button */}
                    <Button variant="downloadBtn">Télécharger</Button>
                    {/* //upload to drive */}
                    <Button variant="downloadBtn">Télécharger dans Drive</Button>

                </div>
                {/*table  */}
                <section className='mt-6'>
                    <CustomTable/>

                </section>
            </div>

        </div>
    )
}

export default Dashboard
