'use client';
import React, { useState } from 'react';
import { loginImage, Francepay, emailIcon, pass } from '../../../../../public/assets/assets.js';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import axios from 'axios';
import { useRouter } from 'next/navigation'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400']
});

function LoginPage() {
  const router = useRouter()
  // Initialize state for form inputs
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Handler function to update state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handler function for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    router.push('/admin/Invoices')
    return;
    console.log('Form Data:', formData);

    try {
      const { data } = await axios.post('http://localhost:5000/auth/login/', {
        email: formData.email,
        password:formData.password
      }, {

      }
      )

      console.log(data);
      
      alert(data.message);
      if(data.status=='true'){
          router.push('/admin/Invoices')
      }

    } catch (error) {
      console.log(error)
      const errMsg= error.response.data.error;
      alert(errMsg);
    }


  };



  return (
    <div className='flex w-full h-screen'>
      {/* container for image */}
      <div className="imgContainer h-full w-[853px] relative">
        <Image
          src={loginImage}
          width={600}
          height={538}
          alt="Picture of the Login page"
          quality={100}
          className="absolute left-[75px] top-[120px]"
        />
      </div>
      {/* container for form */}
      <div className="Container bg-authContainer-200 flex flex-grow justify-center">
        <div className='h-fit m-auto'>
          <div className="logoContainer mb-5">
            <Image
              src={Francepay}
              width={289}
              height={159}
              alt="Picture of the Login page"
              quality={100}
              className="mx-auto"
            />
          </div>
          <form action="POST" className={`${poppins.className} mx-auto w-[472px]`} onSubmit={handleSubmit}>
            <div className="mb-5 relative">
              <Image
                src={emailIcon}
                width={25}
                height={20}
                alt="Email icon"
                quality={100}
                className="absolute top-[10px] left-2 z-30"
              />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email} // Corrected this line
                onChange={handleChange}
                className="loginForm"
                placeholder="Email"
                required
              />
            </div>
            <div className="mb-5 relative">
              <Image
                src={pass}
                width={25}
                height={20}
                alt="Password icon"
                quality={100}
                className="absolute top-[10px] left-2 z-30"
              />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="loginForm"
                placeholder="Mot de passe" // Corrected the placeholder
                required
              />
            </div>
            <button
              type="submit"
              className="text-white  bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-extrabold rounded-lg text-base w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
