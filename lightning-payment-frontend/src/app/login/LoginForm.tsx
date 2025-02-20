'use server';

import { login } from "./action";

export async function LoginForm() {
    return (
        <form action={login} className="bg-zinc-900 p-8 rounded-lg shadow-md w-96 text-amber-500">
            <h1 className="text-3xl font-bold mb-6 text-center">Sign In</h1>

            <div className="mb-4">
                <label htmlFor="email" className="block text-amber-400">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className="bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                />
            </div>

            <div className="mb-6">
                <label htmlFor="password" className="block text-amber-400">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    className="bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                />
            </div>

            <button
                type="submit"
                className="bg-amber-500 text-zinc-900 w-full py-2 rounded-lg hover:bg-amber-400 transition-all duration-300"
            >
                Login
            </button>
        </form>
    );
}
