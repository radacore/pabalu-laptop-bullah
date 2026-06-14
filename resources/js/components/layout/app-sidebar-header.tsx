import { usePage } from '@inertiajs/react';
import { useState } from 'react';

const navItems = [
    { title: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { title: 'Inventory', href: '/laptops', icon: 'laptop_mac' },
    { title: 'Services', href: '/services', icon: 'build' },
    { title: 'Customers', href: '/customers', icon: 'group' },
    { title: 'Finance', href: '/financial-transactions', icon: 'payments' },
    { title: 'Master Data', href: '/master-data', icon: 'database' },
];

function MobileSidebar({ onClose }: { onClose: () => void }) {
    const { url } = usePage();

    function isActive(href: string) {
        if (href === '/dashboard') return url === '/dashboard';
        return url.startsWith(href);
    }

    return (
        <div className="bg-surface-container-lowest fixed top-0 left-0 z-50 flex h-full w-[280px] flex-col border-r p-gutter shadow-md md:hidden">
            <div className="mb-stack-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-primary-container text-on-primary-container flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl">
                        <span className="material-symbols-outlined text-[24px]">laptop_mac</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-on-surface">Pabalu Admin</h1>
                        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant">Internal Management</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-on-surface-variant hover:bg-surface-container-low rounded-lg p-1">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            <ul className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <li key={item.href}>
                            <a
                                href={item.href}
                                onClick={onClose}
                                className={
                                    active
                                        ? 'bg-secondary-container text-on-secondary-container flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-bold'
                                        : 'text-on-surface-variant hover:bg-surface-container-high flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold'
                                }
                            >
                                <span className={`material-symbols-outlined text-[22px]${active ? ' fill' : ''}`}>{item.icon}</span>
                                <span>{item.title}</span>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export function AppSidebarHeader() {
    const { auth } = usePage().props as unknown as { auth: { user: { name: string } } };
    const { props } = usePage<{ q?: string }>();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const currentQuery = (props as { q?: string }).q ?? '';

    return (
        <>
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            )}
            {mobileMenuOpen && <MobileSidebar onClose={() => setMobileMenuOpen(false)} />}

            <header className="bg-surface border-outline-variant sticky top-0 z-40 flex h-[72px] w-full flex-shrink-0 items-center justify-between border-b px-gutter shadow-sm">
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="text-on-surface-variant hover:bg-surface-container-low mr-3 rounded-lg p-2 transition-colors md:hidden"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>

                <form
                    method="GET"
                    action="/search"
                    className="relative mr-4 max-w-xl flex-1"
                >
                    <span className="material-symbols-outlined text-outline-variant pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[20px]">search</span>
                    <input
                        name="q"
                        defaultValue={currentQuery}
                        className="bg-surface-container-low border-outline-variant placeholder:text-outline w-full rounded-xl border py-2.5 pr-24 pl-11 text-[15px] transition-all focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                        placeholder="Cari inventaris, tiket, pelanggan..."
                        type="text"
                    />
                    <button
                        type="submit"
                        className="absolute top-1/2 right-2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3.5 py-1.5 text-[13px] font-semibold text-on-secondary shadow-sm transition-colors hover:bg-on-secondary-fixed-variant"
                    >
                        <span className="material-symbols-outlined text-[16px]">search</span>
                        Cari
                    </button>
                </form>

                <div className="flex items-center gap-3">
                    <div className="hidden flex-col items-end sm:flex">
                        <span className="text-[14px] font-semibold text-on-surface">{auth.user.name}</span>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">Admin Panel</span>
                    </div>
                    <div className="bg-primary-container text-on-primary-container flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold">
                        {auth.user.name.charAt(0).toUpperCase()}
                    </div>
                </div>
            </header>
        </>
    );
}
