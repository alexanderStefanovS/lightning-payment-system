'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Cookies from 'js-cookie';

interface RegisterFormProps {
    role: 'USER' | 'ADMIN';
}

export default function RegisterForm({ role }: RegisterFormProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const endpoint =
            role === 'ADMIN' ? 'http://localhost:3000/users/register-admin' : 'http://localhost:3000/users/registration';

        const token = Cookies.get('session');

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && role === 'ADMIN' ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            setMessage(role === 'ADMIN' ? 'Admin registered successfully' : 'Registration successful');
        } catch (error) {
            setError('Error registering');
            console.error('Error registering:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='bg-zinc-900 p-8 rounded shadow-md w-96 text-amber-500'>
            <h1 className='text-2xl font-bold mb-4'>{role === 'ADMIN' ? 'Register Admin' : 'Register'}</h1>

            <div className='mb-4'>
                <label htmlFor='firstName' className='block text-amber-500'>
                    First Name
                </label>
                <input
                    type='text'
                    name='firstName'
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className='bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500'
                />
            </div>

            <div className='mb-4'>
                <label htmlFor='lastName' className='block text-amber-500'>
                    Last Name
                </label>
                <input
                    type='text'
                    name='lastName'
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className='bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500'
                />
            </div>

            <div className='mb-4'>
                <label htmlFor='email' className='block text-amber-500'>
                    Email
                </label>
                <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className='bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500'
                />
            </div>

            <div className='mb-4'>
                <label htmlFor='password' className='block text-amber-500'>
                    Password
                </label>
                <input
                    type='password'
                    name='password'
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className='bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500'
                />
            </div>

            <button type='submit' className='bg-amber-500 text-zinc-900 w-full py-2 rounded hover:bg-amber-600'>
                {role === 'ADMIN' ? 'Register Admin' : 'Register'}
            </button>

            {error && <p className='text-red-500 mt-4'>{error}</p>}
            {message && (
                <div className='mt-4'>
                    <p className='text-green-500'>{message}</p>
                    {role !== 'ADMIN' && (
                        <button type='button' onClick={() => router.push('/login')} className='text-amber-400 underline'>
                            Go to Login
                        </button>
                    )}
                </div>
            )}
        </form>
    );
}
