'use server';

import Cookies from 'js-cookie';

export async function serverAuthFetch(url: string, options: any, isText = false) {
    const token = Cookies.get('session');

    console.log(token);

    const headers = {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : undefined,
        'Content-Type': 'application/json',
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        console.log(response);

        if (response.status == 401) {
            Cookies.remove('session');

            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        if (isText) {
            return response.text();
        }

        return response.json();

    } catch (error) {
        console.error('Error fetching data:', error);

        throw error;
    }
}

