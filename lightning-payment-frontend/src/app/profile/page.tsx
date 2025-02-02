'use client';

import { useAuthFetch } from '@/lib/auth-fetch';
import { serverAuthFetch } from '@/lib/server-auth-fetch';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const authFetch = useAuthFetch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authFetch('http://localhost:3000/users', {
          method: 'GET',
        });

        setUser(data);

      } catch (error) {
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
    return <div>Loading...</div>;
  }

  return (
    <div className='bg-white p-8 rounded shadow-md w-96'>
      <h1 className='text-2xl font-bold mb-4'>Profile</h1>
      <p className='mb-2'>
        <strong>First Name:</strong> {user.firstName}
      </p>
      <p className='mb-2'>
        <strong>Last Name:</strong> {user.lastName}
      </p>
      <p className='mb-2'>
        <strong>Email:</strong> {user.email}
      </p>


      <button
        onClick={() => setIsModalOpen(true)}
        className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
      >
        Change Password
      </button>

      {successMessage && (
        <div className='mt-4 text-green-600'>
          {successMessage}
        </div>
      )}

      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white p-6 rounded shadow-md w-96'>
            <h2 className='text-xl font-bold mb-4'>Change Password</h2>

            <div className='mb-4'>
              <label className='block text-gray-700'>New Password</label>
              <input
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className='border rounded w-full p-2'
                required
              />
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700'>Confirm New Password</label>
              <input
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='border rounded w-full p-2'
                required
              />
            </div>

            <div className='flex justify-end'>
              <button
                onClick={() => setIsModalOpen(false)}
                className='bg-gray-300 text-black px-4 py-2 rounded mr-2'
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className='bg-green-500 text-white px-4 py-2 rounded'
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
