'use client'
import React, { useEffect } from 'react'
import { BrandLogo, sampleFiles } from '../src/lib/assets'
import Image from 'next/image'
import { CircleCheck, File } from 'lucide-react'
import Link from 'next/link'
import {useFileStore,usefileAlert} from '../store'

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
 

function Sidebar() {
  const uploadedFiles = useFileStore((state) => state.uploadedFiles)
  const isLoading= usefileAlert((state)=>state.isLoading)
  useEffect(() => {
    console.log("sidebar updated");
  }, [uploadedFiles]);
  return (
    <div className='mr-10 flex flex-col w-full h-full justify-between'>
      <div>
      <header>
      <Link href={'/admin/uploads'}>
        <Image
          src={BrandLogo}
          width={132}
          height={24}
          alt="Picture of the Login page"
          quality={100}
          className="mt-8 mb-10 ml-6"
          />
          </Link>
      </header>

      <section className='pl-2' >
        <h2 className=' text-violet-gray-900 font-Archivo font-bold text-sm leading-4 w-max'>Tous les fichiers</h2>
        <div className="flex flex-col space-y-1 files ml-3 mt-3 w-max">

          {uploadedFiles?.map((item, index) => {
            return (
              // contents
              <div key={index} className="flex space-x-2">
                <div className="icon">
                  <File className='mt-1' size={16} color="#6f6a73" strokeWidth={2.25} />
                </div>
                <div className="text-VioletGray-600 font-Archivo text-sm leading-6 w-max">
                {item.name}
                </div>
              </div>
            );

          })}


        </div>
      </section>
      </div>

      <footer className='mb-3 self-center'>
      {isLoading &&
       <Alert variant="success">
      <CircleCheck size={20} />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        File uploaded successfully
      </AlertDescription>
    </Alert>}
      </footer>

    </div>
  )
}

export default Sidebar
