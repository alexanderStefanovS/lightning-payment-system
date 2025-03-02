'use client';

import { useAuthFetch } from "@/lib/auth-fetch";
import { usePathname } from "next/navigation";
import { createContext, use, useEffect, useState } from "react";

export const OrganizationContext = createContext<any>(null);

export default function OrganizationLayout({ children, params }: { children: any, params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const [organization, setOrganization] = useState<any>(null);
  const authFetch = useAuthFetch();
  const pathname = usePathname();

  const [tabs, setTabs] = useState([
    { name: 'Info', href: `/organizations/${orgId}/info` },
    { name: 'Tokens', href: `/organizations/${orgId}/tokens` },
    { name: 'Transactions', href: `/organizations/${orgId}/transactions` },
  ]);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const org = await authFetch(`http://localhost:3000/organization/${orgId}`, {
          method: 'GET',
        });

        setOrganization(org);

        if (org.role !== 'VIEWER' && tabs.findIndex((tab) => tab.name === 'Wallet') === -1) {
          setTabs([
            { name: 'Info', href: `/organizations/${orgId}/info` },
            { name: 'Tokens', href: `/organizations/${orgId}/tokens` },
            { name: 'Transactions', href: `/organizations/${orgId}/transactions` },
            { name: 'Wallet', href: `/organizations/${orgId}/wallet` },
          ]);
        }

      } catch (error) {
        console.error('Error fetching organization info:', error);
      }
    };

    fetchOrganization();
  }, []);

  if (!organization) {
    return <div>Loading organization info...</div>
  }

  return (
    <div>
      <nav className="flex space-x-4 border-b border-zinc-700 pb-2 mb-4 bg-zinc-900 p-3 rounded-lg shadow-md">
        {tabs.map((tab) => (
          <a
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${pathname === tab.href
              ? 'bg-amber-500 text-zinc-900 shadow-lg'
              : 'text-amber-500 hover:bg-amber-500 hover:text-zinc-900 active:bg-amber-600'
              }`}
          >
            {tab.name}
          </a>
        ))}
      </nav>
      <OrganizationContext.Provider value={{ organization }}>
        {children}
      </OrganizationContext.Provider>
    </div>
  );
}
