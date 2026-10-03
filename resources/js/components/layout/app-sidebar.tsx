import { Link, usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    ChartLineUp,
    Cpu,
    CurrencyDollar,
    Database,
    Globe,
    IdentificationBadge,
    Laptop,
    Wrench,
    UsersThree,
} from '@phosphor-icons/react';

interface NavItem {
    title: string;
    href: string;
    icon: typeof Laptop;
    adminOnly?: boolean;
}

const navItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: ChartLineUp },
    { title: 'Inventory', href: '/laptops', icon: Laptop, adminOnly: true },
    { title: 'Services', href: '/services', icon: Wrench },
    { title: 'Rentals', href: '/rentals', icon: CalendarCheck },
    { title: 'Spareparts', href: '/spareparts', icon: Cpu },
    {
        title: 'Customers',
        href: '/customers',
        icon: UsersThree,
        adminOnly: true,
    },
    {
        title: 'Finance',
        href: '/financial-transactions',
        icon: CurrencyDollar,
        adminOnly: true,
    },
    {
        title: 'Staff',
        href: '/staff',
        icon: IdentificationBadge,
        adminOnly: true,
    },
    {
        title: 'Master Data',
        href: '/master-data',
        icon: Database,
        adminOnly: true,
    },
    {
        title: 'Website',
        href: '/website-settings',
        icon: Globe,
        adminOnly: true,
    },
];

interface AppSidebarProps {
    collapsed?: boolean;
}

export function AppSidebar({ collapsed = false }: AppSidebarProps) {
    const { url, props } = usePage();
    const role = (props.auth as { user?: { role?: string } } | undefined)?.user
        ?.role;
    const visibleItems = navItems.filter(
        (item) => !item.adminOnly || role === 'admin',
    );

    function isActive(href: string) {
        if (href === '/dashboard') {
            return url === '/dashboard';
        }

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
                        <span className="text-[10px] font-medium tracking-[0.12em] text-slate-500 uppercase">
                            Admin Panel
                        </span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-0.5">
                    {visibleItems.map((item) => {
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
                                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />
                                            )}
                                        </>
                                    )}
                                    {collapsed && (
                                        <span className="pointer-events-none absolute left-full z-[60] ml-2 hidden rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg group-hover:block">
                                            {item.title}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
}
