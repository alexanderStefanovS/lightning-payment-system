'use client';

import { useAuthFetch } from '@/lib/auth-fetch';
import { use, useEffect, useState } from 'react';

export default function OrganizationTransactions({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const authFetch = useAuthFetch();

    const [transactionsData, setTransactionsData] = useState<any>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
    const [filters, setFilters] = useState({
        amount: '',
        amountPriceInDollars: '',
        description: '',
        state: '',
        startDate: '',
        endDate: '',
    });
    const [sort, setSort] = useState({ field: '', order: '' });

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const query = new URLSearchParams({
                    page: pagination.page.toString(),
                    limit: pagination.limit.toString(),
                    ...filters,
                    sortField: sort.field,
                    sortOrder: sort.order,
                });

                const data = await authFetch(`http://localhost:3000/transaction/per-org/${orgId}?${query.toString()}`, {
                    method: 'GET',
                });

                setTransactionsData(data);
                setPagination((prev) => ({ ...prev, totalPages: data.meta.totalPages }));
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };

        fetchTransactions();
    }, [orgId, pagination.page, pagination.limit, filters, sort]);

    const handlePageChange = (newPage: number) => setPagination((prev) => ({ ...prev, page: newPage }));

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleSort = (field: string) => {
        setSort((prev) => ({
            field,
            order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleExport = async () => {
        try {
            const query = new URLSearchParams({
                ...filters,
                sortField: sort.field,
                sortOrder: sort.order,
            });

            const csv = await authFetch(`http://localhost:3000/transaction/export/${orgId}?${query.toString()}`, { method: 'GET' }, { isText: true });

            const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions_${orgId}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting transactions:', error);
        }
    };

    if (!transactionsData) {
        return <div className='text-center py-6 text-lg font-bold'>Loading transactions...</div>;
    }

    return (
        <div className='max-w-6xl mx-auto p-6 bg-zinc-900 text-amber-500 rounded-lg shadow-lg'>
            <h1 className='text-2xl font-bold mb-6'>Transactions</h1>

            {/* Filters */}
            <form onSubmit={handleFilterSubmit} className='mb-6 flex flex-wrap gap-4'>
                <input type='number' name='amount' value={filters.amount} onChange={handleFilterChange} placeholder='Amount'
                    className='bg-zinc-800 text-white border border-gray-700 rounded focus:ring-amber-500 p-2 focus:ring-2' />
                <input type='number' name='amountPriceInDollars' value={filters.amountPriceInDollars} onChange={handleFilterChange}
                    placeholder='Amount in dollars' className='bg-zinc-800 text-white border border-gray-700 rounded focus:ring-amber-500 p-2 focus:ring-2' />
                <input type='text' name='description' value={filters.description} onChange={handleFilterChange} placeholder='Description'
                    className='bg-zinc-800 text-white border border-gray-700 rounded focus:ring-amber-500 p-2 focus:ring-2' />
                <select name='state' value={filters.state} onChange={handleFilterChange}
                    className='bg-zinc-800 text-white border border-gray-700 rounded focus:ring-amber-500 p-2 focus:ring-2'>
                    <option value=''>All States</option>
                    <option value='OPEN'>Open</option>
                    <option value='ACCEPTED'>Completed</option>
                    <option value='SETTLED'>Settled</option>
                    <option value='CANCELED'>Canceled</option>
                </select>
                <input type='datetime-local' name='startDate' value={filters.startDate} onChange={handleFilterChange}
                    className='bg-zinc-800 text-white border border-gray-700 rounded focus:ring-amber-500 p-2 focus:ring-2' />
                <input type='datetime-local' name='endDate' value={filters.endDate} onChange={handleFilterChange}
                    className='bg-zinc-800 text-white border border-gray-700 rounded focus:ring-amber-500 p-2 focus:ring-2' />
                <button type='submit' className='bg-amber-500 text-zinc-800 px-4 py-2 rounded hover:opacity-80'>
                    Apply Filters
                </button>
            </form>

            {/* Export Button */}
            <div className='mb-4 flex justify-end'>
                <button onClick={handleExport} className='bg-amber-500 text-zinc-800 px-4 py-2 rounded hover:opacity-80'>
                    Export as CSV
                </button>
            </div>

            {/* Transactions Table */}
            <div className='overflow-x-auto'>
                <table className='w-full bg-gray-100 shadow-lg rounded-lg border border-gray-200'>
                    <thead className='bg-gray-300 text-gray-900'>
                        <tr>
                            {['amount', 'amountPriceInDollars', 'state', 'date'].map((field) => (
                                <th key={field} className='px-6 py-3 border-b cursor-pointer' onClick={() => handleSort(field)}>
                                    {field.replace(/([A-Z])/g, ' $1').trim()} {sort.field === field && (sort.order === 'asc' ? '↑' : '↓')}
                                </th>
                            ))}
                            <th className='px-6 py-3 border-b'>Description</th>
                        </tr>
                    </thead>
                    <tbody className='text-gray-800'>
                        {transactionsData.transactions.map((tx) => (
                            <tr key={tx.id} className='hover:bg-gray-200 transition'>
                                <td className='px-6 py-3 border-b'>{tx.amount}</td>
                                <td className='px-6 py-3 border-b'>{tx.amountPriceInDollars}</td>
                                <td className='px-6 py-3 border-b'>{tx.state}</td>
                                <td className='px-6 py-3 border-b'>{new Date(tx.date).toLocaleDateString()}</td>
                                <td className='px-6 py-3 border-b'>{tx.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className='flex justify-between items-center mt-6'>
                <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className='bg-gray-400 text-white px-4 py-2 rounded disabled:opacity-50'>
                    Previous
                </button>
                <span>Page {pagination.page} of {pagination.totalPages}</span>
                <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className='bg-gray-400 text-white px-4 py-2 rounded disabled:opacity-50'>
                    Next
                </button>
            </div>
        </div>
    );
}
