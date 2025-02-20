'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { use, useEffect, useState } from 'react';

export default function PaymentPage({ params }: { params: Promise<{ transactionId: string }> }) {
    const { transactionId } = use(params);
    const [transaction, setTransaction] = useState<any>(null);
    const [transactionState, setTransactionState] = useState<string>('');

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const res = await fetch(`http://localhost:3000/transaction/${transactionId}`, {
                    method: 'GET',
                });

                const data = await res.json();
                setTransaction(data);
            } catch (error) {
                console.error('Error fetching transaction:', error);
            }
        };

        fetchTransaction();
    }, [transactionId]);

    useEffect(() => {
        const eventSource = new EventSource(`http://localhost:3000/transaction/${transactionId}/state/stream`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setTransactionState(data.state);
        };

        eventSource.onerror = (error) => {
            console.log('SSE connection error:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [transactionId]);

    if (!transaction) {
        return (
            <div className="w-full h-screen flex justify-center items-center bg-zinc-950 text-amber-500">
                Loading transaction...
            </div>
        );
    }

    return (
        <section className="w-full h-full flex justify-center items-center bg-zinc-950">
            <div className="bg-zinc-900 p-8 rounded-lg shadow-md w-[400px] text-amber-500">
                <h1 className="text-3xl font-bold mb-6 text-center">Transaction Details</h1>

                <p className="mb-2">
                    <span className="text-amber-400 font-semibold">Description:</span> {transaction.description}
                </p>
                <p className="mb-2">
                    <span className="text-amber-400 font-semibold">Amount:</span> {transaction.amount} sats
                </p>
                <p className="mb-4">
                    <span className="text-amber-400 font-semibold">Status:</span> {transactionState}
                </p>

                <div className="mt-6 flex flex-col items-center">
                    <p className="mb-2 text-center text-amber-400 font-semibold">Scan the QR code to pay:</p>
                    <div className="bg-zinc-800 p-4 rounded-lg shadow-lg">
                        <QRCodeCanvas value={transaction.invoicePaymentRequest} size={220} />
                    </div>
                </div>
            </div>
        </section>
    );
}
