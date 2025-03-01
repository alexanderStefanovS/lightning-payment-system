'use client';

import { useState, useEffect } from 'react';
import { useAuthFetch } from '@/lib/auth-fetch';

export default function UsersListPage() {
    const authFetch = useAuthFetch();
    
    const [users, setUsers] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
    const [filters, setFilters] = useState({ email: '' });
    const [sort, setSort] = useState({ field: '', order: '' });

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, filters, sort]);

    const fetchUsers = async () => {
        try {
            const query = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                email: filters.email,
                sortField: sort.field,
                sortOrder: sort.order
            });

            const data = await authFetch(`http://localhost:3000/admin/users?${query.toString()}`, {
                method: 'GET',
            });

            setUsers(data.users);
            setPagination((prev) => ({ ...prev, totalPages: data.meta.totalPages }));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleSort = (field) => {
        setSort((prev) => ({
            field,
            order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleDeactivateUser = async (userId) => {
        try {
            await authFetch(`http://localhost:3000/users/${userId}/deactivate`, {
                method: 'PATCH',
            });

            // Update the UI without reloading
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === userId ? { ...user, isActive: false } : user
                )
            );
        } catch (error) {
            console.error('Error deactivating user:', error);
        }
    };

    return (
        <div className='max-w-6xl mx-auto bg-zinc-900 p-6 rounded-lg shadow-md'>
            <h1 className='text-2xl font-bold text-amber-500 mb-4'>Users List</h1>

            <form onSubmit={handleFilterSubmit} className='flex gap-4 mb-6'>
                <input
                    type='text'
                    name='email'
                    value={filters.email}
                    onChange={handleFilterChange}
                    placeholder='Filter by Email'
                    className='border rounded p-2 bg-zinc-800 text-amber-500 placeholder-amber-400'
                />
                <button type='submit' className='bg-amber-500 text-zinc-900 px-4 py-2 rounded hover:bg-amber-600'>
                    Apply Filters
                </button>
            </form>

            <table className='min-w-full bg-zinc-800 text-amber-500 shadow-md rounded-lg'>
                <thead>
                    <tr>
                        <th className='px-6 py-3 border-b cursor-pointer' onClick={() => handleSort('email')}>
                            Email {sort.field === 'email' && (sort.order === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className='px-6 py-3 border-b'>First Name</th>
                        <th className='px-6 py-3 border-b'>Last Name</th>
                        <th className='px-6 py-3 border-b'>Role</th>
                        <th className='px-6 py-3 border-b'>Active</th>
                        <th className='px-6 py-3 border-b'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id} className='hover:bg-zinc-700'>
                            <td className='px-6 py-3 border-b'>{user.email}</td>
                            <td className='px-6 py-3 border-b'>{user.firstName}</td>
                            <td className='px-6 py-3 border-b'>{user.lastName}</td>
                            <td className='px-6 py-3 border-b'>{user.role}</td>
                            <td className='px-6 py-3 border-b'>
                                <span className={user.isActive ? 'text-green-400' : 'text-red-400'}>
                                    {user.isActive ? 'Yes' : 'No'}
                                </span>
                            </td>
                            <td className='px-6 py-3 border-b'>
                                <button
                                    onClick={() => handleDeactivateUser(user._id)}
                                    disabled={!user.isActive}
                                    className={`px-4 py-2 rounded ${
                                        user.isActive
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                    }`}
                                >
                                    {user.isActive ? 'Deactivate' : 'Deactivated'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className='flex justify-between items-center mt-4'>
                <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className='bg-gray-600 px-4 py-2 rounded disabled:opacity-50'
                >
                    Previous
                </button>
                <span>
                    Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className='bg-gray-600 px-4 py-2 rounded disabled:opacity-50'
                >
                    Next
                </button>
            </div>
        </div>
    );
}
