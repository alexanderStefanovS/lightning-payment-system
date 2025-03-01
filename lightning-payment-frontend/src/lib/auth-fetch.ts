import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export function useAuthFetch() {
    const router = useRouter();

    async function authFetch(url: string, options: any, 
        params: { isText?: boolean, redirectLogin?: boolean, redirectError?: boolean } = { isText: false, redirectLogin: true, redirectError: true }) {

        const token = Cookies.get('session');

        const headers = {
            ...options.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Content-Type': 'application/json',
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    Cookies.remove('session');

                    if (params?.redirectLogin !== false) {
                        router.push('/error?type=unauthorized');
                    }

                    throw new Error('Unauthorized');
                }

                console.log(params);

                if (params?.redirectError !== false && response.status >= 500 && response.status < 600) {
                    router.push('/error?type=server');
                    throw new Error('Server Error');
                }

                throw await response.json();
            }

            return params.isText ? response.text() : response.json();

        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    return authFetch;
}
