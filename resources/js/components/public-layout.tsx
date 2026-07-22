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
                className={`${dims} rounded-[14px] object-cover`}
            />
        );
    }

    return (
        <span
            className={`flex ${dims} items-center justify-center rounded-[14px] bg-accent/15 text-accent-deep`}
        >
            <Laptop className={iconDims} weight="duotone" aria-hidden="true" />
        </span>
    );
}

/* ─── Public Header — Hum warm shadow nav ─── */

const navItems = [
    { label: 'Laptop', href: '/shop', activeHref: '/shop' },
    { label: 'Servis', href: '/#services', activeHref: '/#services' },
    { label: 'Lacak servis', href: '/services/track', activeHref: '/services/track' },
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
        <header className="sticky top-0 z-50 bg-paper/90 shadow-[0_1px_3px_oklch(20%_0.012_250/0.06)] backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-[980px] items-center justify-between px-4">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                    <LogoMark website={website} size="sm" />
                    <span className="hum-body-sm font-medium text-ink">
                        {website.website_name}
                    </span>
                </Link>

                <nav
                    className="hidden items-center gap-0.5 md:flex"
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
                                className={`rounded-full px-3.5 py-1.5 hum-caption transition ${
                                    isActive
                                        ? 'text-accent-deep'
                                        : 'text-ink-2 hover:text-ink hover:bg-paper-2'
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
                        className="hidden hum-body-sm text-ink-2 transition hover:text-ink sm:inline"
                    >
                        Login
                    </Link>
                    <Link
                        href="/shop"
                        className="hum-btn hum-btn--pear !px-4 !py-1.5 !text-xs"
                    >
                        Beli
                    </Link>
                </div>
            </div>
        </header>
    );
}

/* ─── Public Footer — Hum warm surface ─── */

export function PublicFooter({ website }: { website: WebsiteSetting }) {
    const socials = socialLinks(website);

    return (
        <footer className="bg-paper-2">
            <div className="mx-auto grid max-w-[980px] gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
                <div>
                    <Link href="/" className="flex items-center gap-2.5">
                        <LogoMark website={website} size="sm" />
                        <span className="hum-body-sm font-medium text-ink">
                            {website.website_name}
                        </span>
                    </Link>
                    <p className="mt-3 max-w-sm hum-body-sm text-ink-2/70">
                        {website.footer_description ??
                            'Laptop refurbished terkurasi dan perbaikan hardware profesional dengan progres yang bisa Anda pantau sendiri.'}
                    </p>
                </div>

                <div>
                    <h4 className="hum-caption text-ink">Halaman</h4>
                    <div className="mt-3 grid gap-2.5 hum-body-sm text-ink-2">
                        <Link
                            href="/shop"
                            className="transition hover:text-accent-2"
                        >
                            Katalog laptop
                        </Link>
                        <Link
                            href="/#status"
                            className="transition hover:text-accent-2"
                        >
                            Lacak servis
                        </Link>
                        <Link
                            href="/#services"
                            className="transition hover:text-accent-2"
                        >
                            Layanan servis
                        </Link>
                    </div>
                </div>

                <div>
                    <h4 className="hum-caption text-ink">Hubungi</h4>
                    <div className="mt-3 grid gap-2.5 hum-body-sm text-ink-2">
                        {(website.phone ?? website.whatsapp_number) ? (
                            <a
                                href={`tel:${(website.phone ?? website.whatsapp_number ?? '').replace(/[^0-9+]/g, '')}`}
                                className="transition hover:text-accent-2"
                            >
                                {website.phone ?? website.whatsapp_number}
                            </a>
                        ) : null}
                        {website.address ? (
                            <span className="text-ink-2/60">
                                {website.address}
                            </span>
                        ) : null}
                        {socials.map((link) => {
                            const IconComp = link.Icon;

                            return (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 transition hover:text-accent-2"
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
            <div className="border-t border-rule/60">
                <div className="mx-auto flex max-w-[980px] flex-col gap-1 px-4 py-4 text-center hum-body-sm text-ink-2/50 md:flex-row md:items-center md:justify-between md:text-left">
                    <span>
                        © {new Date().getFullYear()} {website.website_name}.
                    </span>
                </div>
            </div>
        </footer>
    );
}

/* ─── Page Wrapper — Hum warm canvas ─── */

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
        <div className="min-h-screen overflow-x-hidden bg-paper text-ink">
            <Head title={title} />
            <PublicHeader website={website} currentPath={currentPath} />
            <main className="bg-paper">{children}</main>
            <PublicFooter website={website} />
        </div>
    );
}
