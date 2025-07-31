'use client';
import React, { useState } from 'react';
import { loginImage, Francepay, EmailIcon } from '../../../../../src/lib/assets.js';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { HashLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400']
});

function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  // Handler function for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/forgot-password`, {
        email: email
      });

      console.log(data);

      if (data.status === true) {
        toast.success(data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        // Redirect to login after success
        setTimeout(() => {
          router.push('/login');
        }, 2000);
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
      toast.error(error.response?.data?.message || error.message, {
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
          <div className="text-center mb-6">
            <h2 className={`${poppins.className} text-2xl font-bold text-gray-800`}>
              Mot de passe oublié
            </h2>
            <p className={`${poppins.className} text-gray-600 mt-2`}>
              Entrez votre email pour recevoir un nouveau mot de passe
            </p>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="loginForm"
                placeholder="Email"
                required
              />
            </div>
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-extrabold rounded-lg text-base w-full px-5 py-2.5 flex justify-center items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mb-4"
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
                  <span>Envoi en cours...</span>
                </div>
              ) : (
                "Envoyer nouveau mot de passe"
              )}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Retour à la connexion
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default ForgotPasswordPage;
