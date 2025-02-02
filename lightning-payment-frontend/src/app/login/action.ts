'use server';

import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const result = Object.fromEntries(formData);

    console.log(result);

    const { email, password } = result;

    console.log(email, password);

    const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        console.error('Login error');
        return;
    }

    const userData = await response.json();

    await createSession(userData);

    redirect("/profile");
}
