'use client';
import { useAuthFetch } from '@/lib/auth-fetch';
import { use, useEffect, useState } from 'react';

export default function OrganizationTokens({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const [tokens, setTokens] = useState<any>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [newToken, setNewToken] = useState<any>(null);

    const [form, setForm] = useState({
        name: '',
        description: '',
        expiryDate: '',
        orgId,
    });

    const authFetch = useAuthFetch();

    const fetchTokens = async () => {
        try {
            const data = await authFetch(`http://localhost:3000/token/per-org/${orgId}`, {
                method: 'GET',
            });

            setTokens(data);
        } catch (error) {
            console.error('Error fetching tokens:', error);
        }
    };

    useEffect(() => {
        fetchTokens();
    }, [orgId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const generatedToken = await authFetch(`http://localhost:3000/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify(form),
            });

            setNewToken(generatedToken);

            setForm({ name: '', description: '', expiryDate: '', orgId });
        } catch (error) {
            console.error('Error creating token:', error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNewToken(null);

        fetchTokens();
    };

    if (!tokens.length) {
        return <div>Loading tokens...</div>;
    }

    return (
        <div>
            <div className='mb-4'>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                >
                    Generate Token
                </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {tokens.map((token) => (
                    <div key={token._id} className='bg-white p-6 rounded shadow-md'>
                        <h2 className='text-xl font-bold mb-2'>{token.name}</h2>
                        <p className='text-gray-700'>Expiry: {new Date(token.expiryDate).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
                    <div className='bg-white p-6 rounded shadow-md w-96'>
                        {newToken ? (
                            <div>
                                <h2 className='text-xl font-bold mb-4'>Token Created</h2>
                                <p className='mb-4'>Here is your token. Please copy and save it securely:</p>
                                <div className='bg-gray-100 p-4 rounded'>{newToken.value}</div>
                                <button
                                    onClick={handleCloseModal}
                                    className='bg-green-500 text-white px-4 py-2 rounded mt-4 hover:bg-green-600'
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <h2 className='text-xl font-bold mb-4'>Generate Token</h2>
                                <div className='mb-4'>
                                    <label className='block text-gray-700'>Name</label>
                                    <input
                                        type='text'
                                        name='name'
                                        value={form.name}
                                        onChange={handleInputChange}
                                        className='border rounded w-full p-2'
                                        required
                                        autoComplete='off'
                                    />
                                </div>
                                <div className='mb-4'>
                                    <label className='block text-gray-700'>Description</label>
                                    <input
                                        type='text'
                                        name='description'
                                        value={form.description}
                                        onChange={handleInputChange}
                                        className='border rounded w-full p-2'
                                        required
                                        autoComplete='off'
                                    />
                                </div>
                                <div className='mb-4'>
                                    <label className='block text-gray-700'>Expiry Date</label>
                                    <input
                                        type='date'
                                        name='expiryDate'
                                        value={form.expiryDate}
                                        onChange={handleInputChange}
                                        className='border rounded w-full p-2'
                                        required
                                        autoComplete='off'
                                    />
                                </div>
                                <div className="flex justify-between">
                                    <button
                                        type='submit'
                                        className='bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600'
                                    >
                                        Submit
                                    </button>
                                    <button
                                        onClick={handleCloseModal}
                                        className='bg-gray-400 text-white px-4 py-2 rounded mt-4 hover:bg-gray-600'
                                        type='button'
                                    >
                                        Close
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
