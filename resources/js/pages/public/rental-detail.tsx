/* TechCycle · detail sewa · locked system: design.md */

import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BatteryFull,
    CaretRight,
    ChatCircle,
    Cpu,
    HardDrive,
    Laptop as LaptopIcon,
    Monitor,
    ShieldCheck,
} from '@phosphor-icons/react';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { PublicPage } from '@/components/public-layout';
import Reveal from '@/components/shared/reveal';
import { formatShortPrice } from '@/lib/format';
import type { Laptop as LaptopType, MasterData, WebsiteSetting } from '@/types';

type LaptopPhoto = NonNullable<LaptopType['photos']>[number];

type GalleryImage = {
    id: string;
    src: string;
    alt: string;
};

interface Props {
    laptop: LaptopType;
    related: LaptopType[];
    website: WebsiteSetting;
}

function photoPath(photo: LaptopPhoto) {
    return `/storage/${photo.file_path}`;
}

function laptopPhoto(laptop: LaptopType) {
    const photo = laptop.photos?.[0];

    if (!photo?.file_path) {
        return null;
    }

    return photoPath(photo);
}

function brandName(brand: MasterData | null | undefined, fallback: string) {
    return brand?.name ?? fallback;
}

function laptopDisplayName(laptop: LaptopType) {
    const name = laptop.name?.trim();

    if (name) {
        return name;
    }

    return `${brandName(laptop.brand, '')} ${laptop.model}`.trim();
}

type SpecIcon = ComponentType<{
    className?: string;
    weight?: 'duotone' | 'fill' | 'bold' | 'regular';
}>;

export default function RentalDetail({ laptop, related, website }: Props) {
    const galleryImages: GalleryImage[] = (laptop.photos ?? [])
        .filter((photo) => Boolean(photo.file_path))
        .map((photo, index) => ({
            id: String(photo.id),
            src: photoPath(photo),
            alt:
                photo.caption ??
                laptop.name ??
                `${laptopDisplayName(laptop)} foto ${index + 1}`,
        }));
    const images = galleryImages;
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
    const selectedImage =
        images[Math.min(selectedPhotoIndex, images.length - 1)];
    const spec = laptop.specification;
    const waText = encodeURIComponent(
        `Halo, saya tertarik menyewa ${laptopDisplayName(laptop)}. Apakah masih tersedia?`,
    );
    const waNumber = (website.whatsapp_number ?? '6281234567890').replace(
        /[^0-9]/g,
        '',
    );
    const waLink = `https://wa.me/${waNumber}?text=${waText}`;

    const specs: Array<{ icon: SpecIcon; label: string; value: string }> = [
        { icon: Cpu, label: 'Processor', value: spec?.processor ?? '-' },
        { icon: HardDrive, label: 'RAM', value: spec?.ram ?? '-' },
        { icon: HardDrive, label: 'Storage', value: spec?.storage ?? '-' },
        { icon: Monitor, label: 'Layar', value: spec?.display ?? '-' },
        {
            icon: BatteryFull,
            label: 'Baterai',
            value: spec?.battery ?? 'Original',
        },
    ];

    return (
        <PublicPage
            website={website}
            title={`${laptopDisplayName(laptop)} (Sewa) - ${website.website_name}`}
            currentPath="/sewa"
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
                        href="/sewa"
                        className="transition hover:underline"
                        style={{ color: 'var(--color-tc-ink)' }}
                    >
                        Sewa
                    </a>
                    <CaretRight
                        className="h-3 w-3"
                        weight="bold"
                        aria-hidden="true"
                    />
                    <span style={{ color: 'var(--color-tc-ink)' }}>
                        {brandName(laptop.brand, laptop.model)}
                    </span>
                </nav>
            </div>

            <section className="mx-auto max-w-[1440px] px-4 py-8 md:px-6 md:py-12">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                    <div>
                        <div className="tc-media aspect-[4/3]">
                            {selectedImage ? (
                                <img
                                    alt={selectedImage.alt}
                                    src={selectedImage.src}
                                    decoding="async"
                                    fetchPriority="high"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
                                    <LaptopIcon
                                        className="h-16 w-16"
                                        weight="duotone"
                                        aria-hidden="true"
                                        style={{
                                            color: 'var(--color-tc-secondary)',
                                            opacity: 0.5,
                                        }}
                                    />
                                    <p className="tc-caption">
                                        Foto unit ini belum tersedia. Hubungi
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
                                        onClick={() => {
                                            setSelectedPhotoIndex(index);
                                        }}
                                        aria-label={`Lihat foto ${index + 1}`}
                                        aria-pressed={
                                            index === selectedPhotoIndex
                                        }
                                        className="tc-media h-20 w-20 shrink-0 transition"
                                        style={
                                            index === selectedPhotoIndex
                                                ? {
                                                      outline:
                                                          '2px solid var(--color-tc-ink)',
                                                      outlineOffset: 2,
                                                  }
                                                : { opacity: 0.6 }
                                        }
                                    >
                                        <img
                                            alt={photo.alt}
                                            src={photo.src}
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
                        {laptop.brand?.name && (
                            <p className="tc-eyebrow">{laptop.brand.name}</p>
                        )}
                        <h1 className="mt-2 tc-h1">
                            {laptopDisplayName(laptop)}
                        </h1>

                        <div className="mt-5 flex flex-wrap items-baseline gap-3">
                            <p
                                className="tc-price"
                                style={{ fontSize: '2rem' }}
                            >
                                {formatShortPrice(laptop.daily_rate)}
                                <span
                                    className="tc-caption font-normal"
                                    style={{
                                        color: 'var(--color-tc-secondary)',
                                    }}
                                >
                                    /hari
                                </span>
                            </p>
                        </div>

                        <p className="mt-5 max-w-xl tc-body">
                            Unit sewa terkurasi untuk kebutuhan sementara.
                            Deposit dikembalikan penuh saat unit kembali dalam
                            kondisi baik.
                        </p>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="tc-btn tc-btn--primary flex-1"
                            >
                                Sewa sekarang
                                <ArrowRight className="h-4 w-4" weight="bold" />
                            </a>
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="tc-btn tc-btn--secondary flex-1"
                            >
                                <ChatCircle className="h-4 w-4" weight="bold" />
                                Tanya via WhatsApp
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
                                    Syarat ringan.
                                </span>{' '}
                                Cukup KTP + deposit. Keterlambatan pengembalian
                                dikenakan denda harian.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Reveal>
                <section className="border-t border-tc-rule bg-tc-surface">
                    <div className="mx-auto max-w-[880px] px-4 py-10 md:px-6 md:py-14">
                        <h2 className="tc-h2">Spesifikasi</h2>
                        <dl className="mt-6">
                            {specs.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.label}
                                        className="flex items-center gap-3 border-b border-tc-rule py-4"
                                    >
                                        <span
                                            className="shrink-0"
                                            style={{
                                                color: 'var(--color-tc-secondary)',
                                            }}
                                            aria-hidden="true"
                                        >
                                            <Icon
                                                className="h-4 w-4"
                                                weight="duotone"
                                            />
                                        </span>
                                        <dt className="tc-caption">
                                            {item.label}
                                        </dt>
                                        <dd
                                            className="ml-auto text-right tc-body font-medium tabular-nums"
                                            style={{
                                                color: 'var(--color-tc-ink)',
                                            }}
                                        >
                                            {item.value}
                                        </dd>
                                    </div>
                                );
                            })}
                        </dl>
                    </div>
                </section>
            </Reveal>

            {laptop.description || spec?.other_specifications ? (
                <Reveal>
                    <section className="mx-auto max-w-[880px] px-4 py-10 md:px-6 md:py-14">
                        <h2 className="tc-h2">Detail unit</h2>
                        <div className="mt-5 space-y-4 tc-body">
                            {laptop.description ? (
                                <p className="whitespace-pre-line">
                                    {laptop.description}
                                </p>
                            ) : null}
                            {spec?.other_specifications ? (
                                <p className="whitespace-pre-line">
                                    {spec.other_specifications}
                                </p>
                            ) : null}
                        </div>
                    </section>
                </Reveal>
            ) : null}

            {related.length > 0 ? (
                <Reveal>
                    <section className="border-t border-tc-rule bg-tc-surface">
                        <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-6 md:py-14">
                            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                                <h2 className="tc-h2">Unit sewa lain</h2>
                                <Link
                                    href="/sewa"
                                    className="tc-btn tc-btn--secondary tc-btn--sm"
                                >
                                    Lihat semua
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                {related.map((item, i) => (
                                    <Reveal key={item.id} delay={(i % 4) * 70}>
                                        <RelatedRentalCard laptop={item} />
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
                        <p className="truncate tc-caption">
                            {laptopDisplayName(laptop)}
                        </p>
                        <p className="tc-price text-lg">
                            {formatShortPrice(laptop.daily_rate)}
                            <span className="tc-caption font-normal">/hr</span>
                        </p>
                    </div>
                    <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="tc-btn tc-btn--primary tc-btn--sm shrink-0"
                    >
                        Sewa sekarang
                    </a>
                </div>
            </div>
        </PublicPage>
    );
}

function RelatedRentalCard({ laptop }: { laptop: LaptopType }) {
    const image = laptopPhoto(laptop);

    return (
        <Link
            href={`/sewa/${laptop.slug ?? laptop.id}`}
            className="tc-card group flex flex-col p-3 md:p-4"
        >
            <div className="tc-media relative aspect-square">
                {image ? (
                    <img
                        alt={laptop.name ?? laptop.sku}
                        src={image}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <LaptopIcon
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
                <p className="tc-caption">{brandName(laptop.brand, '')}</p>
                <h3 className="line-clamp-2 min-h-[2.7em] tc-product-title">
                    {laptopDisplayName(laptop)}
                </h3>
                <p className="mt-1 tc-price">
                    {formatShortPrice(laptop.daily_rate)}
                    <span className="tc-caption font-normal">/hari</span>
                </p>
            </div>
        </Link>
    );
}
