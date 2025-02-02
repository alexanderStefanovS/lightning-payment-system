'use server';

import { login } from "./action";

export async function LoginForm() {
    return (
        <form action={login} className="bg-white p-8 rounded shadow-md w-96">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    className="border rounded w-full p-2 mt-1"
                    name="email"
                    required
                />
            </div>
            <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700">
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    className="border rounded w-full p-2 mt-1"
                    required
                />
            </div>
            <button
                type="submit"
                className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
            >
                Login
            </button>
        </form>
    );
}
