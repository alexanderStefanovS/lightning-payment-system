'use client';

import Cookies from 'js-cookie';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogOutButton() {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('session');
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-zinc-900 hover:bg-amber-600 transition-all duration-300"
    >
      <LogOut className="w-5 h-5" />
    </button>
  )
}
