import type { Metadata } from "next";
import "./globals.css";
import SidebarWrapper from "@/components/SidebarWrapper";
import Image from 'next/image';
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Lightning payment system",
  description: "Client side of Lightning payment system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen flex flex-col">
        <header className="bg-zinc-900 text-white p-4 text-xl flex justify-normal border-b border-zinc-700">
          <Image src="/bitcoin.png" alt="Icon" width={75} height={75} />
          <span className="inline-block text-amber-500 pt-2">Lightning Payments</span>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <SidebarWrapper>
            <Sidebar />
          </SidebarWrapper>
          <main className="flex-1 p-4 bg-zinc-950 text-amber-500 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
