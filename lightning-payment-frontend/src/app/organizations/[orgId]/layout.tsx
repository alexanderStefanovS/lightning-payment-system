'use client';

import { usePathname } from "next/navigation";
import { use } from "react";

export default function OrganizationLayout({ children, params }: { children: any, params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);

  const pathname = usePathname();

  const tabs = [
    { name: 'Info', href: `/organizations/${orgId}/info` },
    { name: 'Tokens', href: `/organizations/${orgId}/tokens` },
    { name: 'Transactions', href: `/organizations/${orgId}/transactions` },
    { name: 'Wallet', href: `/organizations/${orgId}/wallet` },
  ];

  return (
    <div>
      <nav className="flex space-x-4 border-b border-zinc-700 pb-2 mb-4 bg-zinc-900 p-3 rounded-lg shadow-md">
        {tabs.map((tab) => (
          <a
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${pathname === tab.href
                ? 'bg-amber-500 text-zinc-900 shadow-lg' // Active Tab Style
                : 'text-amber-500 hover:bg-amber-500 hover:text-zinc-900 active:bg-amber-600'
              }`}
          >
            {tab.name}
          </a>
        ))}
      </nav>
      {children}
    </div>
  );
}
