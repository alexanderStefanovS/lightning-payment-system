'use client';

import { useState, useEffect } from 'react';
import { useAuthFetch } from '@/lib/auth-fetch';

export default function UsersActivityPage() {
    const authFetch = useAuthFetch();
    
    const [activityLogs, setActivityLogs] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
    const [filters, setFilters] = useState({ email: '', startDate: '', endDate: '' });
    const [sort, setSort] = useState({ field: '', order: '' });
    
    useEffect(() => {
        const fetchActivityLogs = async () => {
            try {
                const query = new URLSearchParams({
                    page: pagination.page.toString(),
                    limit: pagination.limit.toString(),
                    email: filters.email,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    sortField: sort.field,
                    sortOrder: sort.order
                });

                const data = await authFetch(`http://localhost:3000/admin/activity-logs?${query.toString()}`, {
                    method: 'GET',
                });

                setActivityLogs(data.logs);
                setPagination((prev) => ({ ...prev, totalPages: data.meta.totalPages }));
            } catch (error) {
                console.error('Error fetching activity logs:', error);
            }
        };

        fetchActivityLogs();
    }, [pagination.page, filters, sort]);

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

    return (
        <div className='max-w-6xl mx-auto bg-zinc-900 p-6 rounded-lg shadow-md'>
            <h1 className='text-2xl font-bold text-amber-500 mb-4'>User Activity Logs</h1>

            <form onSubmit={handleFilterSubmit} className='flex gap-4 mb-6'>
                <input
                    type='text'
                    name='email'
                    value={filters.email}
                    onChange={handleFilterChange}
                    placeholder='Filter by Email'
                    className='bg-zinc-800 border border-zinc-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-amber-500'
                />
                <input
                    type='datetime-local'
                    name='startDate'
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className='bg-zinc-800 border border-zinc-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-amber-500'
                />
                <input
                    type='datetime-local'
                    name='endDate'
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className='bg-zinc-800 border border-zinc-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-amber-500'
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
                        <th className='px-6 py-3 border-b'>Full Name</th>
                        <th className='px-6 py-3 border-b'>Role</th>
                        <th className='px-6 py-3 border-b'>Action</th>
                        <th className='px-6 py-3 border-b'>Method</th>
                        <th className='px-6 py-3 border-b'>Path</th>
                        <th className='px-6 py-3 border-b cursor-pointer' onClick={() => handleSort('createdAt')}>
                            Date {sort.field === 'createdAt' && (sort.order === 'asc' ? '↑' : '↓')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {activityLogs.map((log) => (
                        <tr key={log.id} className='hover:bg-zinc-700'>
                            <td className='px-6 py-3 border-b'>{log?.user.email}</td>
                            <td className='px-6 py-3 border-b'>{log?.user.firstName} {log?.user.lastName}</td>
                            <td className='px-6 py-3 border-b'>{log?.user.role}</td>
                            <td className='px-6 py-3 border-b'>{log.action}</td>
                            <td className='px-6 py-3 border-b'>{log.method}</td>
                            <td className='px-6 py-3 border-b'>{log.path}</td>
                            <td className='px-6 py-3 border-b'>{new Date(log.createdAt).toLocaleString()}</td>
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
