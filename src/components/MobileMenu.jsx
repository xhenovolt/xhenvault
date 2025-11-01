import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Wallet,
  Settings,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={22} />,
  },
  { label: "Users", href: "/users", icon: <Users size={22} /> },
  { label: "CRM", href: "/clients", icon: <Briefcase size={22} /> },
  { label: "Finance", href: "/wallets", icon: <Wallet size={22} /> },
  { label: "Settings", href: "/settings", icon: <Settings size={22} /> },
];

const MobileMenu = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-950 dark:to-purple-950 dark:via-blue-950 text-gray-900 dark:text-white border-t border-gray-800 flex justify-between items-center px-2 py-1 z-50">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex flex-col items-center justify-center flex-1 py-2 text-gray-300 hover:text-white"
        >
          {item.icon}
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default MobileMenu;