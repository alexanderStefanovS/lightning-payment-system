'use client';

import { useAuthFetch } from '@/lib/auth-fetch';
import { decode, DecodedInvoice } from 'light-bolt11-decoder';
import { use, useEffect, useState } from 'react';

export default function OrganizationWallet({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const authFetch = useAuthFetch();

    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const [lightningInvoice, setLightningInvoice] = useState<string>('');
    const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
    const [transactionState, setTransactionState] = useState<string>('');
    const [amount, setAmount] = useState<number | null>(null);
    const [description, setDescription] = useState<string>('');

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
                setTransactionState(data.state);

                if (data.state === 'success') {
                    setWalletBalance((prev) => (prev !== null ? prev - (amount || 0) : prev));
                }

                if (data.state !== 'pending') {
                    eventSource.close();
                }
            };

            eventSource.onerror = (error) => {
                console.error('SSE connection error:', error);
                setTransactionState('failed');
                eventSource.close();
            };

            setLightningInvoice('');
        } catch (error) {
            console.error('Error processing withdrawal:', error);
            setTransactionState('failed');
        } finally {
            setIsWithdrawing(false);
        }
    };

    const handleLightningInvoiceInput = (invoice: string) => {
        setLightningInvoice(invoice);

        let decodedInvoice: DecodedInvoice;
        try {
            decodedInvoice = decode(invoice);
        } catch {
            return; // Prevents crashes from invalid input.
        }

        const amountSection = decodedInvoice.sections.find((section) => section.name === 'amount');
        const invoiceAmount = amountSection ? +amountSection.value / 1000 : 0;

        const descriptionSection = decodedInvoice.sections.find((section) => section.name === 'description');
        const invoiceDescription = descriptionSection ? descriptionSection.value : '';

        setAmount(invoiceAmount);
        setDescription(invoiceDescription);
    };

    return (
        <div className="max-w-4xl mx-auto bg-zinc-900 p-6 rounded-lg shadow-md text-amber-500">
            <h1 className="text-3xl font-bold mb-6">Organization Wallet</h1>

            {/* Wallet Balance */}
            <div className="bg-zinc-800 p-6 rounded-lg shadow text-center mb-6">
                <p className="text-lg font-semibold">Balance:</p>
                <p className="text-2xl font-bold text-amber-400">
                    {walletBalance !== null ? `${walletBalance} Sats` : 'Loading...'}
                </p>
            </div>

            {/* Withdraw Section */}
            <div className="bg-zinc-800 p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-3">Withdraw Funds</h2>
                <input
                    type="text"
                    value={lightningInvoice}
                    onChange={(e) => handleLightningInvoiceInput(e.target.value)}
                    placeholder="Enter Lightning Invoice"
                    className="bg-zinc-700 border border-zinc-600 rounded-lg w-full p-3 mb-2 focus:ring-2 focus:ring-amber-500 outline-none text-white"
                />
                {amount !== null && (
                    <div className="bg-zinc-700 p-3 rounded-lg mb-4">
                        <p>
                            <strong>Amount:</strong> {amount} Sats
                        </p>
                        <p>
                            <strong>Description:</strong> {description}
                        </p>
                    </div>
                )}

                {/* Withdraw Button */}
                <button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || !lightningInvoice}
                    className={`w-full text-white px-4 py-2 rounded ${isWithdrawing || !lightningInvoice
                            ? 'bg-zinc-600 cursor-not-allowed'
                            : 'bg-amber-500 hover:bg-amber-600 transition'
                        }`}
                >
                    {isWithdrawing ? 'Processing...' : 'Withdraw'}
                </button>
            </div>

            {/* Transaction State Display */}
            {transactionState && (
                <div
                    className={`mt-6 p-4 rounded-lg text-center font-bold ${transactionState === 'success'
                            ? 'bg-green-700 text-green-200'
                            : transactionState === 'failed'
                                ? 'bg-red-700 text-red-200'
                                : 'bg-yellow-700 text-yellow-200'
                        }`}
                >
                    {transactionState === 'pending' && 'Transaction in progress...'}
                    {transactionState === 'success' && 'Withdrawal successful!'}
                    {transactionState === 'failed' && 'Transaction failed. Please try again.'}
                </div>
            )}
        </div>
    );
}
