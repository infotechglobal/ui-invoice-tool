import Link from 'next/link';
import React from 'react';

// import '@fortawesome/fontawesome-free/css/all.min.css';

const ErrorPage = () => {
  return (
    <div className="bg-blue-400 h-screen flex items-center justify-center">
      <div className="relative bg-blue-400 h-96 w-96">
        <div className="absolute text-white text-9xl" style={{ left: '20%', top: '8%' }}>40</div>
        {/* <i className="far fa-question-circle fa-spin absolute text-white text-8xl" style={{ left: '42%', top: '15%' }}></i> */}
        <div className="absolute text-white text-9xl" style={{ left: '60%', top: '8%' }}>3</div>
        <div className="absolute text-center text-white text-xl" style={{ left: '16%', top: '45%', width: '75%' }}>
          Unauthorized!
          <p>Let's go <Link className="underline hover:no-underline" href="/login">Login</Link> and try from there.</p>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
