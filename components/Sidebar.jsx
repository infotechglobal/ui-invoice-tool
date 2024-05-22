import React from 'react'
import { BrandLogo } from '../public/assets/assets'
import Image from 'next/image'

function Sidebar() {
  return (
    <div className='mr-10 flex flex-col'>
      <header>
      <Image
              src={BrandLogo}
              width={132}
              height={24}
              alt="Picture of the Login page"
              quality={100}
              className="mt-8 mb-10 ml-6"
            />
      </header>
      <section>

      </section>

      <footer>

      </footer>

    </div>
  )
}

export default Sidebar
