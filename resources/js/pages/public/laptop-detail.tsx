/* Hallmark · genre: modern-minimal · macrostructure: split-studio · theme: hum */

import {
    ArrowRight,
    BatteryFull,
    CaretRight,
    Cpu,
    HardDrive,
    Laptop as LaptopIcon,
    Monitor,
} from '@phosphor-icons/react';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { PublicPage, formatCurrency } from '@/components/public-layout';
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
    return `${brandName(laptop.brand, '')} ${laptop.model}`.trim();
}

type SpecIcon = ComponentType<{
    className?: string;
    weight?: 'duotone' | 'fill' | 'bold' | 'regular';
}>;

export default function LaptopDetail({ laptop, related, website }: Props) {
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
    const images =
        galleryImages.length > 0
            ? galleryImages
            : [
                  {
                      id: 'fallback',
                      src: 'https://picsum.photos/seed/pabalu-laptop-detail/1200/900',
                      alt: laptop.name ?? laptopDisplayName(laptop),
                  },
              ];
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
    const selectedImage =
        images[Math.min(selectedPhotoIndex, images.length - 1)] ?? images[0];
    const spec = laptop.specification;
    const waText = encodeURIComponent(
        `Halo, saya tertarik dengan ${laptop.name ?? laptop.sku}. Apakah masih tersedia?`,
    );
    const waNumber = (website.whatsapp_number ?? '6281234567890').replace(
        /[^0-9]/g,
        '',
    );
    const waLink = `https://wa.me/${waNumber}?text=${waText}`;

    const specs: Array<{ icon: SpecIcon; label: string; value: string }> = [
        { icon: Cpu, label: 'Processor', value: spec?.processor ?? '—' },
        { icon: HardDrive, label: 'RAM', value: spec?.ram ?? '—' },
        { icon: HardDrive, label: 'Storage', value: spec?.storage ?? '—' },
        { icon: Monitor, label: 'Layar', value: spec?.display ?? '—' },
        {
            icon: BatteryFull,
            label: 'Baterai',
            value: spec?.battery ?? 'Original',
        },
    ];

    return (
        <PublicPage
            website={website}
            title={`${laptop.name ?? laptop.sku} - ${website.website_name}`}
            currentPath="/shop"
        >
            <section className="border-b border-rule/60">
                <div className="mx-auto max-w-[980px] px-4 py-3">
                    <nav
                        className="flex flex-wrap items-center gap-1 hum-caption text-ink-2/60"
                        aria-label="Breadcrumb"
                    >
                        <a
                            href="/"
                            className="text-accent-2 transition hover:text-accent-2/80"
                        >
                            Beranda
                        </a>
                        <CaretRight
                            className="h-3 w-3"
                            weight="bold"
                            aria-hidden="true"
                        />
                        <a
                            href="/shop"
                            className="text-accent-2 transition hover:text-accent-2/80"
                        >
                            Katalog
                        </a>
                        <CaretRight
                            className="h-3 w-3"
                            weight="bold"
                            aria-hidden="true"
                        />
                        <span className="text-ink">
                            {brandName(laptop.brand, laptop.model)}
                        </span>
                    </nav>
                </div>
            </section>

            <section className="bg-paper py-12 md:py-20">
                <div className="mx-auto max-w-[980px] px-4">
                    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
                        <div>
                            <div className="aspect-[4/3] overflow-hidden rounded-[20px] shadow-product">
                                <img
                                    alt={selectedImage.alt}
                                    src={selectedImage.src}
                                    className="h-full w-full object-cover"
                                />
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
                                            className={`h-16 w-16 shrink-0 overflow-hidden rounded-[20px] border transition ${
                                                index === selectedPhotoIndex
                                                    ? 'border-accent'
                                                    : 'border-rule opacity-60 hover:opacity-100'
                                            }`}
                                        >
                                            <img
                                                alt={photo.alt}
                                                src={photo.src}
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        <div>
                            <h1 className="hum-heading-lg text-ink">
                                {laptopDisplayName(laptop)}
                            </h1>
                            {laptop.name ? (
                                <p className="mt-2 hum-body-lg text-ink-2">
                                    {laptop.name}
                                </p>
                            ) : null}

                            <p className="mt-6 hum-heading-lg text-ink">
                                {formatCurrency(laptop.selling_price)}
                            </p>

                            <p className="mt-6 hum-body text-ink-2">
                                Unit sudah dicek fungsi utama, dibersihkan, dan
                                siap dikonsultasikan sebelum pembelian.
                            </p>

                            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hum-btn hum-btn--pear gap-2 px-6 hum-body font-medium text-accent-ink transition"
                                >
                                    Beli sekarang
                                    <ArrowRight
                                        className="h-4 w-4"
                                        weight="duotone"
                                    />
                                </a>
                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hum-btn hum-btn--outline gap-2 px-6 hum-body text-ink transition hover:text-accent-2"
                                >
                                    Tanya lewat WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-paper-2 py-16 md:py-20">
                <div className="mx-auto max-w-[640px] px-4">
                    <h2 className="hum-subheading text-ink">
                        Spesifikasi
                    </h2>
                    <dl className="mt-8 space-y-0">
                        {specs.map((item) => {
                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.label}
                                    className="flex items-center gap-3 border-b border-rule/60 py-4"
                                >
                                    <Icon
                                        className="h-4 w-4 shrink-0 text-ink-2/60"
                                        weight="duotone"
                                        aria-hidden="true"
                                    />
                                    <dt className="hum-caption text-ink-2/60">
                                        {item.label}
                                    </dt>
                                    <dd className="ml-auto text-right hum-body text-ink">
                                        {item.value}
                                    </dd>
                                </div>
                            );
                        })}
                    </dl>
                </div>
            </section>

            {laptop.description || spec?.other_specifications ? (
                <section className="bg-paper py-16 md:py-20">
                    <div className="mx-auto max-w-[640px] px-4">
                        <h2 className="hum-subheading text-ink">
                            Detail unit
                        </h2>
                        <div className="mt-6 space-y-4 hum-body text-ink-2">
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
                    </div>
                </section>
            ) : null}

            {related.length > 0 ? (
                <section className="bg-paper-2 py-16 md:py-20">
                    <div className="mx-auto max-w-[980px] px-4">
                        <div className="mb-10 text-center">
                            <h2 className="hum-subheading text-ink">
                                Pilihan lain yang serupa
                            </h2>
                            <a
                                href="/shop"
                                className="mt-3 inline-flex items-center gap-1 hum-body text-accent transition hover:text-accent/80"
                            >
                                Lihat semua
                                <ArrowRight
                                    className="h-4 w-4"
                                    weight="duotone"
                                />
                            </a>
                        </div>
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                            {related.map((item) => (
                                <RelatedCard key={item.id} laptop={item} />
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}
        </PublicPage>
    );
}

function RelatedCard({ laptop }: { laptop: LaptopType }) {
    const image = laptopPhoto(laptop);

    return (
        <a href={`/laptops/${laptop.id}`} className="group block">
            <div className="overflow-hidden rounded-[20px] shadow-card">
                <div className="aspect-[4/3] overflow-hidden bg-paper-2">
                    {image ? (
                        <img
                            alt={laptop.name ?? laptop.sku}
                            src={image}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-ink-2/60">
                            <LaptopIcon
                                className="h-10 w-10"
                                weight="duotone"
                                aria-hidden="true"
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="pt-3">
                <p className="hum-caption text-ink-2/60">
                    {brandName(laptop.brand, '')}
                </p>
                <h3 className="mt-1 hum-body font-semibold text-ink">
                    {laptop.model}
                </h3>
                <p className="mt-2 hum-body-sm text-accent">
                    {formatCurrency(laptop.selling_price)}
                </p>
            </div>
        </a>
    );
}
