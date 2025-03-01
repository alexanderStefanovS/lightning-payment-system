'use client';

import { useState, useEffect } from 'react';
import { useAuthFetch } from '@/lib/auth-fetch';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const authFetch = useAuthFetch();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authFetch('http://localhost:3000/users', { method: 'GET' });
        setUser(data);
      } catch (error) {
        router.replace('/error?type=server');
        console.error('Failed to fetch user info', error);
      }
    };

    fetchUser();
  }, []);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await authFetch('http://localhost:3000/users/change-password', {
        method: 'PUT',
        body: JSON.stringify({ newPassword }),
      });

      setSuccessMessage('Password updated successfully!');
      setIsModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  if (!user) {
    return <div className="text-center text-lg font-semibold text-amber-500">Loading...</div>;
  }

  return (
    <div className="bg-zinc-900 text-amber-500 p-8 rounded-lg shadow-lg max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Profile</h1>

      <div className="bg-zinc-800 p-4 rounded-lg shadow">
        <p className="mb-2">
          <strong className="text-amber-400">First Name:</strong> {user.firstName}
        </p>
        <p className="mb-2">
          <strong className="text-amber-400">Last Name:</strong> {user.lastName}
        </p>
        <p className="mb-2">
          <strong className="text-amber-400">Email:</strong> {user.email}
        </p>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full mt-6 bg-amber-500 text-zinc-900 px-4 py-2 rounded-lg hover:bg-amber-600 transition-all"
      >
        Change Password
      </button>

      {successMessage && <div className="mt-4 text-green-400 text-center">{successMessage}</div>}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-zinc-900 text-amber-500 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>

            <div className="mb-4">
              <label className="block text-amber-400">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-amber-400">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="bg-amber-500 text-zinc-900 px-4 py-2 rounded-lg hover:bg-amber-600 transition-all"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
