"use client";

import { usePathname } from "next/navigation";

function SidebarWrapper({ children }) {
  const pathname = usePathname();
  const hideSidebar = pathname === "/" || pathname === "/login" || pathname === "/register" ||  pathname === "/error" || pathname.includes("/payment");

  if (hideSidebar) {
    return null;
  }

  return children;
}

export default SidebarWrapper;