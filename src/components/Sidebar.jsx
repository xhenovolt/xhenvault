import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, Users, Building, Briefcase, Wallet, FileText, Calendar, Settings, Palette, LayoutDashboard } from "lucide-react";

const menuItems = [
	{
		label: "Dashboard",
		icon: <LayoutDashboard size={18} />,
		href: "/dashboard",
	},
	{
		label: "Users & Access",
		icon: <Users size={18} />,
		children: [
			{ label: "Users", href: "/users" },
			{ label: "Companies", href: "/companies" },
			{ label: "Branches", href: "/branches" },
		],
	},
	{
		label: "CRM",
		icon: <Briefcase size={18} />,
		children: [
			{ label: "Prospects", href: "/crm/prospects" },
			{ label: "Clients", href: "/crm/clients" },
			{ label: "Deals", href: "/crm/deals" },
			{ label: "Invoices", href: "/crm/invoices" },
		],
	},
	{
		label: "Finance",
		icon: <Wallet size={18} />,
		children: [
			{ label: "Wallets", href: "/finance/wallets" },
			{ label: "Transactions", href: "/finance/transactions" },
			{ label: "Revenue", href: "/finance/revenue" },
			{ label: "Cashflow Rules", href: "/finance/cashflow-rules" },
			{ label: "Allocation Logs", href: "/finance/allocation-logs" },
		],
	},
	{
		label: "Assets & Investments",
		icon: <Building size={18} />,
		children: [
			{ label: "Assets", href: "/assets" },
			{ label: "Asset Income", href: "/asset-income" },
			{ label: "Investments", href: "/investments" },
			{ label: "Investment Income", href: "/investment-income" },
		],
	},
	{
		label: "Planning & Operations",
		icon: <Calendar size={18} />,
		children: [
			{ label: "Events", href: "/operations/events" },
			{ label: "Tasks", href: "/operations/tasks" },
			{ label: "Documents", href: "/operations/documents" },
		],
	},
	{
		label: "Financial Planning",
		icon: <FileText size={18} />,
		children: [
			{ label: "Budgets", href: "/budgets" },
			{ label: "Forecasts", href: "/forecasts" },
		],
	},
	{
		label: "Settings",
		icon: <Settings size={18} />,
		href: "/settings",
	},
	{
		label: "Workers",
		icon: <Users size={18} />,
		href: "/workers",
	},
];

const Sidebar = () => {
	const pathname = typeof window !== "undefined" ? window.location.pathname : "";
	const [collapsed, setCollapsed] = useState(true);
	const [openDropdown, setOpenDropdown] = useState(null);

	return (
		<aside
			className={`hidden md:block h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-950 dark:to-purple-950 dark:via-blue-950 text-gray-900 dark:text-white shadow-lg transition-all duration-300 fixed z-30 ${collapsed ? 'w-16' : 'w-64'}`}
			onMouseEnter={() => setCollapsed(false)}
			onMouseLeave={() => setCollapsed(true)}
		>
			<div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
				<span className="font-bold text-xl tracking-widest">{!collapsed && "XhenVault"}</span>
				<button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded hover:bg-gray-700">
					<Menu size={20} />
				</button>
			</div>
			<nav className="mt-4">
				{menuItems.map((item, idx) => (
					<div key={item.label}>
						{item.children ? (
							<div>
								<button
									className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors ${openDropdown === idx ? 'bg-gray-700' : ''}`}
									onClick={() => setOpenDropdown(openDropdown === idx ? null : idx)}
								>
									<span className="mr-2">{item.icon}</span>
									{!collapsed && <span>{item.label}</span>}
									{!collapsed && <ChevronDown className={`ml-auto transition-transform ${openDropdown === idx ? 'rotate-180' : ''}`} size={16} />}
								</button>
								<div
									className={`overflow-hidden transition-all duration-300 ${openDropdown === idx ? 'max-h-40' : 'max-h-0'}`}
								>
									{item.children.map((child) => (
										<Link
											key={child.label}
											href={child.href}
											className={`block px-8 py-2 text-sm hover:bg-gray-700 ${pathname === child.href ? 'bg-gray-700 font-bold' : ''}`}
										>
											{child.label}
										</Link>
									))}
								</div>
							</div>
						) : (
							<Link
								href={item.href}
								className={`flex items-center px-4 py-2 hover:bg-gray-700 transition-colors ${pathname === item.href ? 'bg-gray-700 font-bold' : ''}`}
							>
								<span className="mr-2">{item.icon}</span>
								{!collapsed && <span>{item.label}</span>}
							</Link>
						)}
					</div>
				))}
			</nav>
		</aside>
	);
};

export default Sidebar;