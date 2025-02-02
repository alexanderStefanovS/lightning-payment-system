'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthFetch } from '@/lib/auth-fetch';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authFetch = useAuthFetch();

  const fetchOrganizations = async () => {
    try {
      const data = await authFetch('http://localhost:3000/organization/per-user', {
        method: 'GET',
      });
      setOrganizations(data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchPendingInvitations = async () => {
    try {
      const data = await authFetch('http://localhost:3000/organization/invitations/pending', {
        method: 'GET',
      });
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

  if (!organizations.length && !pendingInvitations.length) {
    return <div>Loading organizations...</div>;
  }

  return (
    <div className='max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Organizations</h1>

      {pendingInvitations.length > 0 && (
        <div className='mb-6'>
          <h2 className='text-lg font-bold mb-2'>Pending Invitations</h2>
          {pendingInvitations.map((invitation) => (
            <div key={invitation.id} className='bg-yellow-100 p-4 mb-4 rounded shadow'>
              <h3 className='font-bold'>{invitation.name}</h3>
              <p className='text-gray-600'>{invitation.description}</p>
              <div className='flex gap-4 mt-2'>
                <button
                  onClick={() => handleInvitationResponse(invitation.id, 'accept')}
                  className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
                >
                  Accept
                </button>
                <button
                  onClick={() => handleInvitationResponse(invitation.id, 'deny')}
                  className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
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
        className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4'
      >
        Add Organization
      </button>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {organizations.map((org) => (
          <Link key={org.id} href={`/organizations/${org.id}/info`}>
            <div className='bg-white p-6 rounded shadow-md cursor-pointer hover:shadow-lg'>
              <h2 className='text-xl font-bold mb-2'>{org.name}</h2>
              <h2 className='text-gray-700'>{org.description}</h2>
              <p className='text-gray-700'>Role: {org.role}</p>
            </div>
          </Link>
        ))}
      </div>

      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white p-6 rounded shadow-md w-96'>
            <h2 className='text-xl font-bold mb-4'>Add Organization</h2>

            <div className='mb-4'>
              <label className='block text-gray-700'>Name</label>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                className='border rounded w-full p-2'
                required
              />
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700'>Description</label>
              <textarea
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                className='border rounded w-full p-2'
                required
              ></textarea>
            </div>

            <div className='flex justify-end'>
              <button
                onClick={() => setIsModalOpen(false)}
                className='bg-gray-300 text-black px-4 py-2 rounded mr-2'
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrganization}
                className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
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
