import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export function useAuthFetch() {
    const router = useRouter();

    async function authFetch(url: string, options: any, params: { isText?: boolean, redirectLogin?: boolean } = { isText: false, redirectLogin: true }) {
        const token = Cookies.get('session');

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

            if (response.status == 401) {
                Cookies.remove('session');

                if (params.redirectLogin) {
                    router.push('/login');
                }

                throw new Error('Unauthorized');
            }

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            if (params.isText) {
                return response.text();
            }

            return response.json();

        } catch (error) {
            console.error('Error fetching data:', error);

            throw error;
        }
    }

    return authFetch;

}