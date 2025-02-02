import type { Metadata } from "next";
import "./globals.css";
import SidebarWrapper from "@/components/SidebarWrapper";

export const metadata: Metadata = {
  title: "Lightning payment system",
  description: "Client side of Lightning payment system",
};

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-200 h-screen p-4">
      <nav>
        <ul>
          <li className="mb-2">
            <a href="/profile" className="text-gray-700 hover:text-gray-900">
              Profile
            </a>
          </li>
          <li className="mb-2">
            <a href="/organizations" className="text-gray-700 hover:text-gray-900">
              Organizations
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen flex flex-col">
        <header className="bg-gray-800 text-white p-4 text-center text-xl">
          Lightning Payments
        </header>
        <div className="flex flex-1 overflow-hidden">
          <SidebarWrapper>
            <Sidebar />
          </SidebarWrapper>
          <main className="flex-1 p-4 bg-gray-100 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
