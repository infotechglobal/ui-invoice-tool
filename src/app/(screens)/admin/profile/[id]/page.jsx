import React from 'react'
import Header from '../../../../../../components/Header'
import { pic } from '../../../../../../src/lib/assets'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { transactions } from '../../../../../../src/lib/assets'
import { ArrowLeftRight } from 'lucide-react'

function AdminProfile({ params }) {
    const fractures = [
        { name: "jon" },
        { name: "xyz" },
        { name: "abc" },
        { name: "adawd" },
        { name: "adawd" },

    ]
    return (
        <div className='pt-2 pr-8 pl-8 flex flex-col pb-7'>
            <Header isInvoice={false} />

            {/*main*/}
            <section className='flex mt-[14px] h-[100%]'>
                <div className="userDetails w-[535px]">
                    {/* profile pic */}
                    <header className='flex w-[535px] h-[346px] justify-between items-center'>
                        {/* customerName */}
                        {/* mt-48 ml-10 h-max' */}
                        <div className='mt-20 ml-9 h-max'>
                            <h3 className='customerName'>
                                Saurav Gupta
                            </h3>
                            <h4 className='customerIBM'>
                                IBN - 0000000000
                            </h4>
                        </div>
                        {/* customer pic */}
                        {/* relative left-20 top-5 h-max */}
                        <div className='h-max mr-4'>
                            <Image
                                src={pic}
                                width={270}
                                height={270}
                                alt="Picture of the Login page"
                                quality={100}
                                className=""
                            />
                        </div>


                    </header>

                    {/* fractures */}
                    <main className='mt-3'>
                        <h1 className='customerName text-left'>Factures</h1>
                        {fractures.map((item, index) => {
                            return (
                                <div key={index} className="flex justify-between border-2 border-gray-200 rounded p-2">
                                    <h4 className='text-VioletGray-900 font-Archivo text-base font-medium'>{item.name}</h4>
                                    <Button variant="downloadBtn">Télécharger</Button>
                                </div>
                            );
                        })}


                    </main>
                </div>
                <div className="transactions px-3 py-3 flex-1">
                    <h1 className='customerName text-left mb-3'>Transactions</h1>

                    {transactions.map((item, index) => {
                            return (
                                <div key={index} className="flex justify-between border-2 border-gray-200 rounded-lg gap-y-6 p-2">
                                    <h4 className='text-VioletGray-900 font-Archivo text-14px font-medium non-italic'>{item.transactionName}</h4>
                                    <div className='flex flex-col mr-7'>
                                    <ArrowLeftRight className='w-max place-self-end' color="#908b89" strokeWidth={1.25} />
                                    <h3 className='text-VioletGray-500 font-Archivo text-10px font-normal non-italic'>{item.time}</h3>
                                    </div>
                                </div>
                            );
                        })}

                </div>
            </section>
        </div>
    )
}

export default AdminProfile
