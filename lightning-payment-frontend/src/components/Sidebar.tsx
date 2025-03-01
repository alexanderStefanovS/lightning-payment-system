'use client';

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthFetch } from "@/lib/auth-fetch";

function Sidebar() {
    const pathname = usePathname();
    const authFetch = useAuthFetch();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const data = await authFetch("http://localhost:3000/auth/check", { method: "GET" }, { redirectLogin: false });

                setRole(data.user.role);
            } catch (error) {
                console.error("Error fetching user role:", error);
            }
        };

        fetchUserRole();
    }, []);

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

                    {role === "USER" && (
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
                    )}

                    {role === "ADMIN" && (
                        <>
                            <li>
                                <a
                                    href="/admin/users-list"
                                    className={`block px-4 py-2 rounded-lg transition-all duration-300 ${pathname.startsWith('/admin/users-list')
                                        ? 'bg-amber-500 text-zinc-900'
                                        : 'text-amber-500 hover:bg-amber-500 hover:text-zinc-900 active:bg-amber-600'
                                        }`}
                                >
                                    Manage Users
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/admin/users-activity"
                                    className={`block px-4 py-2 rounded-lg transition-all duration-300 ${pathname.startsWith('/admin/users-activity')
                                        ? 'bg-amber-500 text-zinc-900'
                                        : 'text-amber-500 hover:bg-amber-500 hover:text-zinc-900 active:bg-amber-600'
                                        }`}
                                >
                                    User Activity Logs
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/admin/register-admin"
                                    className={`block px-4 py-2 rounded-lg transition-all duration-300 ${pathname.startsWith('/admin/register-admin')
                                        ? 'bg-amber-500 text-zinc-900'
                                        : 'text-amber-500 hover:bg-amber-500 hover:text-zinc-900 active:bg-amber-600'
                                        }`}
                                >
                                    Register Admin
                                </a>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;
