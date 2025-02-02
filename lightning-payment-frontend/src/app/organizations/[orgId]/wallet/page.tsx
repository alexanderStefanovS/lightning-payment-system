'use client';

import { useAuthFetch } from '@/lib/auth-fetch';
import { decode, DecodedInvoice } from 'light-bolt11-decoder';
import { use, useEffect, useState } from 'react';

export default function OrganizationWallet({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const [lightningInvoice, setLightningInvoice] = useState<string>('');
    const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
    const [transactionState, setTransactionState] = useState<string>('');
    const [amount, setAmount] = useState<number | null>(null);
    const [description, setDescription] = useState<string>('');

    const authFetch = useAuthFetch();

    useEffect(() => {
        const fetchWalletBalance = async () => {
            try {
                const data = await authFetch(`http://localhost:3000/wallet/org-balance/${orgId}`, { method: 'GET' });

                setWalletBalance(data.balance);
            } catch (error) {
                console.error('Error fetching wallet balance:', error);
            }
        };

        fetchWalletBalance();
    }, [orgId]);

    const handleWithdraw = async () => {
        setIsWithdrawing(true);
        setTransactionState('pending');

        try {
            const data = await authFetch(`http://localhost:3000/wallet/${orgId}/withdraw`, {
                method: 'POST',
                body: JSON.stringify({ lightningInvoice }),
            });

            const transactionId = data.transactionId;

            const eventSource = new EventSource(`http://localhost:3000/transaction/${transactionId}/state/stream`);

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.state !== 'pending') {
                    setTransactionState(data.state);
                }

                if (data.state === 'success') {
                    setWalletBalance((prev) => (prev !== null ? prev - (amount || 0) : prev));
                }

                eventSource.close();
            };

            eventSource.onerror = (error) => {
                console.log('SSE connection error:', error);
                setTransactionState('failed');
                eventSource.close();
            };

            setLightningInvoice('');
        } catch (error) {
            console.error('Error processing withdrawal:', error);
        } finally {
            setIsWithdrawing(false);
            setTransactionState('failed');
        }
    };

    const handleLightningInvoiceInput = (lightningInvoice: string) => {
        setLightningInvoice(lightningInvoice);

        let decodedInvoice: DecodedInvoice;

        try {
            decodedInvoice = decode(lightningInvoice);
        } catch {
            throw new Error('Invalid invoice');
        }

        const amountSection = decodedInvoice.sections.find(section => section.name === 'amount');
        const invoiceAmount = amountSection ? +amountSection.value / 1000 : 0;
        const descriptionSection = decodedInvoice.sections.find(section => section.name === 'description');
        const invoiceDescription = descriptionSection ? descriptionSection.value : '';

        if (!invoiceAmount || !invoiceDescription) {
            throw new Error('Invalid invoice');
        }

        setAmount(invoiceAmount);
        setDescription(invoiceDescription);
    }

    return (
        <div className='max-w-md mx-auto bg-white p-6 rounded shadow-md'>
            <h1 className='text-2xl font-bold mb-4'>Organization Wallet</h1>
            <p className='mb-2'>
                <strong>Balance:</strong> {walletBalance !== null ? `${walletBalance} Sats` : 'Loading...'}
            </p>

            <div className='mt-4'>
                <input
                    type='text'
                    value={lightningInvoice}
                    onChange={(e) => handleLightningInvoiceInput(e.target.value)}
                    placeholder='Enter Lightning Invoice'
                    className='border rounded p-2 w-full mb-2'
                />
                <p>Amount: {amount}</p>
                <p>Description: {description}</p>
                <button
                    onClick={handleWithdraw}
                    disabled={
                        isWithdrawing ||
                        !lightningInvoice
                    }
                    className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full'
                >
                    {isWithdrawing ? 'Processing...' : 'Withdraw'}
                </button>
            </div>
            <h1>{transactionState}</h1>
        </div>
    );
}
