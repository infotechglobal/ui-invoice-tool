'use client'
import React from 'react'
// import { Mail } from "lucide-react"
// import { Button } from "@/components/ui/button"

function Dashboard() {
    return (
        <div className='pt-6 pr-6'>
            {/* header  */}
            <div className="header flex flex-col">
                <div className='flex justify-between'>
                    <div>
                        <h3>Nom du fichier 1 </h3>
                    </div>
                    {/* buttons */}
                    <div>
                        {/* <Button className="bg-blue-300 h-2">
                        <Mail className="mr-2 h-4 w-4" /> Dernière mise à jour : 8 mai 2024 à 13h00
                        </Button>
                        <Button className="bg-blue-300 h-2">
                        <Mail className="mr-2 h-4 w-4" /> Retourner
                        </Button> */}
                    </div>
                </div>
                {/* seclect client */}
                <div>
                Sélectionnez Client pour afficher les détails
                </div>
                {/* search bar */}
                <div>

                </div>
            </div>

            {/* main */}
            <div className='main'>

            </div>

        </div>
    )
}

export default Dashboard
