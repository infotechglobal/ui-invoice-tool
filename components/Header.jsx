import React from 'react'
import { ArrowUp, Mail,ArrowLeft,Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DatePicker } from './DatePicker'

function Header({isInvoice}) {
  return (
    <div className="header flex flex-col">
    <div className='flex justify-between'>
        <div>

            <h3 className="text-violet-gray-900 font-archivo text-[28px] font-bold leading-[32px] normal-font-style">
                Nom du fichier 1
            </h3>

        </div>
        {/* buttons */}
        <div className='flex items-end'>
            <Button size="btn" className="bg-downloadButton-200 h-6 ">
            <ArrowUp className='mr-2 mt-0' size={16} color="#f6faff" strokeWidth={3} />
                Dernière mise à jour : 8 mai 2024 à 13h00
            </Button>
            <Button size="btn" className="bg-downloadButton-200 h-6 ml-3">
            <ArrowLeft className='mr-2 mt-0' size={16} color="#f6faff" />Retourner
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

        {isInvoice ? (
            <>
                <div className='flex relative right-40'>
                    <DatePicker className={"h-4"} />
                </div>
                <Button className="bg-downloadButton-200 h-7 ">
                <Download className='mr-2 mt-0' size={16} color="#f6faff" />Download
                </Button>
            </>
        ) : (
            // You can place the alternative rendering here, if any
            null
        )}


    </div>
</div>

  )
}

export default Header
