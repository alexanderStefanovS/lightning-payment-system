'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthFetch } from '@/lib/auth-fetch';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[] | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<any[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authFetch = useAuthFetch();

  const fetchOrganizations = async () => {
    try {
      const data = await authFetch('http://localhost:3000/organization/per-user', { method: 'GET' });
      setOrganizations(data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchPendingInvitations = async () => {
    try {
      const data = await authFetch('http://localhost:3000/organization/invitations/pending', { method: 'GET' });
      setPendingInvitations(data);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
    }
  };

  useEffect(() => {
    fetchOrganizations();
    fetchPendingInvitations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrganization = async () => {
    setIsSubmitting(true);
    try {
      await authFetch('http://localhost:3000/organization', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
      fetchOrganizations();
    } catch (error) {
      console.error('Error adding organization:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvitationResponse = async (invitationId, action) => {
    try {
      await authFetch(`http://localhost:3000/organization/invitations/${invitationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      });
      fetchPendingInvitations();
      fetchOrganizations();
    } catch (error) {
      console.error(`Error ${action === 'accept' ? 'accepting' : 'denying'} invitation:`, error);
    }
  };

  if (!organizations || !pendingInvitations) {
    return <div className="text-center text-lg font-semibold text-amber-500">Loading organizations...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-zinc-900 text-amber-500 p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Organizations</h1>

      {pendingInvitations!.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 text-amber-400">Pending Invitations</h2>
          {pendingInvitations!.map((invitation) => (
            <div key={invitation.id} className="bg-zinc-800 p-4 mb-4 rounded-lg shadow-md">
              <h3 className="font-bold">{invitation.name}</h3>
              <p className="text-gray-400">{invitation.description}</p>
              <div className="flex gap-4 mt-3">
                <button
                  onClick={() => handleInvitationResponse(invitation.id, 'accept')}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleInvitationResponse(invitation.id, 'deny')}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-amber-500 text-zinc-900 px-4 py-2 rounded-lg hover:bg-amber-600 transition-all w-full"
      >
        Add Organization
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {organizations!.map((org) => (
          <Link key={org.id} href={`/organizations/${org.id}/info`}>
            <div className="bg-zinc-800 p-6 rounded-lg shadow-md cursor-pointer hover:bg-zinc-700 transition-all">
              <h2 className="text-xl font-bold text-amber-400 mb-2">{org.name}</h2>
              <p className="text-gray-400">{org.description}</p>
              <p className="text-gray-400">Role: {org.role}</p>
            </div>
          </Link>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-zinc-900 text-amber-500 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-center">Add Organization</h2>

            <div className="mb-4">
              <label className="block text-amber-400">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-amber-400">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="bg-zinc-800 border border-zinc-700 rounded w-full p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              ></textarea>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrganization}
                className="bg-amber-500 text-zinc-900 px-4 py-2 rounded-lg hover:bg-amber-600 transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
