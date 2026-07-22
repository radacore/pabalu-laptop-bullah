/* Hallmark · genre: playful · macrostructure: bento-grid · theme: hum */

import { router } from '@inertiajs/react';
import {
    ArrowRight,
    ChatCircle,
    CheckCircle,
    Cpu,
    Laptop as LaptopIcon,
    MapPin,
    Phone,
    ShieldCheck,
    Star,
    Wrench,
} from '@phosphor-icons/react';
import type { FormEvent, ReactNode } from 'react';
import { PublicPage, formatCurrency } from '@/components/public-layout';
import type { Laptop, MasterData, WebsiteSetting } from '@/types';

interface TestimonialItem {
    id: number;
    name: string;
    role?: string | null;
    content: string;
    rating: number;
    avatar_color?: string | null;
}

interface Props {
    laptops: Laptop[];
    testimonials: TestimonialItem[];
    website: WebsiteSetting;
}

const serviceItems = [
    {
        title: 'Upgrade performa',
        description:
            'RAM, SSD, baterai, dan thermal service untuk laptop yang butuh terasa cepat lagi.',
        icon: Cpu,
        tint: 'pear' as const,
    },
    {
        title: 'Perbaikan hardware',
        description:
            'Layar, keyboard, engsel, port, dan sparepart penting dengan diagnosa jelas di awal.',
        icon: Wrench,
        tint: 'cyan' as const,
    },
    {
        title: 'Unit refurbished siap pakai',
        description:
            'Laptop bekas terkurasi, sudah dicek, dibersihkan, dan siap untuk kerja harian.',
        icon: CheckCircle,
        tint: 'coral' as const,
    },
];

const whyItems = [
    {
        icon: ShieldCheck,
        title: 'QC sebelum serah terima',
        description:
            'Setiap unit melewati pengecekan fungsi utama, suhu, baterai, layar, port, dan performa.',
        tint: 'pear' as const,
    },
    {
        icon: Wrench,
        title: 'Progres transparan',
        description:
            'Kode tiket membuka progres perbaikan tanpa perlu bolak-balik menanyakan update.',
        tint: 'cyan' as const,
    },
    {
        icon: CheckCircle,
        title: 'Estimasi biaya jelas',
        description:
            'Opsi perbaikan dan biaya dikonfirmasi sebelum pengerjaan agar keputusan tetap nyaman.',
        tint: 'pear' as const,
    },
    {
        icon: ChatCircle,
        title: 'Konsultasi WhatsApp',
        description:
            'Tanya dulu sebelum datang, lewat chat dengan tim yang paham unit yang akan Anda beli.',
        tint: 'coral' as const,
    },
];

const tintColor = {
    pear: {
        bg: 'bg-accent/8',
        hover: 'hover:bg-accent/15',
        icon: 'bg-accent/20 text-accent-deep',
        accent: 'text-accent-deep',
    },
    cyan: {
        bg: 'bg-accent-2/8',
        hover: 'hover:bg-accent-2/15',
        icon: 'bg-accent-2/20 text-accent-2',
        accent: 'text-accent-2',
    },
    coral: {
        bg: 'bg-accent-3/8',
        hover: 'hover:bg-accent-3/15',
        icon: 'bg-accent-3/20 text-accent-3',
        accent: 'text-accent-3',
    },
} as const;

function laptopPhoto(laptop: Laptop) {
    const photo = laptop.photos?.[0];
    if (!photo?.file_path) {
        return null;
    }
    return `/storage/${photo.file_path}`;
}

function brandLabel(brand: MasterData | null | undefined, fallback: string) {
    return brand?.name ?? fallback;
}

function laptopHeroImage(laptops: Laptop[]): string | null {
    for (const laptop of laptops) {
        const photo = laptop.photos?.[0];
        if (photo?.file_path) {
            return `/storage/${photo.file_path}`;
        }
    }
    return null;
}

export default function Welcome({ laptops, testimonials, website }: Props) {
    const whatsappNumber = (website.whatsapp_number ?? '').replace(/[^0-9]/g, '');
    const whatsappHref = `https://wa.me/${whatsappNumber}`;
    const phoneHref = `tel:${website.phone ?? website.whatsapp_number ?? ''}`;
    const heroImage = laptopHeroImage(laptops);
    const heroLaptop = laptops[0];

    const submitStatusSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const code = String(formData.get('code') ?? '').trim();
        if (code) {
            router.get(`/services/track/${code}`);
        }
    };

    return (
        <PublicPage
            website={website}
            title={`${website.website_name} | Laptop dan Servis Terpercaya`}
        >
            {/* ─── Hero — left-aligned text + product image + character mark ─── */}
            <section className="bg-paper">
                <div className="mx-auto grid max-w-[980px] items-center gap-10 px-5 py-16 md:grid-cols-[1fr_1.1fr] md:py-24">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className="hum-char inline-block h-3 w-3 rounded-full bg-accent" />
                            <p className="hum-caption text-ink-2/60">
                                Pabalu Laptop
                            </p>
                        </div>
                        <h1 className="mt-4 hum-display text-ink">
                            Laptop bersih,
                            <br />
                            <span className="hum-hl">jelas</span>, siap dipakai.
                        </h1>
                        <p className="mt-5 max-w-md hum-body-lg text-ink-2">
                            {website.tagline ??
                                'Temukan laptop bekas terkurasi, konsultasikan servis, dan pantau progres pengerjaan dari satu tempat yang mudah dipakai.'}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <a href="/shop" className="hum-btn hum-btn--pear">
                                Lihat katalog
                                <ArrowRight className="h-3.5 w-3.5" weight="bold" />
                            </a>
                            <a href="#status" className="hum-btn hum-btn--outline">
                                Lacak servis
                            </a>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center">
                        {heroImage ? (
                            <a
                                href={heroLaptop ? `/laptops/${heroLaptop.id}` : '/shop'}
                                className="block w-full overflow-hidden rounded-[24px] shadow-product"
                            >
                                <img
                                    src={heroImage}
                                    alt={
                                        heroLaptop?.name ??
                                        `${brandLabel(heroLaptop?.brand, '')} ${heroLaptop?.model ?? ''}`
                                    }
                                    className="h-auto w-full object-contain"
                                />
                            </a>
                        ) : (
                            <div className="flex w-full flex-col items-center gap-3 rounded-[24px] bg-paper-2 p-10 text-center shadow-card">
                                <LaptopIcon
                                    className="h-10 w-10 text-ink-2/40"
                                    weight="duotone"
                                />
                                <p className="hum-body-sm text-ink-2/60">
                                    Foto laptop akan muncul di sini
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ─── Status tracker — cyan-tinted band ─── */}
            <section id="status" className="scroll-mt-16 bg-accent-2/5">
                <div className="mx-auto max-w-[640px] px-5 py-16 text-center md:py-20">
                    <p className="hum-caption text-accent-2">Status</p>
                    <h2 className="mt-3 hum-heading-lg text-ink">
                        Lacak status servis
                    </h2>
                    <p className="mx-auto mt-3 max-w-md hum-body text-ink-2">
                        Masukkan kode tiket untuk melihat progres pengerjaan
                        laptop Anda.
                    </p>

                    <form
                        onSubmit={submitStatusSearch}
                        className="mx-auto mt-8 max-w-md"
                    >
                        <div className="flex h-12 overflow-hidden rounded-full bg-paper shadow-card transition focus-within:shadow-card-hover">
                            <input
                                id="service-code"
                                name="code"
                                type="text"
                                placeholder="Kode servis (contoh: SRV-20240613-XXXXX)"
                                className="min-w-0 flex-1 border-none bg-transparent px-5 hum-body-sm text-ink outline-none placeholder:text-ink-2/50"
                            />
                            <button
                                type="submit"
                                className="hum-btn hum-btn--cyan !my-1 !mr-1 !px-5 !py-1.5 !text-xs"
                            >
                                Lacak
                            </button>
                        </div>
                    </form>

                    <ol className="mx-auto mt-10 max-w-sm space-y-3 text-left">
                        <li className="flex items-start gap-3 hum-body-sm text-ink-2">
                            <span className="mt-0.5 hum-caption text-accent-2">
                                01
                            </span>
                            Diagnosa dan estimasi dikonfirmasi dulu.
                        </li>
                        <li className="flex items-start gap-3 hum-body-sm text-ink-2">
                            <span className="mt-0.5 hum-caption text-accent-2">
                                02
                            </span>
                            Progres bisa dipantau dengan kode tiket.
                        </li>
                        <li className="flex items-start gap-3 hum-body-sm text-ink-2">
                            <span className="mt-0.5 hum-caption text-accent-2">
                                03
                            </span>
                            Unit diuji ulang sebelum diserahkan.
                        </li>
                    </ol>
                </div>
            </section>

            {/* ─── Laptop showcase — pear-tinted band ─── */}
            <section className="bg-paper">
                <div className="mx-auto max-w-[980px] px-5 py-16 md:py-24">
                    <div className="mb-12">
                        <p className="hum-caption text-accent-deep">Katalog</p>
                        <h2 className="mt-3 hum-heading-lg text-ink">
                            Pilihan unit siap kerja
                        </h2>
                        <p className="mt-3 max-w-lg hum-body-lg text-ink-2">
                            Unit terbaru dengan spesifikasi inti yang mudah
                            dibandingkan sebelum Anda datang atau chat.
                        </p>
                    </div>

                    {laptops.length > 0 ? (
                        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                            {laptops.slice(0, 6).map((laptop, index) => (
                                <LaptopCard key={laptop.id} laptop={laptop} index={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="mx-auto max-w-sm rounded-[20px] bg-paper-2 p-10 text-center shadow-card">
                            <LaptopIcon
                                className="mx-auto h-8 w-8 text-ink-2/40"
                                weight="duotone"
                            />
                            <p className="mt-4 hum-body text-ink-2">
                                Katalog sedang diperbarui. Hubungi kami untuk
                                rekomendasi unit hari ini.
                            </p>
                        </div>
                    )}

                    <div className="mt-12">
                        <a href="/shop" className="hum-btn hum-btn--soft">
                            Lihat semua laptop
                            <ArrowRight className="h-3.5 w-3.5" weight="bold" />
                        </a>
                    </div>
                </div>
            </section>

            {/* ─── Services — multi-accent bento ─── */}
            <section id="services" className="scroll-mt-16 bg-paper-2/50">
                <div className="mx-auto max-w-[980px] px-5 py-16 md:py-24">
                    <div className="mb-14">
                        <p className="hum-caption text-accent-deep">Layanan</p>
                        <h2 className="mt-3 hum-heading-lg text-ink">
                            Servis yang fokus pada hasil,
                            <br className="hidden sm:block" />
                            bukan proses.
                        </h2>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        {/* Big card — pear */}
                        <div className="hum-card hum-card--pear-tint p-8">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] ${tintColor.pear.icon}`}>
                                <Cpu className="h-6 w-6" weight="duotone" aria-hidden="true" />
                            </div>
                            <h3 className="mt-5 hum-heading text-ink">
                                {serviceItems[0].title}
                            </h3>
                            <p className="mt-3 hum-body text-ink-2">
                                {serviceItems[0].description}
                            </p>
                        </div>

                        <div className="flex flex-col gap-5">
                            {/* Cyan card */}
                            <div className="hum-card hum-card--cyan-tint p-6">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${tintColor.cyan.icon}`}>
                                    <Wrench className="h-5 w-5" weight="duotone" aria-hidden="true" />
                                </div>
                                <h3 className="mt-4 hum-body font-semibold text-ink">
                                    {serviceItems[1].title}
                                </h3>
                                <p className="mt-2 hum-body-sm text-ink-2">
                                    {serviceItems[1].description}
                                </p>
                            </div>
                            {/* Coral card */}
                            <div className="hum-card hum-card--coral-tint p-6">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${tintColor.coral.icon}`}>
                                    <CheckCircle className="h-5 w-5" weight="duotone" aria-hidden="true" />
                                </div>
                                <h3 className="mt-4 hum-body font-semibold text-ink">
                                    {serviceItems[2].title}
                                </h3>
                                <p className="mt-2 hum-body-sm text-ink-2">
                                    {serviceItems[2].description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Why us — mixed tint cards ─── */}
            <section className="bg-paper">
                <div className="mx-auto max-w-[980px] px-5 py-16 md:py-24">
                    <div className="mb-14">
                        <p className="hum-caption text-accent-deep">
                            Mengapa kami
                        </p>
                        <h2 className="mt-3 hum-heading-lg text-ink">
                            Rapi dari konsultasi
                            <br className="hidden sm:block" />
                            sampai serah terima
                        </h2>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        {whyItems.map((item) => {
                            const Icon = item.icon;
                            const t = tintColor[item.tint];
                            return (
                                <div
                                    key={item.title}
                                    className={`flex gap-4 rounded-[18px] p-6 shadow-card transition-shadow hover:shadow-card-hover ${t.bg}`}
                                >
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${t.icon}`}>
                                        <Icon className="h-5 w-5" weight="duotone" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h3 className="hum-body font-semibold text-ink">
                                            {item.title}
                                        </h3>
                                        <p className="mt-1.5 hum-body-sm text-ink-2">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── Testimonials — cyan-tinted band ─── */}
            {testimonials.length > 0 ? (
                <section className="bg-accent-2/5">
                    <div className="mx-auto max-w-[980px] px-5 py-16 md:py-24">
                        <div className="mb-12">
                            <p className="hum-caption text-accent-2">
                                Testimoni
                            </p>
                            <h2 className="mt-3 hum-heading-lg text-ink">
                                Dipercaya untuk
                                <br className="hidden sm:block" />
                                kebutuhan harian
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {testimonials.slice(0, 3).map((testimonial) => {
                                const rating = Math.max(
                                    1,
                                    Math.min(5, Number(testimonial.rating) || 5),
                                );
                                return (
                                    <TestimonialQuote
                                        key={testimonial.id}
                                        testimonial={testimonial}
                                        rating={rating}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </section>
            ) : null}

            {/* ─── Contact — coral-tinted accent ─── */}
            <section id="contact" className="scroll-mt-16 bg-paper">
                <div className="mx-auto max-w-[980px] px-5 py-16 md:py-24">
                    <div className="mb-12">
                        <p className="hum-caption text-accent-3">Kontak</p>
                        <h2 className="mt-3 hum-heading-lg text-ink">
                            Mulai dari chat, telepon,
                            <br className="hidden sm:block" />
                            atau datang langsung.
                        </h2>
                        <p className="mt-3 max-w-lg hum-body-lg text-ink-2">
                            Tim kami siap bantu pilih unit, cek estimasi
                            servis, atau arahkan proses drop-off.
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                        {website.address ? (
                            <div className="hum-card hum-card--pear-tint p-6">
                                <MapPin
                                    className="h-5 w-5 text-accent-deep"
                                    weight="duotone"
                                    aria-hidden="true"
                                />
                                <p className="mt-4 hum-caption text-ink-2/60">
                                    Alamat
                                </p>
                                <p className="mt-1.5 hum-body text-ink">
                                    {website.address}
                                </p>
                            </div>
                        ) : null}
                        {(website.operational_hours_weekday ||
                            website.operational_hours_weekend) && (
                            <div className="hum-card hum-card--cyan-tint p-6">
                                <Wrench
                                    className="h-5 w-5 text-accent-2"
                                    weight="duotone"
                                    aria-hidden="true"
                                />
                                <p className="mt-4 hum-caption text-ink-2/60">
                                    Jam operasional
                                </p>
                                <p className="mt-1.5 hum-body text-ink">
                                    {[
                                        website.operational_hours_weekday,
                                        website.operational_hours_weekend,
                                    ]
                                        .filter(Boolean)
                                        .join(' / ')}
                                </p>
                            </div>
                        )}
                        {website.phone ? (
                            <div className="hum-card hum-card--coral-tint p-6">
                                <Phone
                                    className="h-5 w-5 text-accent-3"
                                    weight="duotone"
                                    aria-hidden="true"
                                />
                                <p className="mt-4 hum-caption text-ink-2/60">
                                    Telepon
                                </p>
                                <p className="mt-1.5 hum-body text-ink">
                                    {website.phone}
                                </p>
                            </div>
                        ) : null}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <a href={whatsappHref} className="hum-btn hum-btn--pear">
                            <ChatCircle className="h-4 w-4" weight="duotone" />
                            WhatsApp
                        </a>
                        <a href={phoneHref} className="hum-btn hum-btn--outline">
                            <Phone className="h-4 w-4" weight="duotone" />
                            Telepon
                        </a>
                    </div>

                    {website.google_maps_embed ? (
                        <div className="mt-10 overflow-hidden rounded-[20px] shadow-card">
                            <iframe
                                src={website.google_maps_embed}
                                title="Lokasi workshop"
                                className="h-[400px] w-full"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    ) : null}
                </div>
            </section>
        </PublicPage>
    );
}

/* ─── Sub-components ─── */

const cardAccents = ['pear', 'cyan', 'coral'] as const;

function LaptopCard({ laptop, index }: { laptop: Laptop; index: number }) {
    const image = laptopPhoto(laptop);
    const accent = cardAccents[index % 3];
    const t = tintColor[accent];

    return (
        <a href={`/laptops/${laptop.id}`} className="group block">
            <div className="overflow-hidden rounded-[20px] shadow-card transition-shadow group-hover:shadow-card-hover">
                <div className={`aspect-[4/3] overflow-hidden ${accent === 'pear' ? 'bg-accent/6' : accent === 'cyan' ? 'bg-accent-2/6' : 'bg-accent-3/6'}`}>
                    {image ? (
                        <img
                            src={image}
                            alt={
                                laptop.name ??
                                `${brandLabel(laptop.brand, '')} ${laptop.model}`
                            }
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <LaptopIcon
                                className="h-8 w-8 text-ink-2/40"
                                weight="duotone"
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="pt-3.5">
                <p className="hum-caption text-ink-2/60">
                    {brandLabel(laptop.brand, '')}
                </p>
                <h3 className="mt-1 hum-body font-semibold text-ink">
                    {laptop.name ?? laptop.model}
                </h3>
                <p className={`mt-2 hum-body-sm font-medium ${t.accent}`}>
                    {formatCurrency(laptop.selling_price)}
                </p>
                <p className="mt-2.5 inline-flex items-center gap-1.5 hum-caption text-ink-2 transition group-hover:text-accent-2">
                    Lihat detail
                    <ArrowRight className="h-3 w-3" weight="bold" />
                </p>
            </div>
        </a>
    );
}

function TestimonialQuote({
    testimonial,
    rating,
}: {
    testimonial: TestimonialItem;
    rating: number;
}) {
    return (
        <figure className="hum-card rounded-[18px] p-6 md:p-8">
            <div
                className="flex gap-0.5 text-accent"
                role="img"
                aria-label={`${rating} dari 5`}
            >
                {[1, 2, 3, 4, 5].map((position) =>
                    position <= rating ? (
                        <Star
                            key={`${testimonial.id}-${position}`}
                            className="h-3.5 w-3.5"
                            weight="fill"
                        />
                    ) : null,
                )}
            </div>
            <blockquote className="mt-4 max-w-2xl hum-body-lg text-ink">
                &ldquo;{testimonial.content}&rdquo;
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
                <span className="hum-body-sm font-semibold text-ink">
                    {testimonial.name}
                </span>
                <span className="hum-caption text-ink-2/60">
                    {testimonial.role ?? 'Pelanggan'}
                </span>
            </figcaption>
        </figure>
    );
}
