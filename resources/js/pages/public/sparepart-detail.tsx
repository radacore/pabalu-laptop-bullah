/* TechCycle · detail sparepart · locked system: design.md */

import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    CaretRight,
    Cpu,
    ShieldCheck,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { PublicPage } from '@/components/public-layout';
import Reveal from '@/components/shared/reveal';
import { formatShortPrice } from '@/lib/format';
import type { Sparepart, WebsiteSetting } from '@/types';

interface Props {
    sparepart: Sparepart;
    related: Sparepart[];
    website: WebsiteSetting;
}

function photoSrc(filePath?: string | null) {
    if (!filePath) {
        return null;
    }

    return filePath.startsWith('/') ? filePath : `/storage/${filePath}`;
}

export default function SparepartDetail({
    sparepart,
    related,
    website,
}: Props) {
    const images = (sparepart.photos ?? []).filter((p) => p.file_path);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selected = images[Math.min(selectedIndex, images.length - 1)];
    const waText = encodeURIComponent(
        `Halo, saya tertarik dengan sparepart ${sparepart.name} (${formatShortPrice(sparepart.selling_price)}). Apakah masih tersedia? Link: ${typeof window !== 'undefined' ? window.location.href : ''}`,
    );
    const waNumber = (website.whatsapp_number ?? '6281234567890').replace(
        /[^0-9]/g,
        '',
    );
    const waLink = `https://wa.me/${waNumber}?text=${waText}`;

    return (
        <PublicPage
            website={website}
            title={`${sparepart.name} - ${website.website_name}`}
            currentPath="/sparepart"
        >
            <div className="mx-auto max-w-[1440px] px-4 pt-5 md:px-6">
                <nav
                    className="flex flex-wrap items-center gap-1.5 tc-caption"
                    aria-label="Breadcrumb"
                >
                    <a
                        href="/"
                        className="transition hover:underline"
                        style={{ color: 'var(--color-tc-ink)' }}
                    >
                        Beranda
                    </a>
                    <CaretRight
                        className="h-3 w-3"
                        weight="bold"
                        aria-hidden="true"
                    />
                    <a
                        href="/sparepart"
                        className="transition hover:underline"
                        style={{ color: 'var(--color-tc-ink)' }}
                    >
                        Sparepart
                    </a>
                    <CaretRight
                        className="h-3 w-3"
                        weight="bold"
                        aria-hidden="true"
                    />
                    <span style={{ color: 'var(--color-tc-ink)' }}>
                        {sparepart.type?.name ?? sparepart.name}
                    </span>
                </nav>
            </div>

            <section className="mx-auto max-w-[1440px] px-4 py-8 md:px-6 md:py-12">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                    <div>
                        <div className="tc-media aspect-[4/3]">
                            {selected ? (
                                <img
                                    alt={selected.caption ?? sparepart.name}
                                    src={photoSrc(selected.file_path) ?? ''}
                                    decoding="async"
                                    fetchPriority="high"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
                                    <Cpu
                                        className="h-16 w-16"
                                        weight="duotone"
                                        aria-hidden="true"
                                        style={{
                                            color: 'var(--color-tc-secondary)',
                                            opacity: 0.5,
                                        }}
                                    />
                                    <p className="tc-caption">
                                        Foto produk ini belum tersedia. Hubungi
                                        kami untuk foto asli via WhatsApp.
                                    </p>
                                </div>
                            )}
                        </div>
                        {images.length > 1 ? (
                            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                                {images.map((photo, index) => (
                                    <button
                                        key={photo.id}
                                        type="button"
                                        onClick={() => setSelectedIndex(index)}
                                        aria-label={`Lihat foto ${index + 1}`}
                                        aria-pressed={index === selectedIndex}
                                        className="tc-media h-20 w-20 shrink-0 transition"
                                        style={
                                            index === selectedIndex
                                                ? {
                                                      outline:
                                                          '2px solid var(--color-tc-ink)',
                                                      outlineOffset: 2,
                                                  }
                                                : { opacity: 0.6 }
                                        }
                                    >
                                        <img
                                            alt={
                                                photo.caption ??
                                                `${sparepart.name} foto ${index + 1}`
                                            }
                                            src={
                                                photoSrc(photo.file_path) ?? ''
                                            }
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`tc-badge ${
                                    sparepart.condition === 'baru'
                                        ? 'tc-badge--neutral'
                                        : 'tc-badge--promo'
                                }`}
                            >
                                {sparepart.condition === 'baru'
                                    ? 'Kondisi Baru'
                                    : 'Kondisi Bekas'}
                            </span>
                        </div>
                        <h1 className="mt-2 tc-h1">{sparepart.name}</h1>

                        <p
                            className="mt-5 tc-price"
                            style={{ fontSize: '2rem' }}
                        >
                            {formatShortPrice(sparepart.selling_price)}
                        </p>

                        <p
                            className="mt-5 max-w-xl tc-body"
                            style={{ whiteSpace: 'pre-line' }}
                        >
                            {sparepart.description ??
                                'Sparepart original dan alternatif berkualitas, siap dipasang oleh teknisi kami atau dibawa pulang.'}
                        </p>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="tc-btn tc-btn--primary flex-1"
                            >
                                Beli sekarang
                                <ArrowRight className="h-4 w-4" weight="bold" />
                            </a>
                        </div>

                        <div className="tc-card mt-6 flex items-start gap-3 p-4">
                            <ShieldCheck
                                className="mt-0.5 h-5 w-5 shrink-0"
                                weight="bold"
                                aria-hidden="true"
                                style={{ color: 'var(--color-tc-ink)' }}
                            />
                            <p className="tc-body">
                                <span
                                    className="font-semibold"
                                    style={{ color: 'var(--color-tc-ink)' }}
                                >
                                    Stok tersedia.
                                </span>{' '}
                                Bisa dipasang langsung di workshop atau dibeli
                                terpisah.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {related.length > 0 ? (
                <Reveal>
                    <section className="border-t border-tc-rule bg-tc-surface">
                        <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-6 md:py-14">
                            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                                <h2 className="tc-h2">Sparepart lain</h2>
                                <Link
                                    href="/sparepart"
                                    className="tc-btn tc-btn--secondary tc-btn--sm"
                                >
                                    Lihat semua
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                {related.map((item, i) => (
                                    <Reveal key={item.id} delay={(i % 4) * 70}>
                                        <RelatedCard sparepart={item} />
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </section>
                </Reveal>
            ) : null}

            <div className="sticky bottom-0 z-30 border-t border-tc-rule bg-white/95 px-4 py-3 backdrop-blur md:hidden">
                <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="truncate tc-caption">{sparepart.name}</p>
                        <p className="tc-price text-lg">
                            {formatShortPrice(sparepart.selling_price)}
                        </p>
                    </div>
                    <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="tc-btn tc-btn--primary tc-btn--sm shrink-0"
                    >
                        Beli sekarang
                    </a>
                </div>
            </div>
        </PublicPage>
    );
}

function RelatedCard({ sparepart }: { sparepart: Sparepart }) {
    const image = sparepart.photos?.[0]?.file_path
        ? photoSrc(sparepart.photos[0].file_path)
        : null;

    return (
        <Link
            href={`/sparepart/${sparepart.slug ?? sparepart.id}`}
            className="tc-card group flex flex-col p-3 md:p-4"
        >
            <div className="tc-media relative aspect-square">
                {image ? (
                    <img
                        alt={sparepart.name}
                        src={image}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Cpu
                            className="h-10 w-10"
                            weight="duotone"
                            aria-hidden="true"
                            style={{
                                color: 'var(--color-tc-secondary)',
                                opacity: 0.5,
                            }}
                        />
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col gap-1 pt-3">
                <p className="tc-caption">{sparepart.type?.name ?? ''}</p>
                <h3 className="line-clamp-2 min-h-[2.7em] tc-product-title">
                    {sparepart.name}
                </h3>
                <p className="mt-1 tc-price">
                    {formatShortPrice(sparepart.selling_price)}
                </p>
            </div>
        </Link>
    );
}
