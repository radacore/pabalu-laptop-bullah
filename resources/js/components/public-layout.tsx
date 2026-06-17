import { Head, Link } from '@inertiajs/react';
import {
    FacebookLogo,
    InstagramLogo,
    Laptop,
    TiktokLogo,
    YoutubeLogo,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import type { WebsiteSetting } from '@/types';

/* ─── Currency ─── */

export const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

export function formatCurrency(value: number | string | null | undefined) {
    return currencyFormatter.format(Number(value ?? 0));
}

/* ─── Social links ─── */

export function socialLinks(website: WebsiteSetting) {
    const iconMap: Record<string, typeof FacebookLogo> = {
        Facebook: FacebookLogo,
        Instagram: InstagramLogo,
        YouTube: YoutubeLogo,
        TikTok: TiktokLogo,
    };
    return [
        { label: 'Facebook', href: website.facebook_url },
        { label: 'Instagram', href: website.instagram_url },
        { label: 'YouTube', href: website.youtube_url },
        { label: 'TikTok', href: website.tiktok_url },
    ]
        .filter((link): link is { label: string; href: string } =>
            Boolean(link.href),
        )
        .map((link) => ({ ...link, Icon: iconMap[link.label] ?? null }));
}

/* ─── Logo Mark ─── */

export function LogoMark({
    website,
    size = 'md',
}: {
    website: WebsiteSetting;
    size?: 'sm' | 'md';
}) {
    const dims = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
    const iconDims = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

    if (website.logo_url) {
        return (
            <img
                src={website.logo_url}
                alt={`${website.website_name} logo`}
                className={`${dims} rounded-xl object-cover ring-1 ring-slate-200`}
            />
        );
    }

    return (
        <span
            className={`flex ${dims} items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm`}
        >
            <Laptop className={iconDims} weight="duotone" aria-hidden="true" />
        </span>
    );
}

/* ─── Public Header ─── */

const navItems = [
    { label: 'Laptop', href: '/shop', activeHref: '/shop' },
    { label: 'Servis', href: '/#services', activeHref: '/#services' },
    {
        label: 'Cek Status',
        href: '/#status',
        activeHref: '/#status',
    },
    { label: 'Kontak', href: '/#contact', activeHref: '/#contact' },
];

export function PublicHeader({
    website,
    currentPath,
}: {
    website: WebsiteSetting;
    currentPath?: string;
}) {
    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className="flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                >
                    <LogoMark website={website} />
                    <span className="text-base font-bold tracking-tight text-slate-950 sm:text-lg">
                        {website.website_name}
                    </span>
                </Link>

                <nav
                    className="hidden items-center gap-1 md:flex"
                    aria-label="Navigasi utama"
                >
                    {navItems.map((item) => {
                        const isActive =
                            currentPath === item.activeHref ||
                            (item.activeHref === '/shop' &&
                                currentPath?.startsWith('/shop'));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className="hidden min-h-10 items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 sm:inline-flex"
                    >
                        Login
                    </Link>
                    <Link
                        href="/shop"
                        className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                    >
                        Shop
                    </Link>
                </div>
            </div>
        </header>
    );
}

/* ─── Public Footer ─── */

export function PublicFooter({ website }: { website: WebsiteSetting }) {
    const socials = socialLinks(website);

    return (
        <footer
            id="contact"
            className="border-t border-slate-200 bg-slate-950 text-white"
        >
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
                <div>
                    <Link
                        href="/"
                        className="flex items-center gap-3"
                    >
                        <LogoMark website={website} />
                        <span className="text-lg font-bold tracking-tight">
                            {website.website_name}
                        </span>
                    </Link>
                    <p className="mt-4 max-w-sm text-sm leading-7 text-slate-400">
                        {website.footer_description ??
                            'Solusi terpercaya untuk laptop refurbished berkualitas dan perbaikan hardware profesional.'}
                    </p>
                </div>

                <div>
                    <h4 className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                        Navigasi
                    </h4>
                    <div className="mt-5 grid gap-3 text-sm text-slate-300">
                        <Link
                            href="/shop"
                            className="transition hover:text-white"
                        >
                            Shop
                        </Link>
                        <Link
                            href="/#status"
                            className="transition hover:text-white"
                        >
                            Cek status servis
                        </Link>
                        <Link
                            href="/#services"
                            className="transition hover:text-white"
                        >
                            Servis
                        </Link>
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                        Kontak
                    </h4>
                    <div className="mt-5 grid gap-3 text-sm text-slate-300">
                        {website.phone ?? website.whatsapp_number ? (
                            <span>
                                {website.phone ?? website.whatsapp_number}
                            </span>
                        ) : null}
                        {website.address ? <span>{website.address}</span> : null}
                        {socials.map((link) => {
                            const IconComp = link.Icon;
                            return (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 transition hover:text-white"
                                >
                                    {IconComp && (
                                        <IconComp
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        />
                                    )}
                                    {link.label}
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
                &copy; {new Date().getFullYear()} {website.website_name}. All
                rights reserved.
            </div>
        </footer>
    );
}

/* ─── Page Wrapper ─── */

export function PublicPage({
    website,
    title,
    currentPath,
    children,
}: {
    website: WebsiteSetting;
    title: string;
    currentPath?: string;
    children: ReactNode;
}) {
    return (
        <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 antialiased">
            <Head title={title} />
            <PublicHeader website={website} currentPath={currentPath} />
            <main>{children}</main>
            <PublicFooter website={website} />
        </div>
    );
}
