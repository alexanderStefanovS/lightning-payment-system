'use client';

import { usePathname } from "next/navigation";

function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-zinc-900 h-screen p-4 shadow-lg">
            <nav>
                <ul className="space-y-3">
                    <li>
                        <a
                            href="/profile"
                            className={`block px-4 py-2 rounded-lg transition-all duration-300 ${pathname === '/profile'
                                    ? 'bg-amber-500 text-zinc-900'
                                    : 'text-amber-500 hover:bg-amber-500 hover:text-zinc-900 active:bg-amber-600'
                                }`}
                        >
                            Profile
                        </a>
                    </li>
                    <li>
                        <a
                            href="/organizations"
                            className={`block px-4 py-2 rounded-lg transition-all duration-300 ${pathname.startsWith('/organizations')
                                    ? 'bg-amber-500 text-zinc-900'
                                    : 'text-amber-500 hover:bg-amber-500 hover:text-zinc-900 active:bg-amber-600'
                                }`}
                        >
                            Organizations
                        </a>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;