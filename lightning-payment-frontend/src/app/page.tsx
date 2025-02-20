'use client';

import { useAuthFetch } from '@/lib/auth-fetch';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const authFetch = useAuthFetch();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        await authFetch('http://localhost:3000/auth/check', { method: 'GET' }, { redirectLogin: false });

        router.push('/profile');

      } catch (error: any) {
        if (error.message === 'Unauthorized') {
          setIsAuthenticated(false);
        }
      }
    };

    checkUser();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className='flex items-center justify-center h-full bg-zinc-950 text-amber-500'>
        <div className='animate-spin rounded-full h-14 w-14 border-t-4 border-amber-500'></div>
      </div>
    );
  }

  return (
    <section className="h-full w-full flex flex-col items-center justify-center bg-zinc-950 text-amber-500 px-6">
      <h1 className="text-4xl font-bold mb-6 text-center">Lightning Payment System</h1>
      <p className="text-lg text-amber-400 max-w-xl text-center mb-8">
        Experience fast and secure Bitcoin payments with Lightning Network.
        Register now and start accepting Lightning payments instantly!
      </p>

      <div className="flex gap-6">
        <Link
          href="/login"
          className="bg-amber-500 text-zinc-900 px-6 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-all duration-300"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="border border-amber-500 px-6 py-3 rounded-lg font-semibold hover:bg-amber-500 hover:text-zinc-900 transition-all duration-300"
        >
          Register
        </Link>
      </div>
    </section>
  );
}
