'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ShowError() {
    const searchParams = useSearchParams();
    const errorType = searchParams.get('type');
 
    return (
        <div className="h-full flex items-center justify-center text-amber-500">
            <div className="bg-zinc-800 p-6 rounded-lg shadow-md text-center w-96">
                {errorType === 'unauthorized' ? (
                    <>
                        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                        <p className="mb-4">You do not have permission to access this page.</p>
                        <a href="/login" className="bg-amber-500 text-zinc-900 px-4 py-2 rounded hover:bg-amber-600">
                            Go to Login
                        </a>
                    </>
                ) : errorType === 'server' ? (
                    <>
                        <h1 className="text-2xl font-bold mb-4">Server Error</h1>
                        <p className="mb-4">An unexpected error occurred. Please try again.</p>
                        <button onClick={() => window.history.back()} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                            Reload Page
                        </button>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold mb-4">Unexpected Error</h1>
                        <p className="mb-4">Something went wrong.</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ErrorPage() {
    return (
        <Suspense>
            <ShowError />
        </Suspense>
    );
}
