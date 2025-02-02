'use client';
import { useAuthFetch } from '@/lib/auth-fetch';
import { use, useEffect, useState } from 'react';

export default function OrganizationTransactions({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const [transactionsData, setTransactionsData] = useState<any>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
    const [filters, setFilters] =
        useState({ amount: '', amountPriceInDollars: '', description: '', state: '', startDate: '', endDate: '' });
    const [appliedFilters, setAppliedFilters] =
        useState({ amount: '', amountPriceInDollars: '', description: '', state: '', startDate: '', endDate: '' });
    const [sort, setSort] = useState({ field: '', order: '' });

    const authFetch = useAuthFetch();

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const query = new URLSearchParams({
                    page: pagination.page.toString(),
                    limit: pagination.limit.toString(),
                    ...appliedFilters,
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
    }, [orgId, pagination.page, pagination.limit, appliedFilters, sort]);

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();

        setAppliedFilters(filters);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleSort = (field) => {
        setSort((prev) => ({
            field,
            order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleExport = async () => {
        try {
            const query = new URLSearchParams({
                ...appliedFilters,
                sortField: sort.field,
                sortOrder: sort.order,
            });

            const csv = await authFetch(
                `http://localhost:3000/transaction/export/${orgId}?${query.toString()}`,
                { method: 'GET' },
                true
            );

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
        return <div>Loading transactions...</div>;
    }

    return (
        <div>
            <h1 className='text-2xl font-bold mb-4'>Transactions</h1>

            <div className='flex justify-between'>
                <form onSubmit={handleFilterSubmit} className='mb-4 flex gap-4'>
                    <input
                        type='number'
                        name='amount'
                        value={filters.amount}
                        onChange={handleFilterChange}
                        placeholder='Amount'
                        className='border rounded p-2'
                    />
                    <input
                        type='number'
                        name='amountPriceInDollars'
                        value={filters.amountPriceInDollars}
                        onChange={handleFilterChange}
                        placeholder='Amount in dollars'
                        className='border rounded p-2'
                    />
                    <input
                        type='text'
                        name='description'
                        value={filters.description}
                        onChange={handleFilterChange}
                        placeholder='Description'
                        className='border rounded p-2'
                    />
                    <select
                        name='state'
                        value={filters.state}
                        onChange={handleFilterChange}
                        className='border rounded p-2'
                    >
                        <option value=''>All States</option>
                        <option value='OPEN'>Open</option>
                        <option value='ACCEPTED'>Completed</option>
                        <option value='SETTLED'>Settled</option>
                        <option value='CANCELED'>Canceled</option>
                    </select>
                    <input
                        type='datetime-local'
                        name='startDate'
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        placeholder='Start Date'
                        className='border rounded p-2'
                    />
                    <input
                        type='datetime-local'
                        name='endDate'
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        placeholder='End Date'
                        className='border rounded p-2'
                    />
                    <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded'>
                        Apply Filters
                    </button>
                </form>

                <div className='mb-4'>
                    <button
                        onClick={handleExport}
                        className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
                    >
                        Export as CSV
                    </button>
                </div>
            </div>

            <table className='min-w-full bg-white shadow-md rounded'>
                <thead>
                    <tr>
                        <th className='px-6 py-3 border-b cursor-pointer' onClick={() => handleSort('amount')}>
                            Amount {sort.field === 'amount' && (sort.order === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className='px-6 py-3 border-b cursor-pointer' onClick={() => handleSort('amountPriceInDollars')}>
                            Amount in Dollars {sort.field === 'amountPriceInDollars' && (sort.order === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className='px-6 py-3 border-b'>
                            Description
                        </th>
                        <th className='px-6 py-3 border-b cursor-pointer' onClick={() => handleSort('state')}>
                            State {sort.field === 'state' && (sort.order === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className='px-6 py-3 border-b cursor-pointer' onClick={() => handleSort('date')}>
                            Date {sort.field === 'date' && (sort.order === 'asc' ? '↑' : '↓')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {transactionsData.transactions.map((tx) => (
                        <tr key={tx.id}>
                            <td className='px-6 py-3 border-b'>{tx.amount}</td>
                            <td className='px-6 py-3 border-b'>{tx.amountPriceInDollars}</td>
                            <td className='px-6 py-3 border-b'>{tx.description}</td>
                            <td className='px-6 py-3 border-b'>{tx.state}</td>
                            <td className='px-6 py-3 border-b'>{new Date(tx.date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className='flex justify-between items-center mt-4'>
                <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className='bg-gray-300 px-4 py-2 rounded disabled:opacity-50'
                >
                    Previous
                </button>

                <span>
                    Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className='bg-gray-300 px-4 py-2 rounded disabled:opacity-50'
                >
                    Next
                </button>
            </div>
        </div>
    );
}
