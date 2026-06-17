import { Head } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BatteryFull,
    CaretRight,
    ChatCircle,
    Cpu,
    HardDrive,
    Laptop as LaptopIcon,
    Monitor,
    ShoppingCart,
    Wrench,
} from '@phosphor-icons/react';
import { useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import {
    PublicPage,
    formatCurrency,
} from '@/components/public-layout';
import type { Laptop as LaptopType, WebsiteSetting } from '@/types';

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
    if (!photo?.file_path) return null;
    return photoPath(photo);
}

function SpecRow({
    icon: Icon,
    label,
    value,
}: {
    icon: ComponentType<{ className?: string; weight?: any }>;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
            <span className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                <Icon className="h-4 w-4 text-blue-600" weight="duotone" />
                {label}
            </span>
            <span className="text-right text-sm font-semibold text-slate-950">{value}</span>
        </div>
    );
}

export default function LaptopDetail({ laptop, related, website }: Props) {
    const galleryImages: GalleryImage[] = (laptop.photos ?? [])
        .filter((photo) => Boolean(photo.file_path))
        .map((photo, index) => ({
            id: String(photo.id),
            src: photoPath(photo),
            alt:
                photo.caption ??
                laptop.name ??
                `${laptop.brand} ${laptop.model} photo ${index + 1}`,
        }));
    const images =
        galleryImages.length > 0
            ? galleryImages
            : [
                  {
                      id: 'fallback',
                      src: 'https://picsum.photos/seed/pabalu-laptop-detail/1200/900',
                      alt: laptop.name ?? `${laptop.brand} ${laptop.model}`,
                  },
              ];
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
    const selectedImage =
        images[Math.min(selectedPhotoIndex, images.length - 1)] ?? images[0];
    const spec = laptop.specification;
    const waText = encodeURIComponent(
        `Halo, saya tertarik dengan ${laptop.name ?? laptop.sku}. Apakah masih tersedia?`,
    );
    const waNumber = (website.whatsapp_number ?? '6281234567890').replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/${waNumber}?text=${waText}`;

    return (
        <PublicPage
            website={website}
            title={`${laptop.name ?? laptop.sku} - ${website.website_name}`}
            currentPath="/shop"
        >
            {/* ─── Breadcrumb ─── */}
            <section className="border-b border-slate-200 bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <nav
                        className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500"
                        aria-label="Breadcrumb"
                    >
                        <a href="/" className="transition hover:text-blue-600">
                            Home
                        </a>
                        <CaretRight className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
                        <a href="/shop" className="transition hover:text-blue-600">
                            Shop
                        </a>
                        <CaretRight className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
                        <span className="font-medium text-slate-900">{laptop.brand}</span>
                    </nav>
                </div>
            </section>

            {/* ─── Product Section ─── */}
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-14">
                {/* Gallery */}
                <div className="lg:col-span-7">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <img
                            alt={selectedImage.alt}
                            src={selectedImage.src}
                            className="aspect-[4/3] w-full object-cover"
                        />
                    </div>
                    {images.length > 1 && (
                        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                            {images.map((photo, index) => (
                                <button
                                    key={photo.id}
                                    type="button"
                                    onClick={() => setSelectedPhotoIndex(index)}
                                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border bg-white transition ${
                                        index === selectedPhotoIndex
                                            ? 'border-blue-600 shadow-sm'
                                            : 'border-slate-200 opacity-70 hover:opacity-100'
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
                    )}
                </div>

                {/* Product Info */}
                <div className="mt-8 lg:col-span-5 lg:mt-0">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-blue-600 uppercase">
                            Ready Stock
                        </span>

                        <h1 className="mt-4 text-2xl leading-tight font-bold tracking-tight text-slate-950 sm:text-3xl">
                            {laptop.brand} {laptop.model}
                            {laptop.name ? ` (${laptop.name})` : ''}
                        </h1>

                        <p className="mt-4 text-3xl font-bold text-blue-600">
                            {formatCurrency(laptop.selling_price)}
                        </p>

                        <p className="mt-4 text-sm leading-7 text-slate-600">
                            Unit telah dicek fungsi utama, dibersihkan, dan siap dikonsultasikan sebelum pembelian.
                        </p>

                        <div className="mt-6 border-t border-slate-200 pt-6">
                            <h2 className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                Spesifikasi Detail
                            </h2>
                            <div className="mt-4 space-y-2">
                                <SpecRow icon={Cpu} label="Processor" value={spec?.processor ?? '-'} />
                                <SpecRow icon={HardDrive} label="RAM" value={spec?.ram ?? '-'} />
                                <SpecRow icon={HardDrive} label="Storage" value={spec?.storage ?? '-'} />
                                <SpecRow icon={Monitor} label="Layar" value={spec?.display ?? '-'} />
                                <SpecRow icon={BatteryFull} label="Baterai" value={spec?.battery ?? 'Original'} />
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3">
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
                            >
                                <ShoppingCart className="h-5 w-5" weight="duotone" />
                                Beli Sekarang
                            </a>
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                            >
                                <ChatCircle className="h-5 w-5" weight="duotone" />
                                Tanya Lewat WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Description ─── */}
            <section className="border-y border-slate-200 bg-slate-50">
                <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                        Detail unit dan benefit pembelian
                    </h2>
                    <div className="mt-6 text-sm leading-8 text-slate-700">
                        <p>
                            Dijual <strong>{laptop.brand} {laptop.model}</strong> dengan kondisi siap pakai.
                            Produk telah melewati inspeksi teknis oleh tim {website.website_name} untuk
                            memastikan hardware utama berfungsi normal.
                        </p>
                        {laptop.description && (
                            <p className="mt-4 whitespace-pre-line">{laptop.description}</p>
                        )}
                        {spec?.other_specifications && (
                            <p className="mt-4 whitespace-pre-line">{spec.other_specifications}</p>
                        )}
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        <BenefitItem>
                            Garansi toko dan dukungan pengecekan awal.
                        </BenefitItem>
                        <BenefitItem>
                            Sistem siap digunakan sesuai kondisi unit.
                        </BenefitItem>
                        <BenefitItem>
                            Konsultasi pembelian melalui WhatsApp sebelum transaksi.
                        </BenefitItem>
                    </div>
                </div>
            </section>

            {/* ─── Related Products ─── */}
            {related.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                                Pilihan lain yang serupa
                            </h2>
                        </div>
                        <a
                            href="/shop"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            Lihat Semua
                            <ArrowRight className="h-4 w-4" weight="bold" />
                        </a>
                    </div>
                    <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                        {related.map((item) => (
                            <RelatedCard key={item.id} laptop={item} />
                        ))}
                    </div>
                </section>
            )}
        </PublicPage>
    );
}

function BenefitItem({ children }: { children: ReactNode }) {
    return (
        <div className="flex gap-3 rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <span className="text-sm leading-6 text-slate-700">{children}</span>
        </div>
    );
}

function RelatedCard({ laptop }: { laptop: LaptopType }) {
    const image = laptopPhoto(laptop);
    return (
        <a
            href={`/laptops/${laptop.id}`}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="aspect-[4/3] bg-slate-100">
                {image ? (
                    <img
                        alt={laptop.name ?? laptop.sku}
                        src={image}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <LaptopIcon className="h-12 w-12" weight="duotone" aria-hidden="true" />
                    </div>
                )}
            </div>
            <div className="p-5">
                <p className="text-xs font-semibold tracking-[0.12em] text-blue-600 uppercase">
                    {laptop.brand}
                </p>
                <h3 className="mt-1.5 truncate text-lg font-bold tracking-tight text-slate-950">
                    {laptop.model}
                </h3>
                <p className="mt-2 text-xs text-slate-500">
                    {laptop.specification?.ram ?? '-'} | {laptop.specification?.storage ?? '-'}
                </p>
                <div className="mt-4 flex items-center justify-between gap-4">
                    <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(laptop.selling_price)}
                    </span>
                    <ArrowRight
                        className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                        weight="bold"
                        aria-hidden="true"
                    />
                </div>
            </div>
        </a>
    );
}
