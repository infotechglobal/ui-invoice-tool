'use client';
import React, { useState } from 'react';
import { loginImage, Francepay, pass, EmailIcon } from '../../../../../src/lib/assets.js';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';
import { HashLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400']
});

function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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

    console.log('Form Data:', formData);
    try {
      setIsLoading(true);
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login/`, {
        email: formData.email,
        password: formData.password
      }, {
        withCredentials: true,
        credentials: 'include',
      });

      console.log(data);

      if (data.status === true) {
        const token = data.token;
        setCookie('token', token, { maxAge: 60 * 60 * 24 });
        setTimeout(() => {
          router.push('/admin/uploads');
        }, 500); // Delay of 1.5 seconds before redirecting
        toast.success(data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error(data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setIsLoading(false);
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
                src={EmailIcon}
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
                value={formData.email}
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
                placeholder="Mot de passe"
                required
              />
            </div>
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-extrabold rounded-lg text-base w-full px-5 py-2.5 flex justify-center items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              {isLoading ? (
                <div className='flex gap-x-4'>
                  <HashLoader
                    color="white"
                    loading={true}
                    cssOverride={{
                      display: "block",
                      margin: "auto",
                      borderColor: "green",
                      padding: "3px",
                    }}
                    size={20}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                    speedMultiplier={1.5}
                  />
                  <span>Connexion </span>
                </div>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default LoginPage;
