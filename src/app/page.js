'use client'

import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation'

import { useEffect } from "react";


export default function Home() {
  const router=useRouter();
  useEffect(() => {
    router.push('/login');
  }, []);

  return (
    <div>
      <h1>redirecting to Login page. click the link to proceed manually</h1>

      <Link href='/login' className="underline text-blue-400 italic">click here</Link>
    </div>
  );
}
