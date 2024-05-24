import React from 'react'
import Header from '../../../../../components/Header'
import { ArrowLeft, ArrowUp, Download, Search, Trash2 } from 'lucide-react'
import { sampleFiles } from '../../../../../public/assets/assets'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DatePicker } from '../../../../../components/DatePicker'


function Uploads({ isInvoice = true }) {
  return (
    <div className='pt-2 pr-2 pl-3 flex flex-col '>
      <div className="header flex flex-col">
        <div className='flex justify-between'>
          <div>

            <h3 className="text-violet-gray-900 font-archivo text-[28px] font-bold leading-[32px] normal-font-style">
              Nom du fichier 1
            </h3>

          </div>
          {/* buttons */}
          {/* <div className='flex items-end'>
            <Button size="btn" className="bg-downloadButton-200 h-6 ">
            <ArrowUp className='mr-2 mt-0' size={16} color="#f6faff" strokeWidth={3} />
                Dernière mise à jour : 8 mai 2024 à 13h00
            </Button>
            <Button size="btn" className="bg-downloadButton-200 h-6 ml-3">
            <ArrowLeft className='mr-2 mt-0' size={16} color="#f6faff" />Retourner
            </Button>
        </div> */}
        </div>
        {/* seclect client */}
        <div className='mt-1'>
          <h3 className='text-violet-gray-800 font-archivo text-custom-18 font-normal leading-custom-24'>Sélectionnez Client pour afficher les détails</h3>
        </div>
        {/* search bar, date picker, download invoice */}
        <div className='mt-3 flex justify-between relative pr-7'>
          <Search className='absolute top-1 left-3' size={18} color="#403A44" strokeWidth={1.75} />
          <input className='searchField' placeholder='Recherche'></input>

          <Button className="rounded-lg border-2 border-violet-gray-100 h-7 bg-white text-violet-gray-900">
            <Download className='mr-2 mt-0' size={16} color="black" />Télécharger des données
          </Button>



        </div>
      </div>

      {/* files */}
      <div className='h-[550px] overflow-y-scroll no-scrollbar'>
        {sampleFiles?.map((item, index) => (
          <div key={index} className="flex items-center gap-7 self-stretch files mt-[20px]">
            <div className='flex flex-col w-[1150px] bg-uploadContainerBg-200 rounded-lg p-2 space-y-4 border-black shadow-custom'>
              <div className='space-y-2'>
                <h1 className='text-white font-archivo text-lg font-semibold leading-6'>{item.fileName}</h1>
                <h2 className='text-white font-syne text-base font-normal leading-4'>{item.uploadedAt}</h2>
              </div>
              <Link href='/admin/Invoices' className='text-white font-archivo text-sm font-normal leading-4 underline'>Aperçu</Link>
            </div>
            <div className="icons">
              <Trash2 size={20} color="#6f6a73" strokeWidth={2.25} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Uploads
