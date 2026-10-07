/* TechCycle · public shell · locked system: design.md
 * Nav: 2-tier sticky (logo + pill search, strip kategori pill).
 * Footer: mega informatif (kontak asli toko).
 */

import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ChatCircle,
    FacebookLogo,
    InstagramLogo,
    Lightning,
    List,
    MagnifyingGlass,
    MapPin,
    Phone,
    ShieldCheck,
    Storefront,
    TiktokLogo,
    Truck,
    Wrench,
    X,
    YoutubeLogo,
} from '@phosphor-icons/react';
import type { FormEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { WebsiteSetting } from '@/types';

export { formatCurrency, formatShortPrice } from '@/lib/format';

/* ─── Social link helper ─── */

const SOCIAL_ICONS: Record<string, typeof FacebookLogo> = {
    Facebook: FacebookLogo,
    Instagram: InstagramLogo,
    YouTube: YoutubeLogo,
    TikTok: TiktokLogo,
};

export function socialLinks(website: WebsiteSetting) {
    return [
        { label: 'Facebook', href: website.facebook_url },
        { label: 'Instagram', href: website.instagram_url },
        { label: 'YouTube', href: website.youtube_url },
        { label: 'TikTok', href: website.tiktok_url },
    ]
        .filter((link): link is { label: string; href: string } =>
            Boolean(link.href),
        )
        .map((link) => ({ ...link, Icon: SOCIAL_ICONS[link.label] ?? null }));
}

/* ─── Logo: file asli kalau ada, kalau tidak monogram petir (designtopnav.md) ─── */

export function LogoMark({
    website,
    size = 'sm',
}: {
    website: WebsiteSetting;
    size?: 'sm' | 'md' | 'nav';
}) {
    if (website.logo) {
        const dims = size === 'md' ? 'h-10 w-10' : 'h-9 w-9';

        return (
            <img
                src={`/storage/${website.logo}`}
                alt={website.website_name}
                className={`${dims} rounded-full object-cover`}
            />
        );
    }

    if (size === 'nav') {
        return (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tc-ink text-white">
                <Lightning
                    className="h-[18px] w-[18px]"
                    weight="fill"
                    aria-hidden="true"
                />
            </span>
        );
    }

    const dims = size === 'md' ? 'h-10 w-10' : 'h-9 w-9';
    const iconDims = size === 'md' ? 'h-5 w-5' : 'h-[18px] w-[18px]';

    return (
        <span
            className={`flex ${dims} items-center justify-center rounded-[10px] bg-tc-ink text-white`}
        >
            <Storefront className={iconDims} weight="fill" aria-hidden="true" />
        </span>
    );
}

/* ─── Nav ─── */

const NAV_ITEMS = [
    { label: 'Laptop', href: '/shop' },
    { label: 'Sewa', href: '/sewa' },
    { label: 'Sparepart', href: '/sparepart' },
    { label: 'Servis', href: '/#services' },
    { label: 'Lacak Servis', href: '/services/track' },
    { label: 'Kontak', href: '/#kontak' },
];

export function PublicHeader({
    website,
    currentPath,
}: {
    website: WebsiteSetting;
    currentPath?: string;
}) {
    const [search, setSearch] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (searchOpen) {
            searchInputRef.current?.focus();
        }
    }, [searchOpen]);

    useEffect(() => {
        if (drawerOpen) {
            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [drawerOpen]);

    useEffect(() => {
        if (!drawerOpen) {
            return;
        }

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setDrawerOpen(false);
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [drawerOpen]);

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = search.trim();

        if (trimmed.length < 2) {
            return;
        }

        router.get('/shop', { search: trimmed }, { preserveState: false });
    };

    function isActive(href: string) {
        return (
            currentPath === href ||
            (href === '/shop' && currentPath?.startsWith('/shop')) ||
            (href === '/sewa' && currentPath?.startsWith('/sewa')) ||
            (href === '/sparepart' && currentPath?.startsWith('/sparepart'))
        );
    }

    return (
        <>
            <header className="tc-header">
                <div className="mx-auto flex h-[72px] max-w-[1280px] items-center gap-8 px-4 md:px-6">
                    <Link
                        href="/"
                        className="flex min-h-[44px] shrink-0 items-center gap-2.5"
                        aria-label={`${website.website_name} - beranda`}
                    >
                        <LogoMark website={website} size="nav" />
                        <span
                            className="hidden text-[1.25rem] min-[400px]:inline"
                            style={{
                                fontFamily: 'var(--font-tc-display)',
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                                lineHeight: 1.2,
                                color: 'var(--color-tc-ink)',
                            }}
                        >
                            {website.website_name}
                        </span>
                    </Link>

                    <nav
                        className="hidden flex-1 items-center justify-center gap-8 md:flex"
                        aria-label="Navigasi utama"
                    >
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm transition-colors duration-150 hover:text-[#111111] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                                style={{
                                    fontWeight: 600,
                                    letterSpacing: '-0.01em',
                                    color: isActive(item.href)
                                        ? '#111111'
                                        : '#52525B',
                                }}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setSearchOpen((open) => !open)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[rgba(228,228,231,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                            style={{ color: '#52525B' }}
                            aria-label={searchOpen ? 'Tutup pencarian' : 'Cari'}
                            aria-expanded={searchOpen}
                        >
                            {searchOpen ? (
                                <X className="h-5 w-5" weight="bold" />
                            ) : (
                                <MagnifyingGlass
                                    className="h-5 w-5"
                                    weight="bold"
                                />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[rgba(228,228,231,0.7)] md:hidden"
                            style={{ color: '#52525B' }}
                            aria-label="Buka menu"
                            aria-expanded={drawerOpen}
                        >
                            <List className="h-5 w-5" weight="bold" />
                        </button>
                    </div>
                </div>

                {searchOpen ? (
                    <div className="border-t border-tc-rule">
                        <form
                            onSubmit={submitSearch}
                            className="mx-auto max-w-[1280px] px-4 py-3 md:px-6"
                        >
                            <label className="tc-search">
                                <MagnifyingGlass
                                    className="h-4 w-4 shrink-0"
                                    weight="bold"
                                    aria-hidden="true"
                                    style={{
                                        color: 'var(--color-tc-secondary)',
                                    }}
                                />
                                <input
                                    ref={searchInputRef}
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                            setSearchOpen(false);
                                        }
                                    }}
                                    placeholder="Cari laptop merek, tipe, atau kode servis…"
                                    aria-label="Cari laptop atau kode servis"
                                />
                                <button
                                    type="submit"
                                    className="tc-btn tc-btn--primary tc-btn--sm"
                                >
                                    Cari
                                </button>
                            </label>
                        </form>
                    </div>
                ) : null}
            </header>

            {drawerOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu"
                    className="fixed inset-0 z-50 md:hidden"
                >
                    <button
                        type="button"
                        aria-label="Tutup menu"
                        onClick={() => setDrawerOpen(false)}
                        className="absolute inset-0 bg-black/40"
                    />
                    <div className="absolute top-0 right-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl">
                        <div className="flex h-16 items-center justify-between border-b border-tc-rule px-4">
                            <div className="flex items-center gap-2.5">
                                <LogoMark website={website} />
                                <span
                                    style={{
                                        fontFamily: 'var(--font-tc-display)',
                                        fontWeight: 800,
                                        color: 'var(--color-tc-ink)',
                                    }}
                                >
                                    Menu
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDrawerOpen(false)}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-tc-media"
                                style={{ color: 'var(--color-tc-ink)' }}
                                aria-label="Tutup"
                            >
                                <X className="h-5 w-5" weight="bold" />
                            </button>
                        </div>
                        <nav
                            className="flex-1 overflow-y-auto p-3"
                            aria-label="Navigasi mobile"
                        >
                            <ul className="flex flex-col gap-1">
                                {NAV_ITEMS.map((item) => {
                                    const active =
                                        currentPath === item.href ||
                                        (item.href === '/shop' &&
                                            currentPath?.startsWith('/shop')) ||
                                        (item.href === '/sewa' &&
                                            currentPath?.startsWith('/sewa')) ||
                                        (item.href === '/sparepart' &&
                                            currentPath?.startsWith(
                                                '/sparepart',
                                            ));

                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                onClick={() =>
                                                    setDrawerOpen(false)
                                                }
                                                data-active={active}
                                                className="tc-chip w-full border-0 px-4"
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}

/* ─── Footer ─── */

export function PublicFooter({ website }: { website: WebsiteSetting }) {
    const socials = socialLinks(website);
    const year = new Date().getFullYear();

    return (
        <footer className="mt-16 border-t border-tc-rule bg-tc-surface">
            <div className="border-b border-tc-rule">
                <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4 md:px-6">
                    <TrustBadge
                        Icon={ShieldCheck}
                        title="Garansi toko"
                        desc="Setiap unit bergaransi"
                    />
                    <TrustBadge
                        Icon={Truck}
                        title="Pengiriman aman"
                        desc="Packing kayu untuk luar kota"
                    />
                    <TrustBadge
                        Icon={Wrench}
                        title="Servis di tempat"
                        desc="Teknisi berpengalaman"
                    />
                    <TrustBadge
                        Icon={ChatCircle}
                        title="Konsultasi gratis"
                        desc="Chat WhatsApp langsung terjawab"
                    />
                </div>
            </div>

            <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-6">
                <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2.5"
                        >
                            <LogoMark website={website} size="md" />
                            <span
                                style={{
                                    fontFamily: 'var(--font-tc-display)',
                                    fontWeight: 800,
                                    fontSize: '1.125rem',
                                    color: 'var(--color-tc-ink)',
                                }}
                            >
                                {website.website_name}
                            </span>
                        </Link>
                        {website.footer_description && (
                            <p className="mt-3 max-w-sm tc-body">
                                {website.footer_description}
                            </p>
                        )}
                        {website.address && (
                            <div className="mt-4 flex items-start gap-2 tc-body">
                                <MapPin
                                    className="mt-0.5 h-4 w-4 shrink-0"
                                    weight="bold"
                                />
                                <span>{website.address}</span>
                            </div>
                        )}
                        {(website.phone ?? website.whatsapp_number) && (
                            <div className="mt-2 flex items-center gap-2 tc-body">
                                <Phone
                                    className="h-4 w-4 shrink-0"
                                    weight="bold"
                                />
                                <a
                                    href={`tel:${(website.phone ?? website.whatsapp_number ?? '').replace(/[^0-9+]/g, '')}`}
                                    className="hover:underline"
                                    style={{ color: 'var(--color-tc-ink)' }}
                                >
                                    {website.phone ?? website.whatsapp_number}
                                </a>
                            </div>
                        )}
                    </div>

                    <FooterColumn title="Belanja">
                        <FooterLink href="/shop">Katalog laptop</FooterLink>
                        <FooterLink href="/sparepart">
                            Katalog sparepart
                        </FooterLink>
                        <FooterLink href="/shop?sort=price_asc">
                            Termurah
                        </FooterLink>
                        <FooterLink href="/shop?sort=price_desc">
                            Kelas premium
                        </FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Layanan">
                        <FooterLink href="/services/track">
                            Lacak servis
                        </FooterLink>
                        <FooterLink href="/#services">Servis laptop</FooterLink>
                        <FooterLink href="/sewa">Sewa laptop</FooterLink>
                        <FooterLink href="/rentals/track">
                            Lacak sewa
                        </FooterLink>
                        <FooterLink href="/#services">Trade-in</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Bantuan">
                        {website.whatsapp_number && (
                            <FooterLink
                                href={`https://wa.me/${website.whatsapp_number.replace(/[^0-9]/g, '')}`}
                                external
                            >
                                Chat WhatsApp
                            </FooterLink>
                        )}
                        {website.email && (
                            <FooterLink href={`mailto:${website.email}`}>
                                {website.email}
                            </FooterLink>
                        )}
                        <FooterLink href="/#kontak">Kontak kami</FooterLink>
                    </FooterColumn>
                </div>

                {(socials.length > 0 || website.operational_hours_weekday) && (
                    <div className="mt-10 flex flex-col gap-4 border-t border-tc-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
                        {socials.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="tc-caption">Ikuti kami:</span>
                                <div className="flex gap-1">
                                    {socials.map((link) => {
                                        const IconComp = link.Icon;

                                        return (
                                            <a
                                                key={link.label}
                                                href={link.href}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={link.label}
                                                className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-tc-media"
                                                style={{
                                                    color: 'var(--color-tc-secondary)',
                                                }}
                                            >
                                                {IconComp && (
                                                    <IconComp
                                                        className="h-5 w-5"
                                                        weight="regular"
                                                    />
                                                )}
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {website.operational_hours_weekday && (
                            <p className="tc-caption">
                                <span
                                    className="font-semibold"
                                    style={{ color: 'var(--color-tc-ink)' }}
                                >
                                    Jam operasional:
                                </span>{' '}
                                {website.operational_hours_weekday}
                                {website.operational_hours_weekend
                                    ? ` · ${website.operational_hours_weekend}`
                                    : ''}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="border-t border-tc-rule">
                <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-4 tc-caption sm:flex-row sm:items-center sm:justify-between md:px-6">
                    <span>
                        © {year} {website.website_name}. Semua hak dilindungi.
                    </span>
                    <span>Toko laptop bekas dan servis terpercaya.</span>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div>
            <h4
                style={{
                    fontFamily: 'var(--font-tc-display)',
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    color: 'var(--color-tc-ink)',
                }}
            >
                {title}
            </h4>
            <ul className="mt-3 flex flex-col gap-2.5">{children}</ul>
        </div>
    );
}

function FooterLink({
    href,
    children,
    external = false,
}: {
    href: string;
    children: ReactNode;
    external?: boolean;
}) {
    if (external) {
        return (
            <li>
                <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="tc-body transition hover:underline"
                    style={{ color: 'var(--color-tc-ink)' }}
                >
                    {children}
                </a>
            </li>
        );
    }

    return (
        <li>
            <Link
                href={href}
                className="tc-body transition hover:underline"
                style={{ color: 'var(--color-tc-ink)' }}
            >
                {children}
            </Link>
        </li>
    );
}

function TrustBadge({
    Icon,
    title,
    desc,
}: {
    Icon: typeof ShieldCheck;
    title: string;
    desc: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-tc-ink text-white">
                <Icon className="h-5 w-5" weight="bold" />
            </div>
            <div className="min-w-0">
                <p
                    style={{
                        fontFamily: 'var(--font-tc-display)',
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        color: 'var(--color-tc-ink)',
                    }}
                >
                    {title}
                </p>
                <p className="mt-0.5 tc-caption">{desc}</p>
            </div>
        </div>
    );
}

/* ─── Logo WhatsApp asli (lingkaran hijau + gelembung putih) ─── */

function WhatsAppGlyph({ className = 'h-7 w-7' }: { className?: string }) {
    return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
            <circle cx="24" cy="24" r="24" fill="#25D366" />
            <g transform="translate(12, 12)">
                <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
                    fill="#fff"
                />
            </g>
        </svg>
    );
}

export function FloatingWa({ website }: { website: WebsiteSetting }) {
    if (!website.whatsapp_number) {
        return null;
    }

    return (
        <a
            href={`https://wa.me/${website.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo, saya mau tanya.')}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat WhatsApp"
            title="Chat WhatsApp"
            className="fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tc-ink md:right-6 md:bottom-6"
            style={{ filter: 'drop-shadow(0 6px 16px rgb(37 211 102 / 0.45))' }}
        >
            <WhatsAppGlyph className="h-14 w-14" />
        </a>
    );
}

/* ─── Page wrapper ─── */

type PageSeo = {
    title?: string;
};

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
    // Key per URL agar animasi .tc-page-enter terpicu ulang di setiap
    // navigasi (tanpa ini React hanya reconcile dan animasi jalan sekali).
    // seo.title (prop server dari App\Support\Seo) dipakai untuk <Head>
    // agar document.title hasil hidrasi sama persis dengan <title> yang
    // di-render blade — tidak ada flicker judul.
    const { url, props } = usePage<{ seo?: PageSeo }>();
    const headTitle = props.seo?.title ?? title;

    return (
        <>
            <PublicHeader website={website} currentPath={currentPath} />
            <div
                className="min-h-screen overflow-x-clip bg-tc-paper text-tc-ink"
                style={{ fontFamily: 'var(--font-tc-body)' }}
            >
                <Head title={headTitle} />
                <main key={url} className="tc-page-enter">
                    {children}
                </main>
                <PublicFooter website={website} />
                <FloatingWa website={website} />
            </div>
        </>
    );
}
