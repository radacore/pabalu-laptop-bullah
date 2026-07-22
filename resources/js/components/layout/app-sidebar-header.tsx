import { usePage } from '@inertiajs/react';
import {
    MagnifyingGlass,
    List,
    X,
    Bell,
    CaretDown,
    UserCircle,
    Gear,
    SignOut,
    SidebarSimple,
} from '@phosphor-icons/react';
import { useState } from 'react';

const navItems = [
    { title: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { title: 'Inventory', href: '/laptops', icon: 'laptop_mac' },
    { title: 'Services', href: '/services', icon: 'build' },
    { title: 'Customers', href: '/customers', icon: 'group' },
    { title: 'Finance', href: '/financial-transactions', icon: 'payments' },
    { title: 'Master Data', href: '/master-data', icon: 'database' },
];

function MobileSidebar({
    onClose,
    collapsed,
}: {
    onClose: () => void;
    collapsed: boolean;
}) {
    const { url } = usePage();

    function isActive(href: string) {
        if (href === '/dashboard') {
return url === '/dashboard';
}

        return url.startsWith(href);
    }

    return (
        <div
            className={`fixed top-0 left-0 z-50 flex h-full flex-col border-r border-slate-200 bg-white p-5 shadow-xl transition-all duration-300 md:hidden ${
                collapsed ? 'w-20' : 'w-64'
            }`}
        >
            <div className="mb-6 flex items-center justify-between">
                {!collapsed && (
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm">
                            <span className="material-symbols-outlined text-[22px]">
                                laptop_mac
                            </span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-slate-900">
                                Pabalu Admin
                            </h1>
                            <p className="text-[10px] font-medium tracking-[0.12em] text-slate-500 uppercase">
                                Management
                            </p>
                        </div>
                    </div>
                )}
                {collapsed && (
                    <div className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm">
                        <span className="material-symbols-outlined text-[22px]">
                            laptop_mac
                        </span>
                    </div>
                )}
                <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                    <X className="h-5 w-5" weight="bold" />
                </button>
            </div>
            <ul className="flex-1 space-y-0.5">
                {navItems.map((item) => {
                    const active = isActive(item.href);

                    return (
                        <li key={item.href}>
                            <a
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center rounded-lg text-[14px] font-medium transition-all ${
                                    collapsed
                                        ? 'justify-center px-3 py-3'
                                        : 'gap-3 px-3 py-2.5'
                                } ${
                                    active
                                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <span
                                    className={`material-symbols-outlined text-[20px] ${
                                        active
                                            ? 'fill text-blue-600'
                                            : 'text-slate-400'
                                    }`}
                                >
                                    {item.icon}
                                </span>
                                {!collapsed && <span>{item.title}</span>}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

interface AppSidebarHeaderProps {
    onToggleCollapse: () => void;
    collapsed: boolean;
}

export function AppSidebarHeader({
    onToggleCollapse,
    collapsed,
}: AppSidebarHeaderProps) {
    const { auth } = usePage().props as unknown as {
        auth: { user: { name: string } };
    };
    const { props } = usePage<{ q?: string }>();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const currentQuery = (props as { q?: string }).q ?? '';

    return (
        <>
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
            {mobileMenuOpen && (
                <MobileSidebar
                    onClose={() => setMobileMenuOpen(false)}
                    collapsed={collapsed}
                />
            )}

            <header
                className={`fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 transition-all duration-300 ${
                    collapsed ? 'md:left-20' : 'md:left-64'
                } left-0`}
            >
                <div className="flex items-center gap-4">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
                    >
                        <List className="h-6 w-6" weight="bold" />
                    </button>

                    {/* Collapse toggle button */}
                    <button
                        onClick={onToggleCollapse}
                        className="hidden rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:block"
                        title={
                            collapsed ? 'Expand sidebar' : 'Collapse sidebar'
                        }
                    >
                        <SidebarSimple className="h-5 w-5" weight="bold" />
                    </button>
                </div>

                {/* Search bar */}
                <form
                    method="GET"
                    action="/search"
                    className="relative mx-6 max-w-xl flex-1"
                >
                    <MagnifyingGlass
                        className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
                        weight="duotone"
                    />
                    <input
                        name="q"
                        defaultValue={currentQuery}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-28 pl-12 text-[14px] text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        placeholder="Cari inventaris, tiket, pelanggan..."
                        type="text"
                    />
                    <button
                        type="submit"
                        className="absolute top-1/2 right-2 inline-flex -translate-y-1/2 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
                    >
                        <MagnifyingGlass className="h-4 w-4" weight="bold" />
                        Search
                    </button>
                </form>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <button className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
                        <Bell className="h-5 w-5" weight="duotone" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    </button>

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50"
                        >
                            <div className="hidden flex-col items-end sm:flex">
                                <span className="text-[14px] font-semibold text-slate-900">
                                    {auth.user.name}
                                </span>
                                <span className="text-[11px] font-medium text-slate-500">
                                    Admin
                                </span>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-sm font-bold text-white shadow-sm">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                            <CaretDown
                                className={`h-4 w-4 text-slate-400 transition-transform ${
                                    userMenuOpen ? 'rotate-180' : ''
                                }`}
                                weight="bold"
                            />
                        </button>

                        {/* Dropdown */}
                        {userMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setUserMenuOpen(false)}
                                />
                                <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                                    <div className="border-b border-slate-100 px-4 py-3">
                                        <p className="text-[14px] font-semibold text-slate-900">
                                            {auth.user.name}
                                        </p>
                                        <p className="text-[12px] text-slate-500">
                                            Administrator
                                        </p>
                                    </div>
                                    <div className="py-1">
                                        <a
                                            href="/profile"
                                            className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                        >
                                            <UserCircle
                                                className="h-5 w-5 text-slate-400"
                                                weight="duotone"
                                            />
                                            Profile
                                        </a>
                                        <a
                                            href="/settings"
                                            className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                        >
                                            <Gear
                                                className="h-5 w-5 text-slate-400"
                                                weight="duotone"
                                            />
                                            Settings
                                        </a>
                                    </div>
                                    <div className="border-t border-slate-100 py-1">
                                        <button
                                            onClick={() => {
                                                const form =
                                                    document.createElement(
                                                        'form',
                                                    );
                                                form.method = 'POST';
                                                form.action = '/logout';
                                                const token = document
                                                    .querySelector(
                                                        'meta[name="csrf-token"]',
                                                    )
                                                    ?.getAttribute('content');

                                                if (token) {
                                                    const input =
                                                        document.createElement(
                                                            'input',
                                                        );
                                                    input.type = 'hidden';
                                                    input.name = '_token';
                                                    input.value = token;
                                                    form.appendChild(input);
                                                }

                                                document.body.appendChild(form);
                                                form.submit();
                                            }}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-[14px] font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
                                        >
                                            <SignOut
                                                className="h-5 w-5 text-slate-400"
                                                weight="duotone"
                                            />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}
