'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const router = useRouter();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/users/registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, lastName, email, password }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error();
            }

            setMessage('Registration successful');
        } catch (error) {
            setError('Error registering');
            console.error('Error registering', error);
        }
    };

    const successContent = (<button type="button" onClick={() => router.push('/login')}> Go to Login </button>)

    return (
        <form onSubmit={handleSubmit} className='bg-white p-8 rounded shadow-md w-96'>
            <h1 className='text-2xl font-bold mb-4'>Register</h1>
            <div className='mb-4'>
                <label htmlFor='firstName' className='block text-gray-700'>
                    First Name
                </label>
                <input
                    type='text'
                    id='firstName'
                    className='border rounded w-full p-2 mt-1'
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
            </div>
            <div className='mb-4'>
                <label htmlFor='lastName' className='block text-gray-700'>
                    Last Name
                </label>
                <input
                    type='text'
                    id='lastName'
                    className='border rounded w-full p-2 mt-1'
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
            </div>
            <div className='mb-4'>
                <label htmlFor='email' className='block text-gray-700'>
                    Email
                </label>
                <input
                    type='email'
                    id='email'
                    className='border rounded w-full p-2 mt-1'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className='mb-4'>
                <label htmlFor='password' className='block text-gray-700'>
                    Password
                </label>
                <input
                    type='password'
                    id='password'
                    className='border rounded w-full p-2 mt-1'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button
                type='submit'
                className='bg-green-500 text-white w-full py-2 rounded hover:bg-green-600'
            >
                Register
            </button>
            {error && <p className='text-red-500 mt-4'>{error}</p>}
            {message && successContent}
        </form>
    );
}
