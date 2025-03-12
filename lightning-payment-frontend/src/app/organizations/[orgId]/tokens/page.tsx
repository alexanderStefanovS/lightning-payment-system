'use client';

import { useAuthFetch } from '@/lib/auth-fetch';
import { use, useContext, useEffect, useState } from 'react';
import { OrganizationContext } from '../organization-context';

export default function OrganizationTokens({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const [tokens, setTokens] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newToken, setNewToken] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [form, setForm] = useState({ name: '', description: '', expiryDate: '', orgId });
  const { organization } = useContext(OrganizationContext);
  const authFetch = useAuthFetch();

  const fetchTokens = async () => {
    try {
      const data = await authFetch(`http://localhost:3000/token/per-org/${orgId}`, { method: 'GET' });
      setTokens(data);
      setIsLoading(false);
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
        headers: { 'Content-Type': 'application/json' },
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

  const handleDeactivateToken = async (tokenId) => {
    try {
      await authFetch(`http://localhost:3000/token/${orgId}/${tokenId}`, {
        method: 'DELETE',
      });
      fetchTokens();
    } catch (error) {
      console.error('Error deactivating token:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center text-lg font-semibold text-amber-500">Loading tokens...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-zinc-900 text-amber-500 p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Organization Tokens</h1>

      {organization.role !== 'VIEWER' && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 text-zinc-900 px-4 py-2 rounded-lg hover:bg-amber-600 transition-all w-full mb-6"
        >
          Generate Token
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.length === 0 && <div className="text-lg font-semibold text-amber-500">No tokens found</div>}
        {tokens.map((token) => (
          <div key={token._id} className="bg-zinc-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-amber-400 mb-2">{token.name}</h2>
            <p className="text-gray-400">Expiry: {new Date(token.expiryDate).toLocaleDateString()}</p>
            <p className={`mt-2 font-bold ${token.isActive ? 'text-green-400' : 'text-red-500'}`}>
              {token.isActive ? 'Active' : 'Inactive'}
            </p>
            {token.isActive && (
              <button
                onClick={() => handleDeactivateToken(token._id)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all w-full"
              >
                Deactivate
              </button>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-zinc-900 text-amber-500 p-6 rounded-lg shadow-lg w-96">
            {newToken ? (
              <div>
                <h2 className="text-xl font-bold mb-4 text-center">Token Created</h2>
                <p className="mb-4 text-gray-400">Here is your token. Please copy and save it securely:</p>
                <div className="bg-zinc-800 p-4 rounded text-amber-400 overflow-auto">{newToken.value}</div>
                <button
                  onClick={handleCloseModal}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-green-600 transition-all w-full"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold mb-4 text-center">Generate Token</h2>
                <div className="mb-4">
                  <label className="block text-amber-400">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-amber-400">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-amber-400">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={form.expiryDate}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="flex justify-between gap-1">
                  <button
                    type="submit"
                    className="bg-amber-500 text-zinc-900 px-4 py-2 rounded-lg hover:bg-amber-600 transition-all w-1/2"
                  >
                    Submit
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all w-1/2"
                    type="button"
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
