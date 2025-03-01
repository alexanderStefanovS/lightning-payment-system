'use client';

import RegisterForm from '@/components/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <div className='flex flex-col justify-center items-center h-full bg-zinc-950'>
            <RegisterForm role='USER' />
            <p className='mt-4 text-amber-500'>
                Already have an account?{' '}
                <Link href='/login' className='text-amber-300 underline hover:text-amber-400'>
                    Login here
                </Link>
            </p>
        </div>
    );
}
