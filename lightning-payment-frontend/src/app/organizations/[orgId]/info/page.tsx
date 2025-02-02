'use client';
import { useAuthFetch } from '@/lib/auth-fetch';
import { use, useEffect, useState } from 'react';

export default function OrganizationInfo({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const [organization, setOrganization] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [role, setRole] = useState(''); // Role of the logged-in user
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('ADMIN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authFetch = useAuthFetch();

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const data = await authFetch(`http://localhost:3000/organization/${orgId}`, {
          method: 'GET',
        });
        setOrganization(data);
        setRole(data.role);
      } catch (error) {
        console.error('Error fetching organization info:', error);
      }
    };

    const fetchOrganizationUsers = async () => {
      try {
        const data = await authFetch(`http://localhost:3000/organization/${orgId}/users`, {
          method: 'GET',
        });
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchOrganization();
    fetchOrganizationUsers();
  }, [orgId]);

  const handleRemoveUser = async (userId: string) => {
    try {
      const response = await authFetch(`http://localhost:3000/organization/${orgId}/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } else {
        console.error('Failed to remove user');
      }
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  const handleInviteUser = async () => {
    setIsSubmitting(true);
    try {
      const response = await authFetch(`http://localhost:3000/organization/${orgId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (response.ok) {
        setInviteEmail('');
        const data = await authFetch(`http://localhost:3000/organization/${orgId}/users`, {
          method: 'GET',
        });
        setUsers(data);
      } else {
        console.error('Failed to invite user');
      }
    } catch (error) {
      console.error('Error inviting user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!organization) {
    return <div>Loading organization info...</div>;
  }

  return (
    <div className='bg-white p-6 rounded shadow-md'>
      <h1 className='text-2xl font-bold mb-4'>{organization.name}</h1>
      <p>{organization.description}</p>
      <p>Role: {organization.role}</p>

      {role === 'OWNER' && (
        <div className='mt-6'>
          <div className='mb-4'>
            <h2 className='text-lg font-bold mb-2'>Invite a User</h2>
            <div className='flex items-center gap-4'>
              <input
                type='email'
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder='Enter email'
                className='border rounded p-2 flex-1'
              />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value='ADMIN'>Admin</option>
                <option value='VIEWER'>Viewer</option>
              </select>
              <button
                onClick={handleInviteUser}
                className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Inviting...' : 'Invite'}
              </button>
            </div>
          </div>

          <h2 className='text-lg font-bold mb-4'>Users</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {users.map((user) => (
              <div key={user.id} className='bg-gray-100 p-4 shadow rounded flex justify-between items-center'>
                <div>
                  <p className='font-bold'>{user.name}</p>
                  <p className='text-gray-600'>{user.email}</p>
                  <p className='text-gray-600'>Role: {user.role}</p>
                </div>
                {user.isSelf ?
                  'You' :
                  (
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
                      disabled={user.isSelf}
                    >
                      Remove
                    </button>
                  )
                }
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
