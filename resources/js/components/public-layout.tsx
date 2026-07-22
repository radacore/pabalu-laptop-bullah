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
    const dims = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
    const iconDims = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

    if (website.logo_url) {
        return (
            <img
                src={website.logo_url}
                alt={`${website.website_name} logo`}
                className={`${dims} rounded-md object-cover`}
            />
        );
    }

    return (
        <span
            className={`flex ${dims} items-center justify-center rounded-md bg-graphite text-paper`}
        >
            <Laptop className={iconDims} weight="duotone" aria-hidden="true" />
        </span>
    );
}

/* ─── Public Header (Apple-style 44px sticky) ─── */

const navItems = [
    { label: 'Laptop', href: '/shop', activeHref: '/shop' },
    { label: 'Servis', href: '/#services', activeHref: '/#services' },
    { label: 'Lacak servis', href: '/#status', activeHref: '/#status' },
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
        <header className="sticky top-0 z-50 h-11 border-b border-bone/60 bg-paper/80 backdrop-blur-md">
            <div className="mx-auto flex h-11 max-w-[980px] items-center justify-between px-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-graphite focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-apple-blue"
                >
                    <LogoMark website={website} size="sm" />
                    <span className="apple-body-sm font-semibold text-graphite">
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
                                className={`rounded-full px-3 py-1 apple-caption transition ${
                                    isActive
                                        ? 'text-apple-blue'
                                        : 'text-graphite opacity-80 hover:opacity-100'
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
                        className="hidden apple-caption text-graphite opacity-80 transition hover:opacity-100 sm:inline"
                    >
                        Login
                    </Link>
                    <Link
                        href="/shop"
                        className="inline-flex h-7 items-center justify-center rounded-pill bg-button-blue px-3.5 apple-caption text-paper transition hover:bg-deep-link-blue"
                    >
                        Beli
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
        <footer className="border-t border-bone bg-cloud">
            <div className="mx-auto grid max-w-[980px] gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
                <div>
                    <Link href="/" className="flex items-center gap-2">
                        <LogoMark website={website} size="sm" />
                        <span className="apple-body-sm font-semibold text-graphite">
                            {website.website_name}
                        </span>
                    </Link>
                    <p className="mt-3 max-w-sm apple-body-sm text-fog">
                        {website.footer_description ??
                            'Laptop refurbished terkurasi dan perbaikan hardware profesional dengan progres yang bisa Anda pantau sendiri.'}
                    </p>
                </div>

                <div>
                    <h4 className="apple-caption text-graphite">Halaman</h4>
                    <div className="mt-3 grid gap-2 apple-body-sm text-slate-2">
                        <Link
                            href="/shop"
                            className="text-apple-blue transition hover:text-deep-link-blue"
                        >
                            Katalog laptop
                        </Link>
                        <Link
                            href="/#status"
                            className="text-apple-blue transition hover:text-deep-link-blue"
                        >
                            Lacak servis
                        </Link>
                        <Link
                            href="/#services"
                            className="text-apple-blue transition hover:text-deep-link-blue"
                        >
                            Layanan servis
                        </Link>
                    </div>
                </div>

                <div>
                    <h4 className="apple-caption text-graphite">Hubungi</h4>
                    <div className="mt-3 grid gap-2 apple-body-sm text-slate-2">
                        {(website.phone ?? website.whatsapp_number) ? (
                            <a
                                href={`tel:${(website.phone ?? website.whatsapp_number ?? '').replace(/[^0-9+]/g, '')}`}
                                className="text-apple-blue transition hover:text-deep-link-blue"
                            >
                                {website.phone ?? website.whatsapp_number}
                            </a>
                        ) : null}
                        {website.address ? (
                            <span className="text-fog">{website.address}</span>
                        ) : null}
                        {socials.map((link) => {
                            const IconComp = link.Icon;

                            return (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-apple-blue transition hover:text-deep-link-blue"
                                >
                                    {IconComp ? (
                                        <IconComp
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                    ) : null}
                                    {link.label}
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="border-t border-bone">
                <div className="mx-auto flex max-w-[980px] flex-col gap-1 px-4 py-4 text-center apple-caption text-fog md:flex-row md:items-center md:justify-between md:text-left">
                    <span>
                        © {new Date().getFullYear()} {website.website_name}.
                    </span>
                </div>
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
        <div className="min-h-screen overflow-x-hidden bg-cloud text-graphite">
            <Head title={title} />
            <PublicHeader website={website} currentPath={currentPath} />
            <main className="bg-cloud">{children}</main>
            <PublicFooter website={website} />
        </div>
    );
}
