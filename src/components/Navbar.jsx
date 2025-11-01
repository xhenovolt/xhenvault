import React, { useEffect } from "react";
import Link from "next/link";
import { Palette, Menu, LayoutDashboard, Users, Briefcase } from "lucide-react";
import { useThemeStore } from "../store/themeStore";
import NotificationsBell from './NotificationsBell';

const navbarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Users", href: "/users", icon: <Users size={18} /> },
  { label: "Workers", href: "/workers", icon: <Users size={18} /> },
  { label: "CRM", icon: <Briefcase size={18} />, children: [
    { label: "Prospects", href: "/prospects" },
    { label: "Clients", href: "/clients" },
    { label: "Deals", href: "/deals" },
    { label: "Invoices", href: "/invoices" },
  ]},
];

const moreLinks = [
  // ...all other links as multi-level dropdowns...
];

const Navbar = () => {
  const { theme, setTheme, initTheme } = useThemeStore();
  const [showCustomizer, setShowCustomizer] = React.useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = React.useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = React.useState(false);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <nav className="w-full bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-950 dark:to-purple-950 dark:via-blue-950 text-gray-900 dark:text-white shadow flex items-center justify-between px-6 py-3 fixed z-40">
      <div className="font-bold text-xl tracking-widest text-gray-900 dark:text-white">XhenVault</div>
      <div className="flex items-center gap-4">
        {navbarLinks.map((link) =>
          link.children ? (
            <div className="relative" key={link.label}>
              <button className="flex items-center gap-1 p-2 rounded hover:bg-gray-700 text-gray-900 dark:text-white" onClick={() => setShowMoreDropdown(!showMoreDropdown)}>
                {link.icon}
                <span>{link.label}</span>
              </button>
              {showMoreDropdown && (
                <div className="absolute left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded shadow-lg">
                  {link.children.map((child) => (
                    <Link key={child.label} href={child.href} className="block px-4 py-2 text-left hover:bg-gray-700">
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link key={link.label} href={link.href} className="flex items-center gap-1 p-2 rounded hover:bg-gray-700 text-gray-900 dark:text-white">
              {link.icon}
              <span>{link.label}</span>
            </Link>
          )
        )}
        <div className="relative">
          <button
            className="p-2 rounded hover:bg-gray-700 text-gray-900 dark:text-white"
            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
          >
            <Palette size={20} />
          </button>
          {showThemeDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-700 rounded shadow-lg">
              <button className="block w-full px-4 py-2 text-left hover:bg-gray-700" onClick={() => setTheme('dark')}>Dark Mode</button>
              <button className="block w-full px-4 py-2 text-left hover:bg-gray-700" onClick={() => setTheme('light')}>Light Mode</button>
              <button className="block w-full px-4 py-2 text-left hover:bg-gray-700" onClick={() => setTheme('auto')}>Automatic</button>
              <button className="block w-full px-4 py-2 text-left hover:bg-gray-700" onClick={() => setShowCustomizer(true)}>Customize UI</button>
            </div>
          )}
        </div>
        <div className="relative">
          <button className="p-2 rounded hover:bg-gray-700 text-gray-900 dark:text-white" onClick={() => setShowMoreDropdown(!showMoreDropdown)}>
            More
          </button>
          {showMoreDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded shadow-lg">
              {/* Multi-level dropdown for moreLinks */}
              {/* Example: */}
              <div className="px-4 py-2 font-bold">Finance</div>
              <div className="pl-4">
                <Link href="/wallets" className="block px-4 py-2 hover:bg-gray-700">Wallets</Link>
                <Link href="/transactions" className="block px-4 py-2 hover:bg-gray-700">Transactions</Link>
                {/* Add more links and nested dropdowns as needed */}
              </div>
              {/* Repeat for other categories */}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <NotificationsBell />
        </div>
      </div>
      {showCustomizer && (
        <div className="fixed top-0 right-0 w-96 h-full bg-gray-900 text-white shadow-lg z-50 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-lg">UI/UX Customizer</span>
            <button className="p-2" onClick={() => setShowCustomizer(false)}>Close</button>
          </div>
          {/* Customization canvas: font, color, size, etc. Add your GUI controls here */}
          <div>
            <button className="block w-full px-4 py-2 mb-2 bg-gray-800 rounded hover:bg-gray-700">Change Font</button>
            <button className="block w-full px-4 py-2 mb-2 bg-gray-800 rounded hover:bg-gray-700">Change Font Size</button>
            <button className="block w-full px-4 py-2 mb-2 bg-gray-800 rounded hover:bg-gray-700">Change Font Weight</button>
            <button className="block w-full px-4 py-2 mb-2 bg-gray-800 rounded hover:bg-gray-700">Change Font Color</button>
            {/* Add more customization controls as needed */}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;