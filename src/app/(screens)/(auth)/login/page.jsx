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
  const [showPassword, setShowPassword] = useState(false);
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

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
        setCookie('token', token, { maxAge:  7 * 24 * 60 * 60 * 1000 });
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
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="loginForm pr-12"
                placeholder="Mot de passe"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute top-[10px] right-3 z-30 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
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
            
            {/* Forgot Password and Change Password Links */}
            <div className="mt-4 flex flex-col gap-2 text-center">
              <button
                type="button"
                onClick={() => router.push('/forgotPassword')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Mot de passe oublié?
              </button>
              <button
                type="button"
                onClick={() => router.push('/changePassword')}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Changer le mot de passe
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default LoginPage;
