/* TechCycle · home · locked system: design.md
 * Hero display oversized + floating search overlap + grid katalog + servis.
 */

import { Link, router, usePage } from '@inertiajs/react';
import {
    ChatCircle,
    Cpu,
    Handshake,
    Laptop as LaptopIcon,
    MagnifyingGlass,
    MapPin,
    TrendUp,
    Wrench,
} from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { PublicPage } from '@/components/public-layout';
import Reveal from '@/components/shared/reveal';
import { formatShortPrice, formatSoldCount } from '@/lib/format';
import { mockCommerce, originalPrice } from '@/lib/mock-commerce';
import type { Brand, Laptop, Testimonial, WebsiteSetting } from '@/types';

interface Props extends Record<string, unknown> {
    laptops: Laptop[];
    brands: Array<Pick<Brand, 'id' | 'name' | 'slug'>>;
    testimonials: Testimonial[];
    website: WebsiteSetting;
}

/* ─── Helpers (data asli, bukan ilustrasi palsu) ─── */

function primaryPhoto(laptop: Laptop): string | null {
    const photo = laptop.photos?.[0];

    if (!photo?.file_path) {
        return null;
    }

    return `/storage/${photo.file_path}`;
}

function laptopTitle(laptop: Laptop): string {
    if (laptop.name && laptop.name.trim().length > 0) {
        return laptop.name;
    }

    const parts: string[] = [];

    if (laptop.brand?.name) {
        parts.push(laptop.brand.name);
    }

    if (laptop.model) {
        parts.push(laptop.model);
    }

    return parts.join(' ') || laptop.sku || 'Laptop';
}

/* ─── Page ─── */

export default function Welcome() {
    const { props } = usePage<Props>();
    const { laptops, brands, testimonials, website } = props;
    const [heroSearch, setHeroSearch] = useState('');

    function submitHeroSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmed = heroSearch.trim();

        if (trimmed.length < 2) {
            return;
        }

        router.get('/shop', { search: trimmed });
    }

    return (
        <PublicPage
            website={website}
            title={`${website.website_name} | Laptop & Servis Terpercaya`}
            currentPath="/"
        >
            {/* HERO: kanvas foto + overlay + display masked + search overlap */}
            <section className="bg-tc-paper">
                <div className="mx-auto max-w-[1280px] px-4 pt-6 md:px-6 md:pt-10">
                    <div
                        className="relative h-[400px] overflow-hidden rounded-[28px] border border-[#E5E7EB] md:h-[480px] lg:h-[540px]"
                        style={{ background: '#18181B' }}
                    >
                        <img
                            src={
                                website.hero_image_url ??
                                '/images/hero-default.webp'
                            }
                            alt=""
                            aria-hidden="true"
                            decoding="async"
                            fetchPriority="high"
                            className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.9) 100%)',
                            }}
                            aria-hidden="true"
                        />
                        <div className="relative z-10 flex h-full flex-col justify-end p-6 pb-16 md:p-10 md:pb-20 lg:p-12 lg:pb-24">
                            <h1 className="tc-hero-display">
                                {website.website_name}
                            </h1>
                            <p
                                className="mt-4 max-w-xl"
                                style={{
                                    fontSize: '0.9375rem',
                                    fontWeight: 500,
                                    lineHeight: 1.5,
                                    color: '#E4E4E7',
                                }}
                            >
                                Setiap unit diperiksa menyeluruh oleh teknisi
                                sebelum dijual. Datang, cek fisik langsung, bawa
                                pulang.
                            </p>
                        </div>
                    </div>

                    {/* Floating search: overlap garis bawah hero */}
                    <div className="relative z-20 mx-auto -mt-8 max-w-[768px] px-2">
                        <form
                            onSubmit={submitHeroSearch}
                            className="tc-search-float"
                        >
                            <MagnifyingGlass
                                className="h-5 w-5 shrink-0"
                                weight="bold"
                                aria-hidden="true"
                                style={{ color: '#A1A1AA' }}
                            />
                            <input
                                type="search"
                                value={heroSearch}
                                onChange={(e) => setHeroSearch(e.target.value)}
                                placeholder="Cari MacBook, ThinkPad, ROG…"
                                aria-label="Cari laptop"
                            />
                            <button
                                type="submit"
                                className="tc-btn tc-btn--primary"
                            >
                                Cari
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* QUICK LINKS */}
            <Reveal>
                <QuickLinks />
            </Reveal>

            {/* GRID REKOMENDASI */}
            <Reveal delay={80}>
                <ProductGrid laptops={laptops} brands={brands} />
            </Reveal>

            {/* TESTIMONI */}
            {testimonials.length > 0 && (
                <Reveal delay={80}>
                    <TestimonialsBand testimonials={testimonials} />
                </Reveal>
            )}

            {/* SERVIS + KONTAK */}
            <Reveal delay={80}>
                <ServicesCTA website={website} />
            </Reveal>
        </PublicPage>
    );
}

/* ═══════════════════ SECTIONS ═══════════════════ */

const QUICK_LINKS = [
    { label: 'Semua Laptop', href: '/shop', Icon: LaptopIcon },
    { label: 'Termurah', href: '/shop?sort=price_asc', Icon: TrendUp },
    { label: 'Gaming', href: '/shop?search=gaming', Icon: Cpu },
    { label: 'Servis Laptop', href: '/#services', Icon: Wrench },
    { label: 'Lacak Servis', href: '/services/track', Icon: MapPin },
    { label: 'Trade-In', href: '/#services', Icon: Handshake },
    { label: 'Kontak', href: '/#kontak', Icon: ChatCircle },
];

function QuickLinks() {
    return (
        <section className="mx-auto max-w-[1440px] px-4 pt-14 md:px-6">
            <div className="flex gap-2 overflow-x-auto pb-1">
                {QUICK_LINKS.map(({ label, href, Icon }) => (
                    <Link key={label} href={href} className="tc-chip shrink-0">
                        <Icon
                            className="h-4 w-4"
                            weight="bold"
                            aria-hidden="true"
                        />
                        {label}
                    </Link>
                ))}
            </div>
        </section>
    );
}

function ProductGrid({
    laptops,
    brands,
}: {
    laptops: Laptop[];
    brands: Props['brands'];
}) {
    return (
        <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-6 md:py-16">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="tc-h2">Laptop rekomendasi</h2>
                    <p className="mt-2 tc-body">
                        Stok pilihan dari inventaris terbaru kami.
                    </p>
                </div>
                <Link
                    href="/shop"
                    className="tc-btn tc-btn--secondary tc-btn--sm"
                >
                    Lihat katalog
                </Link>
            </div>

            {brands.length > 0 && (
                <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
                    <Link href="/shop" className="tc-chip" data-active="true">
                        Semua
                    </Link>
                    {brands.map((brand) => (
                        <Link
                            key={brand.id}
                            href={`/shop?brands[]=${brand.slug}`}
                            className="tc-chip"
                        >
                            {brand.name}
                        </Link>
                    ))}
                </div>
            )}

            {laptops.length === 0 ? (
                <div className="tc-card p-10 text-center">
                    <LaptopIcon
                        className="mx-auto h-12 w-12"
                        weight="duotone"
                        aria-hidden="true"
                        style={{
                            color: 'var(--color-tc-secondary)',
                            opacity: 0.5,
                        }}
                    />
                    <p className="mt-4 tc-h3">Belum ada laptop tersedia</p>
                    <p className="mx-auto mt-2 max-w-md tc-body">
                        Stok sedang dipersiapkan. Cek katalog lagi nanti atau
                        hubungi kami via WhatsApp.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {laptops.map((laptop, i) => (
                        <Reveal key={laptop.id} delay={(i % 8) * 70}>
                            <ProductCard laptop={laptop} />
                        </Reveal>
                    ))}
                </div>
            )}
        </section>
    );
}

function ProductCard({ laptop }: { laptop: Laptop }) {
    const commerce = mockCommerce(laptop.id);
    const image = primaryPhoto(laptop);
    const orig = originalPrice(laptop.selling_price, commerce.discountPct);

    return (
        <Link
            href={`/shop/${laptop.slug ?? laptop.id}`}
            className="tc-card group flex flex-col p-4"
        >
            <div className="tc-media relative aspect-square">
                {image ? (
                    <img
                        src={image}
                        alt={laptopTitle(laptop)}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <LaptopIcon
                            className="h-14 w-14"
                            weight="duotone"
                            aria-hidden="true"
                            style={{
                                color: 'var(--color-tc-secondary)',
                                opacity: 0.5,
                            }}
                        />
                    </div>
                )}
                {commerce.discountPct > 0 && (
                    <span className="tc-badge tc-badge--promo absolute top-3 left-3">
                        Hemat {commerce.discountPct}%
                    </span>
                )}
            </div>
            <div className="flex flex-1 flex-col gap-1.5 pt-4">
                {laptop.brand?.name && (
                    <p className="tc-caption">{laptop.brand.name}</p>
                )}
                <h3 className="line-clamp-2 min-h-[2.7em] tc-product-title">
                    {laptopTitle(laptop)}
                </h3>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                    <p className="tc-price text-lg">
                        {formatShortPrice(laptop.selling_price)}
                    </p>
                    {orig && (
                        <p
                            className="tc-caption"
                            style={{ textDecoration: 'line-through' }}
                        >
                            {formatShortPrice(orig)}
                        </p>
                    )}
                </div>
                <p className="mt-1 flex items-center gap-1.5 tc-caption">
                    <span className="tc-stars" aria-hidden="true">
                        <StarRating value={commerce.rating} />
                    </span>
                    <span
                        className="font-semibold"
                        style={{ color: 'var(--color-tc-ink)' }}
                    >
                        {commerce.rating.toFixed(1)}
                    </span>
                    <span>· Terjual {formatSoldCount(commerce.soldCount)}</span>
                </p>
                <p className="flex items-center gap-1 tc-caption">
                    <MapPin
                        className="h-3 w-3 shrink-0"
                        weight="fill"
                        aria-hidden="true"
                    />
                    <span className="truncate">{commerce.location}</span>
                </p>
            </div>
        </Link>
    );
}

function StarRating({ value }: { value: number }) {
    const full = Math.max(1, Math.min(5, Math.round(value)));

    return (
        <span
            className="tc-stars"
            role="img"
            aria-label={`${value.toFixed(1)} dari 5 bintang`}
        >
            {Array.from({ length: full }, (_, i) => (
                <svg
                    key={`s-${full}-${i}`}
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M8 1.5l2.1 4.4 4.8.7-3.5 3.4.8 4.8L8 12.6l-4.2 2.2.8-4.8L1.1 6.6l4.8-.7z" />
                </svg>
            ))}
        </span>
    );
}

function TestimonialsBand({ testimonials }: { testimonials: Testimonial[] }) {
    const first3 = useMemo(() => testimonials.slice(0, 3), [testimonials]);

    return (
        <section className="border-t border-tc-rule bg-tc-surface">
            <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-6 md:py-16">
                <h2 className="tc-h2">Kata pelanggan</h2>
                <p className="mt-2 tc-body">
                    Ulasan asli dari pembeli dan pengguna servis.
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    {first3.map((t) => (
                        <figure key={t.id} className="tc-card p-6">
                            <StarRating value={t.rating ?? 5} />
                            <blockquote
                                className="mt-3 flex-1 tc-body"
                                style={{
                                    fontSize: '0.9375rem',
                                    color: 'var(--color-tc-ink)',
                                }}
                            >
                                &ldquo;{t.content}&rdquo;
                            </blockquote>
                            <figcaption className="mt-4 border-t border-tc-rule pt-3">
                                <p
                                    className="text-sm font-semibold"
                                    style={{
                                        fontFamily: 'var(--font-tc-display)',
                                        color: 'var(--color-tc-ink)',
                                    }}
                                >
                                    {t.name}
                                </p>
                                {t.role && (
                                    <p className="mt-0.5 tc-caption">
                                        {t.role}
                                    </p>
                                )}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ServicesCTA({ website }: { website: WebsiteSetting }) {
    // URL share biasa (tanpa /embed) ditolak iframe oleh Google
    // (X-Frame-Options) — tempel output=embed agar tetap tampil.
    const mapSrc = (() => {
        const raw = website.google_maps_embed?.trim();

        if (!raw) {
            return null;
        }

        if (raw.includes('/embed')) {
            return raw;
        }

        return raw.includes('?')
            ? `${raw}&output=embed`
            : `${raw}?output=embed`;
    })();

    return (
        <section
            id="services"
            className="mx-auto max-w-[1440px] scroll-mt-24 px-4 py-12 md:px-6 md:py-16"
        >
            <div className="grid gap-4 md:grid-cols-2">
                <div className="tc-card flex flex-col p-6 md:p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-tc-ink text-white">
                        <Wrench className="h-6 w-6" weight="bold" />
                    </div>
                    <h2 className="mt-4 tc-h2">Servis laptop</h2>
                    <p className="mt-2 tc-body">
                        Kerusakan hardware, software, ganti sparepart, atau
                        upgrade. Teknisi kami handle semua brand dengan garansi
                        pengerjaan.
                    </p>
                    <ul className="mt-4 grid gap-2 tc-body">
                        {[
                            'Estimasi biaya sebelum dikerjakan',
                            'Sparepart original dan alternatif berkualitas',
                            'Update progres via WhatsApp',
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-2">
                                <span
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tc-ink text-white"
                                    aria-hidden="true"
                                >
                                    <svg
                                        viewBox="0 0 12 12"
                                        className="h-3 w-3"
                                        fill="none"
                                        role="presentation"
                                    >
                                        <path
                                            d="M2 6l2.5 2.5L10 3"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-auto flex flex-wrap gap-3 pt-6">
                        {website.whatsapp_number && (
                            <a
                                href={`https://wa.me/${website.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo, saya mau tanya soal servis laptop.')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="tc-btn tc-btn--primary"
                            >
                                <ChatCircle className="h-4 w-4" weight="bold" />
                                Konsultasi via WA
                            </a>
                        )}
                        <Link
                            href="/services/track"
                            className="tc-btn tc-btn--secondary"
                        >
                            Lacak servis saya
                        </Link>
                    </div>
                </div>

                <div
                    id="kontak"
                    className="tc-card flex scroll-mt-24 flex-col p-6 text-white md:p-8"
                    style={{
                        borderColor: 'var(--color-tc-ink)',
                        // background inline (bukan bg-tc-ink): .tc-card
                        // adalah CSS tanpa layer sehingga selalu menang
                        // atas utility bg-*. Teks section ini putih.
                        background: '#111111',
                    }}
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-white/10">
                        <MapPin className="h-6 w-6" weight="bold" />
                    </div>
                    <h2 className="mt-4 tc-h2" style={{ color: '#fff' }}>
                        Kunjungi toko
                    </h2>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-white/75">
                        Datang langsung untuk cek fisik laptop atau konsultasi
                        servis. Kami buka sesuai jam operasional.
                    </p>

                    {mapSrc && (
                        <div className="mt-5 min-h-[260px] flex-1 overflow-hidden rounded-[14px] border border-white/10">
                            <iframe
                                src={mapSrc}
                                title="Lokasi toko Pabalu Laptop"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                                className="block h-full min-h-[260px] w-full border-0"
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
