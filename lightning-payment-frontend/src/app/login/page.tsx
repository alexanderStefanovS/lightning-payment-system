'use client';

import Link from 'next/link';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
    return (
        <section className='w-full h-full flex flex-col justify-center items-center bg-zinc-950'>
            <LoginForm />
            <p className='mt-4 text-amber-500'>
                Don't have an account?{' '}
                <Link href='/register' className='text-amber-300 underline hover:text-amber-400'>
                    Register here
                </Link>
            </p>
        </section>
    );
}
