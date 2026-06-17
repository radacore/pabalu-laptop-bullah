import { router } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    CheckCircle,
    Cpu,
    Laptop as LaptopIcon,
    MapPin,
    Phone,
    ShieldCheck,
    Star,
    Wrench,
} from '@phosphor-icons/react';
import { ChatCircle } from '@phosphor-icons/react';
import type { FormEvent } from 'react';
import {
    PublicPage,
    formatCurrency,
} from '@/components/public-layout';
import type { Laptop, WebsiteSetting } from '@/types';

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

const services = [
    {
        title: 'Upgrade Performa',
        description: 'RAM, SSD, baterai, dan thermal service untuk laptop yang butuh terasa cepat lagi.',
        icon: Cpu,
    },
    {
        title: 'Perbaikan Hardware',
        description: 'Layar, keyboard, engsel, port, dan sparepart penting ditangani dengan diagnosa jelas.',
        icon: Wrench,
    },
    {
        title: 'Laptop Siap Pakai',
        description: 'Unit bekas terkurasi, sudah dicek, dibersihkan, dan siap dipakai untuk kerja harian.',
        icon: CheckCircle,
    },
];

const whyUs = [
    {
        title: 'QC Sebelum Serah Terima',
        description: 'Setiap unit melewati pengecekan fungsi utama, suhu, baterai, layar, port, dan performa.',
        icon: ShieldCheck,
    },
    {
        title: 'Status Servis Transparan',
        description: 'Kode tiket membuka progres perbaikan tanpa perlu bolak-balik menanyakan update.',
    },
    {
        title: 'Estimasi Biaya Jelas',
        description: 'Opsi perbaikan dan biaya dikonfirmasi sebelum pengerjaan agar keputusan tetap nyaman.',
    },
];

function laptopPhoto(laptop: Laptop) {
    const photo = laptop.photos?.[0];
    if (!photo?.file_path) return null;
    return `/storage/${photo.file_path}`;
}

function specTags(laptop: Laptop) {
    return [
        laptop.specification?.processor,
        laptop.specification?.ram,
        laptop.specification?.storage,
    ]
        .filter(Boolean)
        .slice(0, 3);
}

export default function Welcome({ laptops, testimonials, website }: Props) {
    const whatsappNumber = (website.whatsapp_number ?? '').replace(/[^0-9]/g, '');
    const whatsappHref = `https://wa.me/${whatsappNumber}`;
    const phoneHref = `tel:${website.phone ?? website.whatsapp_number ?? ''}`;

    const submitStatusSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const code = String(formData.get('code') ?? '').trim();
        if (code) router.get(`/services/track/${code}`);
    };

    return (
        <PublicPage website={website} title={`${website.website_name} | Laptop dan Servis Terpercaya`}>
            {/* ─── Hero: Asymmetric Split ─── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-20 pt-24 lg:pb-28 lg:pt-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
                        {/* Left: Copy + CTAs */}
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
                                <ShieldCheck className="h-4 w-4" weight="fill" />
                                Laptop premium, servis rapi
                            </div>

                            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                                Solusi laptop yang{' '}
                                <span className="relative whitespace-nowrap">
                                    <span className="relative z-10 text-blue-600">bersih, jelas,</span>
                                    <span className="absolute inset-x-0 bottom-0 h-3 bg-blue-100/60" aria-hidden="true" />
                                </span>
                                <br />
                                dan siap dipakai.
                            </h1>

                            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                                {website.tagline ??
                                    'Temukan laptop bekas berkualitas, konsultasikan servis, dan pantau progres pengerjaan dari satu tempat yang mudah digunakan.'}
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
                                <a
                                    href="/shop"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
                                >
                                    Lihat katalog
                                    <ArrowRight className="h-4 w-4" weight="bold" />
                                </a>
                                <a
                                    href="#status"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                                >
                                    Cek status servis
                                </a>
                            </div>

                            <div className="mt-12 grid gap-6 border-t border-slate-200 pt-8 sm:grid-cols-3">
                                <div>
                                    <p className="text-3xl font-bold text-slate-950">21</p>
                                    <p className="mt-1 text-sm text-slate-600">Poin QC unit</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-slate-950">1 kode</p>
                                    <p className="mt-1 text-sm text-slate-600">Untuk lacak servis</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-slate-950">Jelas</p>
                                    <p className="mt-1 text-sm text-slate-600">Biaya dan progres</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Status Tracking Widget */}
                        <div id="status" className="scroll-mt-24">
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 lg:p-8">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                                        <Wrench className="h-5 w-5" weight="duotone" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold tracking-tight text-slate-950">
                                            Lacak Status Servis
                                        </h2>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            Masukkan kode tiket untuk melihat progres pengerjaan laptop Anda.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={submitStatusSearch} className="mt-6 space-y-4">
                                    <div>
                                        <label htmlFor="service-code" className="block text-sm font-medium text-slate-700">
                                            Kode servis
                                        </label>
                                        <div className="mt-2 flex gap-2">
                                            <input
                                                id="service-code"
                                                name="code"
                                                type="text"
                                                placeholder="Contoh: TR-202401"
                                                className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                            />
                                            <button
                                                type="submit"
                                                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                                            >
                                                Lacak
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-900">Alur servis singkat</p>
                                    <ol className="mt-3 space-y-2 text-sm text-slate-600">
                                        <li className="flex gap-2">
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                                            <span>Diagnosa dan estimasi dikonfirmasi terlebih dulu</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                                            <span>Progres bisa dipantau dengan kode tiket</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                                            <span>Unit diuji ulang sebelum diserahkan</span>
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Laptop Showcase: Bento Grid ─── */}
            <section id="showcase" className="scroll-mt-24 py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                                Pilihan unit siap kerja
                            </h2>
                            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                                Unit terbaru dengan spesifikasi inti yang mudah dibandingkan sebelum Anda datang atau chat.
                            </p>
                        </div>
                        <a
                            href="/shop"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                        >
                            Semua laptop
                            <ArrowUpRight className="h-4 w-4" weight="bold" />
                        </a>
                    </div>

                    {laptops.length > 0 ? (
                        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {laptops.slice(0, 6).map((laptop) => {
                                const image = laptopPhoto(laptop);
                                const tags = specTags(laptop);
                                return (
                                    <a
                                        key={laptop.id}
                                        href={`/laptops/${laptop.id}`}
                                        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="aspect-[4/3] bg-slate-100">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={laptop.name ?? `${laptop.brand} ${laptop.model}`}
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                    <LaptopIcon className="h-12 w-12" weight="duotone" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <p className="text-xs font-semibold tracking-[0.14em] text-blue-600 uppercase">
                                                {laptop.brand}
                                            </p>
                                            <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-950">
                                                {laptop.name ?? laptop.model}
                                            </h3>
                                            {tags.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="mt-4 flex items-center justify-between">
                                                <p className="text-xl font-bold text-blue-600">
                                                    {formatCurrency(laptop.selling_price)}
                                                </p>
                                                <ArrowRight
                                                    className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                                                    weight="bold"
                                                />
                                            </div>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                            <LaptopIcon className="mx-auto h-10 w-10 text-slate-400" weight="duotone" />
                            <h3 className="mt-4 text-lg font-semibold text-slate-950">Katalog sedang diperbarui</h3>
                            <p className="mt-2 text-sm text-slate-600">Hubungi kami untuk rekomendasi unit yang tersedia hari ini.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ─── Services: Horizontal Cards ─── */}
            <section id="services" className="scroll-mt-24 bg-slate-50 py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Servis penting tanpa proses yang membingungkan
                        </h2>
                        <p className="mt-3 text-base leading-7 text-slate-600">
                            Fokus pada diagnosa yang masuk akal, rekomendasi yang jelas, dan hasil yang bisa dipakai kembali.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {services.map((service) => {
                            const Icon = service.icon;
                            return (
                                <div
                                    key={service.title}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                                        <Icon className="h-5 w-5" weight="duotone" />
                                    </div>
                                    <h3 className="mt-6 text-lg font-bold text-slate-950">{service.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-600">{service.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── Why Us: Dark Section ─── */}
            <section className="bg-slate-950 py-20 text-white lg:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Rapi dari konsultasi sampai serah terima
                        </h2>
                        <p className="mt-3 text-base leading-7 text-slate-300">
                            Pengalaman dibuat sederhana: data jelas, keputusan mudah, dan update bisa dilihat kapan saja.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {whyUs.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.title}
                                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
                                >
                                    {Icon && (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                                            <Icon className="h-5 w-5" weight="duotone" />
                                        </div>
                                    )}
                                    <h3 className="mt-6 text-lg font-bold">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-400">{item.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── Testimonials ─── */}
            <section className="py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Dipercaya untuk kebutuhan harian
                        </h2>
                    </div>

                    {testimonials.length > 0 ? (
                        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {testimonials.map((testimonial) => {
                                const rating = Math.max(1, Math.min(5, Number(testimonial.rating) || 5));
                                return (
                                    <div
                                        key={testimonial.id}
                                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                                    >
                                        <div className="flex gap-1 text-blue-600" aria-label={`${rating} dari 5 bintang`}>
                                            {Array.from({ length: rating }).map((_, index) => (
                                                <Star key={index} className="h-4 w-4" weight="fill" />
                                            ))}
                                        </div>
                                        <p className="mt-5 text-sm leading-7 text-slate-700">
                                            &quot;{testimonial.content}&quot;
                                        </p>
                                        <div className="mt-6 flex items-center gap-3 border-t border-slate-200 pt-5">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-sm font-bold text-white">
                                                {testimonial.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-950">{testimonial.name}</p>
                                                <p className="text-sm text-slate-500">{testimonial.role ?? 'Pelanggan'}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                            <p className="text-sm text-slate-600">Testimoni pelanggan akan tampil di sini setelah tersedia.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ─── Contact: Split Layout ─── */}
            <section id="contact" className="scroll-mt-24 bg-slate-50 py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
                        {/* Left: Info + CTAs */}
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                                Mulai dari chat, telepon, atau datang langsung
                            </h2>
                            <p className="mt-4 text-base leading-7 text-slate-600">
                                Tim kami siap bantu pilih unit, cek estimasi servis, atau arahkan proses drop-off.
                            </p>

                            <div className="mt-8 space-y-4">
                                {website.address && (
                                    <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
                                        <MapPin className="h-5 w-5 shrink-0 text-blue-600" weight="duotone" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-950">Alamat</p>
                                            <p className="mt-1 text-sm leading-6 text-slate-600">{website.address}</p>
                                        </div>
                                    </div>
                                )}
                                {(website.operational_hours_weekday || website.operational_hours_weekend) && (
                                    <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
                                        <div className="h-5 w-5 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                            ⏰
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-950">Jam operasional</p>
                                            {website.operational_hours_weekday && (
                                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                                    {website.operational_hours_weekday}
                                                </p>
                                            )}
                                            {website.operational_hours_weekend && (
                                                <p className="text-sm leading-6 text-slate-600">
                                                    {website.operational_hours_weekend}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                <a
                                    href={whatsappHref}
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
                                >
                                    <ChatCircle className="h-4 w-4" weight="fill" />
                                    WhatsApp
                                </a>
                                <a
                                    href={phoneHref}
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                                >
                                    <Phone className="h-4 w-4" weight="duotone" />
                                    Telepon
                                </a>
                            </div>
                        </div>

                        {/* Right: Map */}
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="aspect-[4/3] lg:aspect-auto lg:h-full">
                                {website.google_maps_embed ? (
                                    <iframe
                                        src={website.google_maps_embed}
                                        title="Lokasi workshop"
                                        className="h-full w-full rounded-2xl"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center p-8 text-center">
                                        <div className="max-w-sm">
                                            <MapPin className="mx-auto h-12 w-12 text-blue-600" weight="duotone" />
                                            <p className="mt-4 text-lg font-bold text-slate-950">Map belum tersedia</p>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                Hubungi WhatsApp untuk petunjuk lokasi workshop.
                                            </p>
                                            <a
                                                href="https://www.google.com/maps"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                                            >
                                                <MapPin className="h-4 w-4" weight="duotone" />
                                                Buka maps
                                                <ArrowUpRight className="h-3.5 w-3.5" weight="bold" />
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicPage>
    );
}
