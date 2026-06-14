import { Link, usePage } from '@inertiajs/react';

const navItems = [
    { title: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { title: 'Inventory', href: '/laptops', icon: 'laptop_mac' },
    { title: 'Services', href: '/services', icon: 'build' },
    { title: 'Customers', href: '/customers', icon: 'group' },
    { title: 'Finance', href: '/financial-transactions', icon: 'payments' },
    { title: 'Master Data', href: '/master-data', icon: 'database' },
    { title: 'Pengaturan Website', href: '/website-settings', icon: 'public' },
];

export function AppSidebar() {
    const { url } = usePage();

    function isActive(href: string) {
        if (href === '/dashboard') return url === '/dashboard';
        return url.startsWith(href);
    }

    function handleLogout() {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/logout';
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = '_token';
            input.value = token;
            form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
    }

    return (
        <nav className="bg-surface-container-lowest border-outline-variant fixed top-0 left-0 z-50 hidden h-full w-[280px] flex-col border-r p-gutter shadow-sm md:flex">
            <div className="mb-stack-lg flex items-center gap-3">
                <div className="bg-primary-container text-on-primary-container flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl">
                    <span className="material-symbols-outlined text-[24px]">laptop_mac</span>
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-on-surface">Pabalu Admin</h1>
                    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant">Internal Management</p>
                </div>
            </div>

            <ul className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={
                                    active
                                        ? 'bg-secondary-container text-on-secondary-container flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-bold transition-opacity hover:opacity-90'
                                        : 'text-on-surface-variant hover:bg-surface-container-high flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors'
                                }
                            >
                                <span className={`material-symbols-outlined text-[22px]${active ? ' fill' : ''}`}>{item.icon}</span>
                                <span>{item.title}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <div className="mt-auto space-y-stack-md">
                <button className="bg-secondary text-on-secondary hover:bg-on-secondary-fixed-variant flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider shadow-sm transition-colors">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add New Ticket
                </button>
                <div className="border-outline-variant space-y-1 border-t pt-stack-md">
                    <Link
                        href="/settings"
                        className="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors"
                    >
                        <span className="material-symbols-outlined text-[22px]">settings</span>
                        <span>Settings</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="text-on-surface-variant hover:bg-surface-container-high flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors"
                    >
                        <span className="material-symbols-outlined text-[22px]">logout</span>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
