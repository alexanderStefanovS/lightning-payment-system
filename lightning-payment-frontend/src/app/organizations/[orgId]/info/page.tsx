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
    <div className="max-w-4xl mx-auto bg-zinc-900 text-amber-500 p-6 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4">{organization.name}</h1>
      <p className="text-lg">{organization.description}</p>
      <p className="mt-2 text-gray-400">Role: <span className="font-semibold text-amber-400">{role}</span></p>

      {role === 'OWNER' && (
        <div className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Invite a User</h2>
            <div className="grid grid-flow-col grid-cols-12 gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email"
                className="bg-zinc-800 text-white border border-gray-700 rounded focus:ring-amber-500 p-2 focus:ring-2 col-span-4"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="bg-zinc-800 text-white border border-gray-700 rounded p-2 col-span-3"
              >
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <button
                onClick={handleInviteUser}
                className="bg-amber-500 text-zinc-900 px-4 py-2 rounded-lg col-span-2 hover:bg-amber-600 transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Inviting...' : 'Invite'}
              </button>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user) => (
              <div key={user.id} className="bg-zinc-800 p-4 shadow rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold text-amber-400">{user.name}</p>
                  <p className="text-gray-400">{user.email}</p>
                  <p className="text-gray-400">Role: <span className="font-semibold">{user.role}</span></p>
                </div>
                {user.isSelf ? (
                  <span className="text-gray-500">You</span>
                ) : (
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                    disabled={user.isSelf}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
