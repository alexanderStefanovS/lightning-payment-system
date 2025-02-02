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
        return <div>Loading transaction...</div>;
    }

    return (
        <div className='max-w-md mx-auto bg-white p-6 rounded shadow-md'>
            <h1 className='text-2xl font-bold mb-4'>Transaction Details</h1>
            <p className='mb-2'>
                <strong>Description:</strong> {transaction.description}
            </p>
            <p className='mb-2'>
                <strong>Amount:</strong> {transaction.amount} sats
            </p>
            <p className='mb-2'>
                <strong>Status:</strong> {transactionState}
            </p>
            <div className='mt-4'>
                <p className='mb-2'>
                    <strong>Scan the QR code to pay:</strong>
                </p>
                <QRCodeCanvas value={transaction.invoicePaymentRequest} size={256} />
            </div>
        </div>
    );
}
