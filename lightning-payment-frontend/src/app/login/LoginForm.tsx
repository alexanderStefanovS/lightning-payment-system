'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Cookies from 'js-cookie';

export function LoginForm() {
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        const formData = new FormData(e.currentTarget);
        const { email, password } = Object.fromEntries(formData);

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                setError('Login failed. Please check your credentials.');
                return;
            }

            const userData = await response.json();

            const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            Cookies.set('session', userData.accessToken, { expires });

            router.push('/profile');
        } catch (error) {
            console.error('Login failed:', error);
            setError('Login failed. Please try again.');
        }
    }

    return (
        <form onSubmit={handleSubmit} className='bg-zinc-900 p-8 rounded-lg shadow-md w-96 text-amber-500'>
            <h1 className='text-3xl font-bold mb-6 text-center'>Sign In</h1>

            <div className='mb-4'>
                <label htmlFor='email' className='block text-amber-400'>
                    Email
                </label>
                <input
                    type='email'
                    id='email'
                    name='email'
                    className='bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500'
                    required
                />
            </div>

            <div className='mb-6'>
                <label htmlFor='password' className='block text-amber-400'>
                    Password
                </label>
                <input
                    type='password'
                    id='password'
                    name='password'
                    className='bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500'
                    required
                />
            </div>

            {error && <p className='text-red-500 mb-4'>{error}</p>}

            <button
                type='submit'
                className='bg-amber-500 text-zinc-900 w-full py-2 rounded-lg hover:bg-amber-400 transition-all duration-300'
            >
                Login
            </button>
        </form>
    );
}
