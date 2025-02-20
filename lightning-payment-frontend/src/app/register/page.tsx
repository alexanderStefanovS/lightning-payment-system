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

    return (
        <section className="w-full h-full flex justify-center items-center bg-zinc-950">
            <form onSubmit={handleSubmit} className="bg-zinc-900 p-8 rounded-lg shadow-md w-96 text-amber-500">
                <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>

                <div className="mb-4">
                    <label htmlFor="firstName" className="block text-amber-400">
                        First Name
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        className="bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="lastName" className="block text-amber-400">
                        Last Name
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        className="bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-amber-400">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-amber-400">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="bg-amber-500 text-zinc-900 w-full py-2 rounded-lg hover:bg-amber-400 transition-all duration-300"
                >
                    Register
                </button>

                {error && <p className="text-red-500 mt-4">{error}</p>}

                {message && (
                    <div className="mt-4 flex flex-col items-center">
                        <p className="text-green-500">{message}</p>
                        <button
                            type="button"
                            onClick={() => router.push('/login')}
                            className="mt-2 bg-zinc-800 text-amber-400 px-4 py-2 rounded-lg hover:bg-zinc-700 transition-all duration-300"
                        >
                            Go to Login
                        </button>
                    </div>
                )}
            </form>
        </section>
    );
}
