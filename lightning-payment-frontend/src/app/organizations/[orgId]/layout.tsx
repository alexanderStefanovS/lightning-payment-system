import { use } from "react";

export default function OrganizationLayout({ children, params }: { children: any, params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);

    return (
        <div>
            <nav className='flex space-x-4 border-b pb-2 mb-4'>
                <a href={`/organizations/${orgId}/info`} className='text-blue-500 hover:underline'>
                    Info
                </a>
                <a href={`/organizations/${orgId}/tokens`} className='text-blue-500 hover:underline'>
                    Tokens
                </a>
                <a href={`/organizations/${orgId}/transactions`} className='text-blue-500 hover:underline'>
                    Transactions
                </a>
                <a href={`/organizations/${orgId}/wallet`} className='text-blue-500 hover:underline'>
                    Wallet
                </a>
            </nav>
            {children}
        </div>
    );
}
