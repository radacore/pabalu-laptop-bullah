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
    },
    {
        title: 'Perbaikan hardware',
        description:
            'Layar, keyboard, engsel, port, dan sparepart penting dengan diagnosa jelas di awal.',
        icon: Wrench,
    },
    {
        title: 'Unit refurbished siap pakai',
        description:
            'Laptop bekas terkurasi, sudah dicek, dibersihkan, dan siap untuk kerja harian.',
        icon: CheckCircle,
    },
];

const whyItems = [
    {
        icon: ShieldCheck,
        title: 'QC sebelum serah terima',
        description:
            'Setiap unit melewati pengecekan fungsi utama, suhu, baterai, layar, port, dan performa.',
    },
    {
        icon: Wrench,
        title: 'Progres transparan',
        description:
            'Kode tiket membuka progres perbaikan tanpa perlu bolak-balik menanyakan update.',
    },
    {
        icon: CheckCircle,
        title: 'Estimasi biaya jelas',
        description:
            'Opsi perbaikan dan biaya dikonfirmasi sebelum pengerjaan agar keputusan tetap nyaman.',
    },
    {
        icon: ChatCircle,
        title: 'Konsultasi WhatsApp',
        description:
            'Tanya dulu sebelum datang, lewat chat dengan tim yang paham unit yang akan Anda beli.',
    },
];

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
            {/* ─── Hero: Centered text + giant product image ─── */}
            <section className="bg-cloud pt-12 pb-0 md:pt-16">
                <div className="mx-auto max-w-[980px] px-4 text-center">
                    <h1 className="mx-auto max-w-3xl apple-display text-graphite">
                        Laptop bersih, jelas,
                        <br className="hidden sm:block" />
                        <span className="sm:hidden"> </span>
                        dan siap dipakai.
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl apple-body-lg text-slate-2">
                        {website.tagline ??
                            'Temukan laptop bekas terkurasi, konsultasikan servis, dan pantau progres pengerjaan dari satu tempat yang mudah dipakai.'}
                    </p>
                    <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <a
                            href="/shop"
                            className="inline-flex h-10 items-center justify-center rounded-pill bg-button-blue px-6 apple-body text-paper transition hover:bg-deep-link-blue"
                        >
                            Lihat katalog
                        </a>
                        <a
                            href="#status"
                            className="inline-flex h-10 items-center justify-center rounded-pill border border-apple-blue bg-transparent px-6 apple-body text-apple-blue transition hover:border-deep-link-blue hover:text-deep-link-blue"
                        >
                            Lacak servis
                        </a>
                    </div>
                </div>

                {heroImage ? (
                    <div className="mx-auto mt-12 max-w-[1100px] px-4">
                        <a
                            href={heroLaptop ? `/laptops/${heroLaptop.id}` : '/shop'}
                            className="block overflow-hidden"
                        >
                            <img
                                src={heroImage}
                                alt={
                                    heroLaptop?.name ??
                                    `${brandLabel(heroLaptop?.brand, '')} ${heroLaptop?.model ?? ''}`
                                }
                                className="mx-auto h-auto w-full max-w-[900px] object-contain"
                                style={{
                                    filter: 'drop-shadow(0 30px 50px rgba(0, 0, 0, 0.18))',
                                }}
                            />
                        </a>
                    </div>
                ) : (
                    <div className="mx-auto mt-12 max-w-md rounded-card border border-bone bg-paper p-10 text-center">
                        <LaptopIcon
                            className="mx-auto h-12 w-12 text-fog"
                            weight="duotone"
                        />
                        <p className="mt-3 apple-body text-slate-2">
                            Tambahkan foto laptop di katalog untuk menampilkannya
                            di sini.
                        </p>
                    </div>
                )}
            </section>

            {/* ─── Status tracker ─── */}
            <section
                id="status"
                className="scroll-mt-16 bg-paper py-16 md:py-20"
            >
                <div className="mx-auto max-w-[640px] px-4 text-center">
                    <h2 className="apple-subheading text-graphite">
                        Lacak status servis
                    </h2>
                    <p className="mt-3 apple-body text-slate-2">
                        Masukkan kode tiket untuk melihat progres pengerjaan
                        laptop Anda.
                    </p>

                    <form
                        onSubmit={submitStatusSearch}
                        className="mx-auto mt-7 max-w-md"
                    >
                        <label
                            htmlFor="service-code"
                            className="flex h-11 items-center gap-3 rounded-pill border border-bone bg-paper px-4 transition focus-within:border-apple-blue focus-within:ring-4 focus-within:ring-apple-blue/20"
                        >
                            <input
                                id="service-code"
                                name="code"
                                type="text"
                                placeholder="Kode servis (contoh: SRV-20240613-XXXXX)"
                                className="min-w-0 flex-1 border-none bg-transparent apple-body text-graphite outline-none placeholder:text-fog"
                            />
                            <button
                                type="submit"
                                className="inline-flex h-8 items-center justify-center rounded-pill bg-button-blue px-4 apple-caption text-paper transition hover:bg-deep-link-blue"
                            >
                                Lacak
                            </button>
                        </label>
                    </form>

                    <ol className="mx-auto mt-10 max-w-md space-y-2 text-left">
                        <li className="apple-body-sm text-slate-2">
                            <span className="text-fog">01.</span> Diagnosa dan
                            estimasi dikonfirmasi dulu.
                        </li>
                        <li className="apple-body-sm text-slate-2">
                            <span className="text-fog">02.</span> Progres bisa
                            dipantau dengan kode tiket.
                        </li>
                        <li className="apple-body-sm text-slate-2">
                            <span className="text-fog">03.</span> Unit diuji
                            ulang sebelum diserahkan.
                        </li>
                    </ol>
                </div>
            </section>

            {/* ─── Laptop showcase ─── */}
            <section className="bg-cloud py-20 md:py-24">
                <div className="mx-auto max-w-[980px] px-4">
                    <div className="mb-12 text-center">
                        <h2 className="apple-heading-lg text-graphite">
                            Pilihan unit siap kerja
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl apple-body-lg text-slate-2">
                            Unit terbaru dengan spesifikasi inti yang mudah
                            dibandingkan sebelum Anda datang atau chat.
                        </p>
                    </div>

                    {laptops.length > 0 ? (
                        <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                            {laptops.slice(0, 6).map((laptop) => (
                                <LaptopCard key={laptop.id} laptop={laptop} />
                            ))}
                        </div>
                    ) : (
                        <div className="mx-auto max-w-md rounded-card border border-bone bg-paper p-10 text-center">
                            <LaptopIcon
                                className="mx-auto h-10 w-10 text-fog"
                                weight="duotone"
                            />
                            <p className="mt-4 apple-body text-slate-2">
                                Katalog sedang diperbarui. Hubungi kami untuk
                                rekomendasi unit hari ini.
                            </p>
                        </div>
                    )}

                    <div className="mt-12 text-center">
                        <a
                            href="/shop"
                            className="inline-flex h-10 items-center justify-center rounded-pill border border-apple-blue bg-transparent px-6 apple-body text-apple-blue transition hover:border-deep-link-blue hover:text-deep-link-blue"
                        >
                            Lihat semua laptop
                        </a>
                    </div>
                </div>
            </section>

            {/* ─── Services ─── */}
            <section
                id="services"
                className="scroll-mt-16 bg-paper py-20 md:py-24"
            >
                <div className="mx-auto max-w-[980px] px-4">
                    <div className="mb-14 text-center">
                        <h2 className="apple-heading-lg text-graphite">
                            Servis yang fokus pada hasil,
                            <br />
                            bukan proses.
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl apple-body-lg text-slate-2">
                            Diagnosa yang masuk akal, rekomendasi yang jelas,
                            dan pengerjaan yang bisa Anda pantau.
                        </p>
                    </div>

                    <ul className="grid gap-12 md:grid-cols-3">
                        {serviceItems.map((service) => {
                            const Icon = service.icon;
                            return (
                                <li
                                    key={service.title}
                                    className="text-center"
                                >
                                    <Icon
                                        className="mx-auto h-10 w-10 text-graphite"
                                        weight="duotone"
                                        aria-hidden="true"
                                    />
                                    <h3 className="mt-5 apple-subheading text-graphite">
                                        {service.title}
                                    </h3>
                                    <p className="mt-3 apple-body text-slate-2">
                                        {service.description}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            {/* ─── Why us ─── */}
            <section className="bg-cloud py-20 md:py-24">
                <div className="mx-auto max-w-[980px] px-4">
                    <div className="mb-14 text-center">
                        <h2 className="apple-heading-lg text-graphite">
                            Rapi dari konsultasi
                            <br />
                            sampai serah terima
                        </h2>
                    </div>
                    <ol className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                        {whyItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.title} className="text-center">
                                    <Icon
                                        className="mx-auto h-7 w-7 text-graphite"
                                        weight="duotone"
                                        aria-hidden="true"
                                    />
                                    <h3 className="mt-5 apple-body font-semibold text-graphite">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 apple-body-sm text-slate-2">
                                        {item.description}
                                    </p>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </section>

            {/* ─── Testimonials ─── */}
            {testimonials.length > 0 ? (
                <section className="bg-paper py-20 md:py-24">
                    <div className="mx-auto max-w-[980px] px-4">
                        <div className="mb-12 text-center">
                            <h2 className="apple-heading-lg text-graphite">
                                Dipercaya untuk
                                <br />
                                kebutuhan harian
                            </h2>
                        </div>
                        <div className="grid gap-12 md:grid-cols-3">
                            {testimonials.slice(0, 3).map((testimonial) => {
                                const rating = Math.max(
                                    1,
                                    Math.min(5, Number(testimonial.rating) || 5),
                                );
                                return (
                                    <TestimonialCard
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

            {/* ─── Contact ─── */}
            <section
                id="contact"
                className="scroll-mt-16 bg-cloud py-20 md:py-24"
            >
                <div className="mx-auto max-w-[980px] px-4">
                    <div className="mb-12 text-center">
                        <h2 className="apple-heading-lg text-graphite">
                            Mulai dari chat, telepon,
                            <br />
                            atau datang langsung.
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl apple-body-lg text-slate-2">
                            Tim kami siap bantu pilih unit, cek estimasi
                            servis, atau arahkan proses drop-off.
                        </p>
                    </div>

                    <div className="grid gap-10 md:grid-cols-3">
                        {website.address ? (
                            <ContactCard
                                icon={MapPin}
                                label="Alamat"
                                value={website.address}
                            />
                        ) : null}
                        {(website.operational_hours_weekday ||
                            website.operational_hours_weekend) && (
                            <ContactCard
                                icon={Wrench}
                                label="Jam operasional"
                                value={[
                                    website.operational_hours_weekday,
                                    website.operational_hours_weekend,
                                ]
                                    .filter(Boolean)
                                    .join(' / ')}
                            />
                        )}
                        {website.phone ? (
                            <ContactCard
                                icon={Phone}
                                label="Telepon"
                                value={website.phone}
                            />
                        ) : null}
                    </div>

                    <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <a
                            href={whatsappHref}
                            className="inline-flex h-10 items-center justify-center rounded-pill bg-button-blue px-6 apple-body text-paper transition hover:bg-deep-link-blue"
                        >
                            <ChatCircle
                                className="mr-1.5 h-3.5 w-3.5"
                                weight="fill"
                            />
                            WhatsApp
                        </a>
                        <a
                            href={phoneHref}
                            className="inline-flex h-10 items-center justify-center rounded-pill border border-apple-blue bg-transparent px-6 apple-body text-apple-blue transition hover:border-deep-link-blue hover:text-deep-link-blue"
                        >
                            <Phone
                                className="mr-1.5 h-3.5 w-3.5"
                                weight="duotone"
                            />
                            Telepon
                        </a>
                    </div>

                    {website.google_maps_embed ? (
                        <div className="mt-12 overflow-hidden rounded-card border border-bone">
                            <iframe
                                src={website.google_maps_embed}
                                title="Lokasi workshop"
                                className="h-[420px] w-full"
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

function LaptopCard({ laptop }: { laptop: Laptop }) {
    const image = laptopPhoto(laptop);
    return (
        <a href={`/laptops/${laptop.id}`} className="group block">
            <div className="overflow-hidden rounded-card bg-paper">
                <div className="aspect-[4/3] overflow-hidden bg-bone/40">
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
                        <div className="flex h-full w-full items-center justify-center text-fog">
                            <LaptopIcon className="h-10 w-10" weight="duotone" />
                        </div>
                    )}
                </div>
            </div>
            <div className="pt-4">
                <p className="apple-caption text-fog">
                    {brandLabel(laptop.brand, '')}
                </p>
                <h3 className="mt-1 apple-body font-semibold text-graphite">
                    {laptop.name ?? laptop.model}
                </h3>
                <p className="mt-2 apple-body text-apple-blue">
                    {formatCurrency(laptop.selling_price)}
                </p>
                <p className="mt-3 inline-flex items-center gap-1 apple-caption text-apple-blue transition group-hover:text-deep-link-blue">
                    Lihat detail
                    <ArrowRight className="h-3 w-3" weight="bold" />
                </p>
            </div>
        </a>
    );
}

function TestimonialCard({
    testimonial,
    rating,
}: {
    testimonial: TestimonialItem;
    rating: number;
}) {
    return (
        <figure className="text-center">
            <div
                className="mx-auto flex justify-center gap-0.5 text-graphite"
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
            <blockquote className="mt-5 apple-body text-slate-2">
                “{testimonial.content}”
            </blockquote>
            <figcaption className="mt-5">
                <p className="apple-body-sm font-semibold text-graphite">
                    {testimonial.name}
                </p>
                <p className="apple-caption text-fog">
                    {testimonial.role ?? 'Pelanggan'}
                </p>
            </figcaption>
        </figure>
    );
}

function ContactCard({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof MapPin;
    label: string;
    value: ReactNode;
}) {
    return (
        <div className="text-center">
            <Icon
                className="mx-auto h-7 w-7 text-graphite"
                weight="duotone"
                aria-hidden="true"
            />
            <p className="mt-4 apple-caption text-fog">{label}</p>
            <p className="mt-1 apple-body text-graphite">{value}</p>
        </div>
    );
}
