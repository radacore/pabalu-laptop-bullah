import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronRight,
    Clock,
    Cpu,
    CreditCard,
    ExternalLink,
    MapPin,
    MessageCircle,
    Navigation,
    Phone,
    Quote,
    ShieldCheck,
    Sparkles,
    Star,
    Wrench,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { Laptop, Testimonial, WebsiteSetting } from '@/types';

interface Props {
    laptops: Laptop[];
    testimonials: Testimonial[];
    website: WebsiteSetting;
}

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

export default function Welcome({ laptops, testimonials, website }: Props) {
    const services: { title: string; desc: string; icon: LucideIcon }[] = [
        { title: 'Upgrade Hardware', desc: 'Tingkatkan kecepatan laptop dengan RAM baru, SSD kencang, atau penggantian baterai original bergaransi.', icon: Cpu },
        { title: 'Software Cleanup', desc: 'Pembersihan virus, instalasi OS legal, optimasi sistem, dan pembersihan data sampah.', icon: Wrench },
        { title: 'Screen Repair', desc: 'Penggantian layar LCD/LED pecah, bergaris, atau mati total dengan panel berkualitas tinggi.', icon: Sparkles },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
            <Head title={`${website.website_name} | Solusi Terpercaya untuk Laptop Anda`} />
            {/* TopNav */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-2 text-blue-800">
                            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v10H4z" opacity=".3"/><path d="M20 18H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2zm0-12H4v10h16V6zM2 20h20v-1H2v1z"/></svg>
                            <span className="text-xl font-bold tracking-tight">{website.website_name}</span>
                        </Link>
                        <nav className="hidden items-center gap-8 md:flex">
                            <Link href="/" className="text-sm font-semibold text-blue-800">Home</Link>
                            <a href="#shop" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-800">Shop</a>
                            <a href="#services" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-800">Services</a>
                            <a href="#contact" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-800">Contact</a>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="hidden text-sm font-semibold text-slate-700 transition-colors hover:text-blue-800 sm:block">Sign In</Link>
                        <Link href="/laptops" className="rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-900">Shop Now</Link>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero */}
                <section className="relative overflow-hidden bg-slate-50 py-20">
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1e40af 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                    <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
                        <div className="space-y-6">
                            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-800">
                                <ShieldCheck className="h-3.5 w-3.5" /> Trusted Laptop Specialist
                            </span>
                            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
                                Solusi Terpercaya untuk Laptop Anda
                            </h1>
                            <p className="max-w-lg text-lg leading-relaxed text-slate-600">
                                Temukan koleksi laptop refurbished berkualitas dengan garansi resmi, atau percayakan perbaikan hardware & software laptop Anda pada teknisi ahli kami.
                            </p>
                            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                                <a href="#shop" className="inline-flex items-center justify-center rounded-lg bg-blue-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-900">
                                    Lihat Laptop Pilihan
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                                <a href="#services" className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-800">
                                    Lihat Layanan Servis
                                </a>
                            </div>
                        </div>
                        <div className="relative hidden lg:block">
                            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-blue-200 opacity-40 blur-3xl" />
                            <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-emerald-200 opacity-40 blur-3xl" />
                            <div className="relative overflow-hidden rounded-2xl border-4 border-white shadow-2xl">
                                <img
                                    alt="Professional Laptop Service"
                                    className="h-[480px] w-full object-cover"
                                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1200"
                                />
                                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Laptop Pilihan</p>
                                    <p className="mt-1 text-lg font-bold text-slate-900">Unit siap pakai, bergaransi, dan sudah lulus inspeksi.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Laptop Showcase */}
                <section id="shop" className="bg-white py-20">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Laptop Pilihan</h2>
                                <p className="mt-2 text-slate-600">Kualitas Grade A+, teruji, dan siap pakai.</p>
                            </div>
                            <Link href="/laptops" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-800 hover:underline">
                                Lihat Semua Stok <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {laptops.map((laptop) => (
                                <Link
                                    key={laptop.id}
                                    href={`/laptops/${laptop.id}`}
                                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-blue-800 hover:shadow-lg"
                                >
                                    <div className="relative h-48 overflow-hidden bg-slate-100">
                                        {laptop.photos && laptop.photos[0] ? (
                                            <img alt={laptop.name ?? laptop.sku} src={laptop.photos[0].url} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                                                <Cpu className="h-12 w-12" />
                                            </div>
                                        )}
                                        <span className="absolute left-3 top-3 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                                            Certified
                                        </span>
                                    </div>
                                    <div className="space-y-3 p-5">
                                        <h3 className="line-clamp-1 text-base font-semibold text-slate-900">{laptop.name ?? laptop.sku}</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {laptop.specification?.ram && (
                                                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">{laptop.specification.ram}</span>
                                            )}
                                            {laptop.specification?.storage && (
                                                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">{laptop.specification.storage}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                            <span className="text-lg font-bold text-blue-800">{currencyFormatter.format(Number(laptop.selling_price))}</span>
                                            <ChevronRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-800" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Services */}
                <section id="services" className="bg-slate-50 py-20">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mx-auto mb-12 max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Layanan Profesional</h2>
                            <p className="mt-3 text-slate-600">Didukung oleh teknisi bersertifikat dan peralatan lab modern untuk menjamin performa laptop kembali maksimal.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {services.map((s) => (
                                <div key={s.title} className="group rounded-2xl border border-slate-200 bg-white p-7 transition-all hover:border-blue-800">
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-800 transition-colors group-hover:bg-blue-800 group-hover:text-white">
                                        <s.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mx-auto mt-12 max-w-2xl">
                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-800" />
                            </div>
                            <p className="mt-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Pengerjaan Repair Layar (75% Selesai Hari Ini)</p>
                        </div>
                    </div>
                </section>

                {/* Why Us */}
                <section className="bg-blue-800 py-20 text-white">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
                            <div className="space-y-3">
                                <ShieldCheck className="mx-auto h-12 w-12 opacity-90" />
                                <h3 className="text-lg font-semibold">Kualitas Terjamin</h3>
                                <p className="text-sm leading-relaxed opacity-85">Setiap unit laptop melewati 21 poin inspeksi ketat dan setiap perbaikan menggunakan sparepart grade A.</p>
                            </div>
                            <div className="space-y-3">
                                <Zap className="mx-auto h-12 w-12 opacity-90" />
                                <h3 className="text-lg font-semibold">Proses Cepat</h3>
                                <p className="text-sm leading-relaxed opacity-85">Kami memahami waktu Anda berharga. Mayoritas perbaikan ringan selesai dalam 1-3 jam.</p>
                            </div>
                            <div className="space-y-3">
                                <CreditCard className="mx-auto h-12 w-12 opacity-90" />
                                <h3 className="text-lg font-semibold">Harga Terjangkau</h3>
                                <p className="text-sm leading-relaxed opacity-85">Harga kompetitif dengan transparansi biaya di awal tanpa ada biaya tersembunyi.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="bg-white py-20">
                    <div className="mx-auto max-w-7xl px-6">
                        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-slate-900">Apa Kata Pelanggan Kami</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {testimonials.map((t) => (
                                <div key={t.id} className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                                    <Quote className="absolute right-5 top-5 h-10 w-10 text-blue-100" />
                                    <div className="mb-4 flex gap-1 text-amber-400">
                                        {Array.from({ length: t.rating }).map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-current" />
                                        ))}
                                    </div>
                                    <p className="mb-6 text-sm leading-relaxed text-slate-700">"{t.content}"</p>
                                    <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                                        <div
                                            className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
                                            style={{ backgroundColor: t.avatar_color || '#1e40af' }}
                                        >
                                            {t.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                                            <p className="text-xs text-slate-500">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section id="contact" className="bg-slate-50 py-20">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                <div className="space-y-7 p-10">
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Kunjungi Workshop Kami</h2>
                                        <p className="mt-3 text-slate-600">Konsultasikan kendala laptop Anda secara langsung atau lihat koleksi stok terbaru kami.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-blue-800" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Alamat Utama</p>
                                                <p className="mt-0.5 text-sm text-slate-600">{website.address ?? 'Alamat workshop belum diatur. Silakan lengkapi di Pengaturan Website.'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Phone className="mt-1 h-5 w-5 flex-shrink-0 text-blue-800" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Hubungi Kami</p>
                                                <p className="mt-0.5 text-sm text-slate-600">
                                                    {website.phone ?? '-'}
                                                    {website.whatsapp_number ? ` / +${website.whatsapp_number.replace(/[^0-9]/g, '')}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Clock className="mt-1 h-5 w-5 flex-shrink-0 text-blue-800" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Jam Operasional</p>
                                                <p className="mt-0.5 text-sm text-slate-600">
                                                    {website.operational_hours_weekday ?? 'Senin - Jumat: 09:00 - 18:00'}
                                                    <br />
                                                    {website.operational_hours_weekend ?? 'Sabtu: 10:00 - 16:00 (Minggu Tutup)'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {website.google_maps_embed ? (
                                        <div className="overflow-hidden rounded-xl border border-slate-200">
                                            <iframe
                                                src={website.google_maps_embed}
                                                title="Lokasi Workshop"
                                                className="h-48 w-full"
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            />
                                        </div>
                                    ) : (
                                        <a
                                            href="https://www.google.com/maps"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-900"
                                        >
                                            <Navigation className="h-4 w-4" /> Buka Petunjuk Jalan
                                            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                                        </a>
                                    )}
                                </div>
                                <div className="relative min-h-[320px] bg-slate-100">
                                    {website.google_maps_embed ? (
                                        <iframe
                                            src={website.google_maps_embed}
                                            title="Lokasi Workshop"
                                            className="h-full w-full"
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    ) : (
                                        <>
                                            <img
                                                alt="Map Location"
                                                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200"
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-blue-800/10 mix-blend-overlay" />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-14 md:grid-cols-4">
                    <div>
                        <div className="mb-4 flex items-center gap-2 text-blue-800">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v10H4z" opacity=".3"/><path d="M20 18H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2zm0-12H4v10h16V6zM2 20h20v-1H2v1z"/></svg>
                            <span className="text-lg font-bold tracking-tight">{website.website_name}</span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600">{website.footer_description ?? `Pusat laptop bekas berkualitas dan jasa reparasi terpercaya.`}</p>
                    </div>
                    <div>
                        <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-800">Layanan</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#shop" className="text-slate-600 transition-colors hover:text-blue-800">Jual Laptop Bekas</a></li>
                            <li><a href="#services" className="text-slate-600 transition-colors hover:text-blue-800">Servis Hardware</a></li>
                            <li><a href="#services" className="text-slate-600 transition-colors hover:text-blue-800">Instalasi Software</a></li>
                            <li><a href="#" className="text-slate-600 transition-colors hover:text-blue-800">Trade-in Laptop</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-800">Perusahaan</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="text-slate-600 transition-colors hover:text-blue-800">Tentang Kami</a></li>
                            <li><a href="#" className="text-slate-600 transition-colors hover:text-blue-800">Privacy Policy</a></li>
                            <li><a href="#" className="text-slate-600 transition-colors hover:text-blue-800">Terms of Service</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-800">Newsletter</h4>
                        <p className="mb-3 text-sm text-slate-600">Dapatkan info stok terbaru dan promo servis.</p>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Email" className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100" />
                            <button className="rounded-lg bg-blue-800 p-2 text-white transition-colors hover:bg-blue-900" aria-label="Subscribe">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="border-t border-slate-200 py-6">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-xs text-slate-500 sm:flex-row">
                        <p>© {new Date().getFullYear()} {website.website_name} Laptop Solutions. All rights reserved.</p>
                        <div className="flex gap-4 text-slate-400">
                            {website.facebook_url && <a href={website.facebook_url} target="_blank" rel="noreferrer" className="transition-colors hover:text-blue-800">Facebook</a>}
                            {website.instagram_url && <a href={website.instagram_url} target="_blank" rel="noreferrer" className="transition-colors hover:text-blue-800">Instagram</a>}
                            {website.youtube_url && <a href={website.youtube_url} target="_blank" rel="noreferrer" className="transition-colors hover:text-blue-800">YouTube</a>}
                            {website.tiktok_url && <a href={website.tiktok_url} target="_blank" rel="noreferrer" className="transition-colors hover:text-blue-800">TikTok</a>}
                        </div>
                    </div>
                </div>
            </footer>

            {/* Mobile bottom nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 grid h-16 grid-cols-5 items-center border-t border-slate-200 bg-white md:hidden">
                {[
                    { icon: Wrench, label: 'Home', href: '/', active: true },
                    { icon: Sparkles, label: 'Shop', href: '/laptops' },
                    { icon: Wrench, label: 'Service', href: '#services' },
                    { icon: MessageCircle, label: 'Kontak', href: '#contact' },
                    { icon: MessageCircle, label: 'Profile', href: '/login' },
                ].map((item, i) => (
                    <a key={i} href={item.href} className={`flex flex-col items-center gap-1 ${item.active ? 'text-blue-800' : 'text-slate-500'}`}>
                        <item.icon className="h-5 w-5" />
                        <span className="text-[10px] font-semibold">{item.label}</span>
                    </a>
                ))}
            </nav>
        </div>
    );
}
