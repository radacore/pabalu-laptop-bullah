import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Battery,
    ChevronRight,
    Cpu,
    HardDrive,
    Laptop,
    MessageCircle,
    Monitor,
    ShoppingCart,
    Star,
} from 'lucide-react';
import type { Laptop as LaptopType, WebsiteSetting } from '@/types';

interface Props {
    laptop: LaptopType;
    related: LaptopType[];
    website: WebsiteSetting;
}

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

export default function LaptopDetail({ laptop, related, website }: Props) {
    const photos = (laptop.photos ?? []).length > 0
        ? laptop.photos!
        : [{ id: 0, url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1200', laptop_id: laptop.id }];
    const spec = laptop.specification;
    const waText = encodeURIComponent(`Halo, saya tertarik dengan ${laptop.name ?? laptop.sku}. Apakah masih tersedia?`);
    const waLink = `https://wa.me/${(website.whatsapp_number ?? '6281234567890').replace(/[^0-9]/g, '')}?text=${waText}`;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
            <Head title={`${laptop.name ?? laptop.sku} - ${website.website_name}`} />
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-2 text-blue-800">
                            <Laptop className="h-7 w-7" />
                            <span className="text-xl font-bold tracking-tight">{website.website_name}</span>
                        </Link>
                        <nav className="hidden items-center gap-8 md:flex">
                            <Link href="/" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-800">Home</Link>
                            <Link href="/laptops" className="text-sm font-semibold text-blue-800">Shop</Link>
                            <a href="#services" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-800">Services</a>
                            <a href="/services/track" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-800">Check Status</a>
                            <a href="#contact" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-800">Contact</a>
                        </nav>
                    </div>
                    <Link href="/login" className="rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-900">
                        Sign In
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">
                <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/" className="transition-colors hover:text-blue-800">Home</Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href="/laptops" className="transition-colors hover:text-blue-800">Shop</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="font-semibold text-slate-900">{laptop.brand}</span>
                </nav>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                    <div className="space-y-4 lg:col-span-7">
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <img alt={laptop.name ?? laptop.sku} src={photos[0].url} className="aspect-[4/3] w-full object-cover" />
                        </div>
                        {photos.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {photos.map((p, i) => (
                                    <button key={p.id} className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${i === 0 ? 'border-blue-800 opacity-100' : 'border-slate-200 opacity-60 hover:opacity-100'}`}>
                                        <img alt={`thumb-${i}`} src={p.url} className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-5 lg:col-span-5">
                        <div>
                            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                                <Star className="h-3 w-3 fill-current" /> Ready Stock
                            </span>
                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">
                                {laptop.brand} {laptop.model} {laptop.name ? `(${laptop.name})` : ''}
                            </h1>
                            <p className="mt-3 text-2xl font-bold text-blue-800">{currencyFormatter.format(Number(laptop.selling_price))}</p>
                        </div>

                        <div className="border-y border-slate-200 py-5">
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-900">Spesifikasi Detail</h3>
                            <ul className="space-y-2">
                                <SpecRow icon={Cpu} label="Processor" value={spec?.processor ?? '-'} />
                                <SpecRow icon={HardDrive} label="RAM" value={spec?.ram ?? '-'} />
                                <SpecRow icon={HardDrive} label="Storage" value={spec?.storage ?? '-'} />
                                <SpecRow icon={Monitor} label="Layar" value={spec?.display ?? '-'} />
                                <SpecRow icon={Battery} label="Baterai" value={spec?.battery ?? 'Original'} />
                            </ul>
                        </div>

                        <div className="flex flex-col gap-3 pt-1">
                            <button className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-blue-800 text-base font-semibold text-white shadow-sm transition-all hover:bg-blue-900 active:scale-[0.98]">
                                <ShoppingCart className="h-5 w-5" /> Beli Sekarang
                            </button>
                            <a href={waLink} target="_blank" rel="noreferrer" className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-blue-800 text-base font-semibold text-blue-800 transition-all hover:bg-blue-800 hover:text-white">
                                <MessageCircle className="h-5 w-5" /> Tanya Lewat WhatsApp
                            </a>
                        </div>
                    </div>
                </div>

                <section className="mt-14 border-t border-slate-200 pt-12">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Deskripsi Produk</h2>
                    <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-slate-700">
                        <p>
                            Dijual <strong>{laptop.brand} {laptop.model}</strong> dengan kondisi <strong>Grade A+</strong>. Body mulus, tidak ada dent atau goresan kasar. Produk telah melewati inspeksi teknis ketat oleh tim {website.website_name} untuk memastikan semua hardware berfungsi normal.
                        </p>
                        {spec?.other_specifications && (
                            <p className="whitespace-pre-line">{spec.other_specifications}</p>
                        )}
                        <ul className="ml-5 list-disc space-y-1">
                            <li>Garansi Toko 1 Bulan (Hardware & Software)</li>
                            <li>Sistem operasi terbaru sudah terpasang (Clean Install)</li>
                            <li>Free Tas Laptop & Mouse Wireless (Selama stok tersedia)</li>
                        </ul>
                    </div>
                </section>

                {related.length > 0 && (
                    <section className="mt-14 pb-12">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">Produk Terkait</h2>
                            <Link href="/laptops" className="text-sm font-semibold text-blue-800 hover:underline">Lihat Semua</Link>
                        </div>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            {related.map((r) => (
                                <Link key={r.id} href={`/laptops/${r.id}`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-blue-800 hover:shadow-md">
                                    <div className="relative h-44 overflow-hidden bg-slate-100">
                                        {r.photos && r.photos[0] ? (
                                            <img alt={r.name ?? r.sku} src={r.photos[0].url} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                                                <Laptop className="h-10 w-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2 p-4">
                                        <h3 className="truncate text-sm font-semibold text-slate-900">{r.brand} {r.model}</h3>
                                        <p className="text-xs text-slate-500">{r.specification?.ram ?? '-'} | {r.specification?.storage ?? '-'}</p>
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-sm font-bold text-blue-800">{currencyFormatter.format(Number(r.selling_price))}</span>
                                            <ArrowRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-800" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <footer className="mt-12 border-t border-slate-200 bg-white">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-10 text-sm md:grid-cols-4">
                    <div>
                        <Link href="/" className="flex items-center gap-2 text-base font-bold text-blue-800">
                            <Laptop className="h-5 w-5" /> {website.website_name}
                        </Link>
                        <p className="mt-2 text-xs text-slate-500">{website.footer_description ?? 'Solusi terpercaya untuk laptop refurbished berkualitas dan perbaikan hardware profesional.'}</p>
                    </div>
                    <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-900">Contact</h4>
                        <p className="text-xs text-slate-500">{website.address ?? 'Alamat belum diatur.'}</p>
                        <p className="text-xs text-slate-500">{website.phone ?? website.whatsapp_number ?? '-'}</p>
                    </div>
                    <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-900">Company</h4>
                        <p className="text-xs text-slate-500">Tentang {website.website_name}</p>
                        <p className="text-xs text-slate-500">Garansi Servis</p>
                    </div>
                    <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-900">Social</h4>
                        {website.facebook_url && <a href={website.facebook_url} target="_blank" rel="noreferrer" className="block text-xs text-slate-500 hover:text-blue-800">Facebook</a>}
                        {website.instagram_url && <a href={website.instagram_url} target="_blank" rel="noreferrer" className="block text-xs text-slate-500 hover:text-blue-800">Instagram</a>}
                        {website.youtube_url && <a href={website.youtube_url} target="_blank" rel="noreferrer" className="block text-xs text-slate-500 hover:text-blue-800">YouTube</a>}
                        {website.tiktok_url && <a href={website.tiktok_url} target="_blank" rel="noreferrer" className="block text-xs text-slate-500 hover:text-blue-800">TikTok</a>}
                    </div>
                </div>
                <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">
                    © {new Date().getFullYear()} {website.website_name} Laptop Solutions. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

function SpecRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
    return (
        <li className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Icon className="h-4 w-4 text-blue-800" /> {label}
            </span>
            <span className="text-sm font-bold text-slate-900">{value}</span>
        </li>
    );
}
