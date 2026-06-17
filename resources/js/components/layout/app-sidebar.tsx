import { Link, usePage } from '@inertiajs/react';
import {
    ChartLineUp,
    CurrencyDollar,
    Database,
    Globe,
    Laptop,
    Plus,
    Wrench,
    UsersThree,
} from '@phosphor-icons/react';

const navItems = [
    { title: 'Dashboard', href: '/dashboard', icon: ChartLineUp },
    { title: 'Inventory', href: '/laptops', icon: Laptop },
    { title: 'Services', href: '/services', icon: Wrench },
    { title: 'Customers', href: '/customers', icon: UsersThree },
    { title: 'Finance', href: '/financial-transactions', icon: CurrencyDollar },
    { title: 'Master Data', href: '/master-data', icon: Database },
    { title: 'Website', href: '/website-settings', icon: Globe },
];

interface AppSidebarProps {
    collapsed?: boolean;
}

export function AppSidebar({ collapsed = false }: AppSidebarProps) {
    const { url } = usePage();

    function isActive(href: string) {
        if (href === '/dashboard') return url === '/dashboard';
        return url.startsWith(href);
    }

    return (
        <nav
            className={`fixed top-0 left-0 z-50 hidden h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 md:flex ${
                collapsed ? 'w-20' : 'w-64'
            }`}
        >
            {/* Logo Section - h-16 to align with navbar */}
            <div
                className={`flex h-16 shrink-0 items-center border-b border-slate-200 transition-all duration-300 ${
                    collapsed ? 'justify-center' : 'gap-3 px-5'
                }`}
            >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm">
                    <Laptop className="h-5 w-5" weight="fill" />
                </div>
                {!collapsed && (
                    <div className="flex flex-col">
                        <span className="text-[15px] font-bold tracking-tight text-slate-900">
                            Pabalu
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                            Admin Panel
                        </span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-0.5">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`group relative flex items-center rounded-lg text-[14px] font-medium transition-all ${
                                        collapsed
                                            ? 'justify-center px-3 py-3'
                                            : 'gap-3 px-3 py-2.5'
                                    } ${
                                        active
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon
                                        className={`h-[20px] w-[20px] shrink-0 transition-colors ${
                                            active
                                                ? 'text-blue-600'
                                                : 'text-slate-400 group-hover:text-slate-600'
                                        }`}
                                        weight={active ? 'fill' : 'duotone'}
                                    />
                                    {!collapsed && (
                                        <>
                                            <span>{item.title}</span>
                                            {active && (
                                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
                                            )}
                                        </>
                                    )}
                                    {collapsed && (
                                        <span className="pointer-events-none absolute left-full z-[60] ml-2 hidden whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block">
                                            {item.title}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Footer - New Ticket button */}
            <div className="px-3 py-4">
                <Link
                    href="/services/create"
                    className={`flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98] ${
                        collapsed ? '' : 'w-full'
                    }`}
                    title={collapsed ? 'New Ticket' : undefined}
                >
                    <Plus className="h-4 w-4 shrink-0" weight="bold" />
                    {!collapsed && <span>New Ticket</span>}
                </Link>
            </div>
        </nav>
    );
}
