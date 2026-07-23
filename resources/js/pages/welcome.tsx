/* Hallmark · genre: playful · macrostructure: bento-grid · theme: hum */

import {
    AppleLogo,
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
import { useEffect, useRef, useState } from 'react';
import {
    DellIcon,
    HpIcon,
    LenovoIcon,
    IntelIcon,
    NvidiaIcon,
    AmdIcon,
    RazerIcon,
    CorsairIcon,
    KingstonIcon,
    SeagateIcon,
    AsusIcon,
    AcerIcon,
    SamsungIcon,
    MsiIcon,
} from '@/components/brand-icons';
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

export default function Welcome({ laptops, testimonials: incomingTestimonials, website }: Props) {
    const dummyTestimonials: TestimonialItem[] = [
        {
            id: 1001, name: 'Ahmad Fauzi', role: 'Mahasiswa',
            content: 'Laptop yang saya beli sesuai deskripsi, tidak ada hidden issue. Proses cepat dan ramah.',
            rating: 5,
        },
        {
            id: 1002, name: 'Sari Dewi', role: 'Freelancer',
            content: 'Servisnya sigap. LCD laptop saya diganti dalam sehari, harganya juga wajar. Recomended!',
            rating: 5,
        },
        {
            id: 1003, name: 'Bambang Sutejo', role: 'Karyawan',
            content: 'Baru pertama beli laptop bekas dan puas. Kondisi fisik sangat baik, baterai masih awet.',
            rating: 4,
        },
        {
            id: 1004, name: 'Rina Marlina', role: 'Designer',
            content: 'Upgrade RAM dan SSD di sini. Hasilnya beda banget, laptop saya jadi ngebut lagi.',
            rating: 5,
        },
        {
            id: 1005, name: 'Doni Prasetyo', role: 'Gamer',
            content: 'Keyboard laptop saya rusak, mereka ganti dengan part original. Rapi dan cepat.',
            rating: 4,
        },
        {
            id: 1006, name: 'Fitri Handayani', role: 'Pelajar',
            content: 'Konsultasi lewat WhatsApp dulu sebelum ke toko. Timnya responsif dan nggak maksa.',
            rating: 5,
        },
        {
            id: 1007, name: 'Agus Wijaya', role: 'Wirausaha',
            content: 'Sudah 3 kali servis di sini. Hasilnya konsisten rapi. Recomended buat teman-teman.',
            rating: 5,
        },
        {
            id: 1008, name: 'Putri Ayu', role: 'Admin',
            content: 'Tracking servis online-nya membantu banget. Saya bisa pantau tanpa harus datang.',
            rating: 4,
        },
    ];

    const testimonials = incomingTestimonials.length >= 8
        ? incomingTestimonials.slice(0, 8)
        : [...incomingTestimonials, ...dummyTestimonials].slice(0, 8);

    const whatsappNumber = (website.whatsapp_number ?? '').replace(/[^0-9]/g, '');
    const whatsappHref = `https://wa.me/${whatsappNumber}`;
    const heroImage = laptopHeroImage(laptops);
    const heroLaptop = laptops[0];

    return (
        <PublicPage
            website={website}
            title={`${website.website_name} | Laptop dan Servis Terpercaya`}
        >
            {/* ─── Hero — left-aligned text + product image + character mark ─── */}
            <section className="bg-paper">
                <div className="mx-auto grid max-w-[980px] items-center gap-10 px-5 py-16 md:grid-cols-[1fr_1.1fr] md:py-24">
                    <div>
                        <h1 className="hum-display text-ink">
                            Pusat laptop bekas &
                            <br />
                            servis <span className="hum-hl">terpercaya</span>.
                        </h1>
                        <p className="mt-5 max-w-md hum-body-lg text-ink-2">
                            {website.tagline ??
                                'Mulai dari pilih unit, servis, sampai selesai — semuanya bisa dipantau dari sini.'}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-2.5">
                            <a href="/shop" className="hum-btn hum-btn--pear !px-4 !py-2 !text-sm">
                                Lihat katalog
                                <ArrowRight className="h-3 w-3" weight="bold" />
                            </a>
                            <a href="/services/track" className="hum-btn hum-btn--outline !px-4 !py-2 !text-sm">
                                Lacak servis
                            </a>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center">
                        {heroImage ? (
                            <a
                                href={heroLaptop ? `/laptops/${heroLaptop.id}` : '/shop'}
                                className="group block w-full overflow-hidden rounded-[24px] shadow-product transition-shadow hover:shadow-[0_24px_48px_-16px_oklch(20%_0.012_250/0.28)]"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-accent/5">
                                    <img
                                        src={heroImage}
                                        alt={
                                            heroLaptop?.name ??
                                            `${brandLabel(heroLaptop?.brand, '')} ${heroLaptop?.model ?? ''}`
                                        }
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-accent/10 via-transparent to-transparent" />
                                </div>
                            </a>
                        ) : (
                            <a
                                href="/shop"
                                className="group block w-full overflow-hidden rounded-[24px] shadow-product transition-shadow hover:shadow-[0_24px_48px_-16px_oklch(20%_0.012_250/0.28)]"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
                                    <img
                                        src="https://images.unsplash.com/photo-1751257983922-a627088d4c21?fm=jpg&q=80&w=1200&auto=format&fit=crop"
                                        alt="Modern laptop workspace"
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                        loading="eager"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-accent/10 via-transparent to-transparent" />
                                </div>
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {/* ─── Separator — SVG wave + floating tech & brand icons ─── */}
            <div className="bg-paper">
                <div className="relative py-8 md:py-10">
                    <svg
                        className="h-12 w-full text-rule/40 sm:h-16"
                        viewBox="0 0 1400 64"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        aria-label="Teknologi"
                    >
                        <title>Teknologi</title>
                        <path
                            d="M 0,32 C 70,16 140,16 210,32 C 280,48 350,48 420,32 C 490,16 560,16 630,32 C 700,48 770,48 840,32 C 910,16 980,16 1050,32 C 1120,48 1190,48 1260,32 C 1330,16 1400,16 1400,32"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                        />
                    </svg>

                    {[
                        { icon: DellIcon,     left: '3%',   top: '56%', color: '#007DB8', delay: 0,     size: 24 },
                        { icon: AppleLogo,    left: '9%',   top: '30%', color: '#555555', delay: 300,   size: 24 },
                        { icon: HpIcon,       left: '15%',  top: '60%', color: '#0096D6', delay: 600,   size: 24 },
                        { icon: LenovoIcon,   left: '21%',  top: '32%', color: '#E2231A', delay: 900,   size: 40 },
                        { icon: IntelIcon,    left: '27%',  top: '56%', color: '#0071C5', delay: 200,   size: 36 },
                        { icon: NvidiaIcon,   left: '33%',  top: '28%', color: '#76B900', delay: 500,   size: 24 },
                        { icon: AmdIcon,      left: '39%',  top: '62%', color: '#ED1C24', delay: 800,   size: 48 },
                        { icon: RazerIcon,    left: '45%',  top: '30%', color: '#44D62C', delay: 1100,  size: 24 },
                        { icon: CorsairIcon,  left: '51%',  top: '58%', color: '#231F20', delay: 400,   size: 24 },
                        { icon: KingstonIcon, left: '57%',  top: '32%', color: '#000000', delay: 700,   size: 24 },
                        { icon: SeagateIcon,  left: '63%',  top: '60%', color: '#6EBE49', delay: 1000,  size: 24 },
                        { icon: AsusIcon,     left: '69%',  top: '26%', color: '#000000', delay: 200,   size: 50 },
                        { icon: AcerIcon,     left: '75%',  top: '60%', color: '#83B81A', delay: 500,   size: 46 },
                        { icon: SamsungIcon,  left: '81%',  top: '34%', color: '#1428A0', delay: 800,   size: 62 },
                        { icon: MsiIcon,      left: '88%',  top: '60%', color: '#FF0000', delay: 1100,  size: 24 },
                    ].map(({ icon: Icon, left, top, color, delay, size }) => (
                        <span
                            key={left}
                            className="absolute"
                            style={{
                                left,
                                top,
                                fontSize: `${size}px`,
                                color,
                                animationName: 'hum-float',
                                animationDuration: '3s',
                                animationTimingFunction: 'ease-in-out',
                                animationIterationCount: 'infinite',
                                animationDelay: `${delay}ms`,
                            }}
                        >
                            <Icon weight="fill" />
                        </span>
                    ))}
                </div>
            </div>

            {/* ─── Laptop showcase — pear-tinted band ─── */}
            <section className="bg-surface">
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

            {/* ─── Testimonials — alternating band ─── */}
            {testimonials.length > 0 ? (() => {
                const pageSize = 4;
                const totalPages = Math.ceil(testimonials.length / pageSize);
                const pages = Array.from({ length: totalPages }, (_, p) =>
                    testimonials.slice(p * pageSize, (p + 1) * pageSize),
                );

                return (
                    <TestimonialsCarousel
                        pages={pages}
                        totalPages={totalPages}
                    />
                );
            })() : null}

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

                    <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
                        <div>
                            <div className="grid gap-4">
                                {website.address ? (
                                    <div className="hum-card hum-card--pear-tint p-6 flex items-start gap-4">
                                        <MapPin
                                            className="mt-0.5 h-5 w-5 shrink-0 text-accent-deep"
                                            weight="duotone"
                                            aria-hidden="true"
                                        />
                                        <div>
                                            <p className="hum-caption text-ink-2/60">
                                                Alamat
                                            </p>
                                            <p className="mt-1 hum-body text-ink">
                                                {website.address}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                                {(website.operational_hours_weekday ||
                                    website.operational_hours_weekend) && (
                                    <div className="hum-card hum-card--cyan-tint p-6 flex items-start gap-4">
                                        <Wrench
                                            className="mt-0.5 h-5 w-5 shrink-0 text-accent-2"
                                            weight="duotone"
                                            aria-hidden="true"
                                        />
                                        <div>
                                            <p className="hum-caption text-ink-2/60">
                                                Jam operasional
                                            </p>
                                            <p className="mt-1 hum-body text-ink">
                                                {[
                                                    website.operational_hours_weekday,
                                                    website.operational_hours_weekend,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' / ')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {website.phone ? (
                                    <div className="hum-card hum-card--coral-tint p-6 flex items-start gap-4">
                                        <Phone
                                            className="mt-0.5 h-5 w-5 shrink-0 text-accent-3"
                                            weight="duotone"
                                            aria-hidden="true"
                                        />
                                        <div>
                                            <p className="hum-caption text-ink-2/60">
                                                Telepon
                                            </p>
                                            <p className="mt-1 hum-body text-ink">
                                                {website.phone}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            <div className="mt-8">
                                <a href={whatsappHref} className="hum-btn hum-btn--pear">
                                    <ChatCircle className="h-4 w-4" weight="duotone" />
                                    WhatsApp
                                </a>
                            </div>
                        </div>

                        {website.google_maps_embed ? (
                            <div className="overflow-hidden rounded-[20px] shadow-card md:self-start">
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

const ENTRANCE_DELAYS = [
    'delay-0',
    'delay-75',
    'delay-150',
    'delay-200',
] as const;

const CARD_TINTS = [
    'bg-accent/8',
    'bg-accent-2/8',
    'bg-accent-3/8',
    'bg-mint/8',
] as const;

const STAR_TINTS = [
    'text-accent',
    'text-accent-2',
    'text-accent-3',
    'text-mint',
] as const;

function TestimonialsCarousel({
    pages,
    totalPages,
}: {
    pages: TestimonialItem[][];
    totalPages: number;
}) {
    const [page, setPage] = useState(0);
    const timer = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (totalPages > 1) {
            timer.current = setInterval(() => {
                setPage((p) => (p + 1) % totalPages);
            }, 5000);
        }

        return () => {
            if (timer.current !== null) {
                clearInterval(timer.current);
            }
        };
    }, [totalPages]);

    // goTo = useCallback — not used directly; dots use setPage
    return (
        <section className="bg-surface">
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

                <div key={page} className="grid gap-5 md:grid-cols-2">
                    {pages[page].map((testimonial, i) => {
                        const rating = Math.max(
                            1,
                            Math.min(5, Number(testimonial.rating) || 5),
                        );
                        const idx = (page * 4 + i) % 4;
                        const t = CARD_TINTS[idx];
                        const s = STAR_TINTS[idx];
                        const d = ENTRANCE_DELAYS[i];

                        return (
                            <figure
                                key={testimonial.id}
                                className={`animate-in fade-in slide-in-from-bottom-4 animation-duration-300 fill-mode-backwards ${d} ${t} relative rounded-[20px] border border-rule/60 bg-paper p-6 shadow-card md:p-8`}
                            >
                                <span
                                    className={`pointer-events-none absolute -top-4 -left-1 font-serif text-[5rem] leading-none select-none ${s}`}
                                    aria-hidden="true"
                                >
                                    &ldquo;
                                </span>
                                <div
                                    className={`flex gap-0.5 ${s}`}
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
                                <blockquote className="relative mt-4 hum-body text-ink">
                                    {testimonial.content}
                                </blockquote>
                                <figcaption className="mt-4 flex items-center gap-2.5 border-t border-rule/50 pt-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-2 text-sm font-semibold text-ink">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <span className="hum-body-sm font-semibold text-ink">
                                            {testimonial.name}
                                        </span>
                                        <span className="ml-1.5 hum-caption text-ink-2/60">
                                            {testimonial.role ?? 'Pelanggan'}
                                        </span>
                                    </div>
                                </figcaption>
                            </figure>
                        );
                    })}
                </div>

                {totalPages > 1 && (() => {
                    const navigationDots = Array.from(
                        { length: totalPages },
                        (_x, dotIndex) => dotIndex,
                    );

                    return (
                        <nav
                            className="mt-10 flex items-center justify-center gap-2"
                            aria-label="Navigasi testimoni"
                        >
                            {navigationDots.map((dotIndex) => (
                                <button
                                    key={`dot-${dotIndex}`}
                                    type="button"
                                    onClick={() => setPage(dotIndex)}
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                        dotIndex === page
                                            ? 'w-6 bg-accent-2'
                                            : 'w-2 bg-rule hover:bg-ink-2/30'
                                    }`}
                                    aria-label={`Halaman ${dotIndex + 1}`}
                                    aria-current={
                                        dotIndex === page ? 'true' : undefined
                                    }
                                />
                            ))}
                        </nav>
                    );
                })()}
            </div>
        </section>
    );
}
