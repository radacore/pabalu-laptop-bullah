import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    ChevronRight,
    ClipboardCheck,
    Download,
    HelpCircle,
    Laptop,
    MessageCircle,
    Search,
    Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Service, ServicePart, WebsiteSetting } from '@/types';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

type StepKey = 'received' | 'diagnosis' | 'repairing' | 'testing' | 'ready';

const stepLabels: { key: StepKey; label: string }[] = [
    { key: 'received', label: 'Received' },
    { key: 'diagnosis', label: 'Diagnosis' },
    { key: 'repairing', label: 'Repairing' },
    { key: 'testing', label: 'Quality Control' },
    { key: 'ready', label: 'Ready' },
];

function getStepIndex(service: Service): number {
    const slug = service.status?.slug?.toLowerCase() ?? '';
    const name = service.status?.name?.toLowerCase() ?? '';
    if (slug.includes('selesai') || slug.includes('diambil') || slug.includes('siap') || name.includes('selesai') || name.includes('siap') || name.includes('diambil')) return 4;
    if (slug.includes('pergantian') || slug.includes('menunggu') || name.includes('pergantian') || name.includes('menunggu')) return 2;
    if (slug.includes('pengerjaan') || name.includes('pengerjaan')) return 2;
    if (slug.includes('diagnos') || slug.includes('dicek') || name.includes('diagnos') || name.includes('dicek')) return 1;
    return 0;
}

export default function ServiceTracking({ service, website }: { service?: Service; website: WebsiteSetting }) {
    const form = useForm({ code: '' });
    const pageTitle = service
        ? `Tiket ${service.service_code} - ${website.website_name}`
        : `Cek Status Servis - ${website.website_name}`;

    if (!service) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
                <Head title={pageTitle} />
                <PublicHeader active="status" website={website} />
                <main className="mx-auto max-w-2xl px-6 py-20 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lacak Servis Anda</h1>
                    <p className="mt-3 text-slate-600">Masukkan kode tiket servis untuk melihat status perbaikan laptop Anda.</p>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (form.data.code.trim()) router.get(`/services/track/${form.data.code.trim()}`);
                        }}
                        className="mt-8"
                    >
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                            <div className="flex flex-1 items-center gap-2 px-3">
                                <Search className="h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={form.data.code}
                                    onChange={(e) => form.setData('code', e.target.value)}
                                    placeholder="Masukkan kode servis (contoh: TR-202401)"
                                    className="w-full border-none bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                                />
                            </div>
                            <button type="submit" className="rounded-lg bg-blue-800 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-900">
                                Lacak
                            </button>
                        </div>
                    </form>
                </main>
                <PublicFooter website={website} />
            </div>
        );
    }

    const stepIdx = getStepIndex(service);
    const waText = encodeURIComponent(`Halo, saya ingin menanyakan status servis ${service.service_code} atas nama ${service.customer?.name ?? '-'}.`);
    const waLink = `https://wa.me/${(website.whatsapp_number ?? '6281234567890').replace(/[^0-9]/g, '')}?text=${waText}`;
    const parts = service.parts ?? [];
    const partTotal = parts.reduce((sum: number, p: ServicePart) => sum + (Number(p.selling_price ?? 0) + Number(p.installation_fee ?? 0)) * p.quantity, 0);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
            <Head title={pageTitle} />
            <PublicHeader active="status" website={website} />

            <main className="mx-auto max-w-7xl px-6 py-8">
                <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/" className="transition-colors hover:text-blue-800">Home</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="font-semibold text-slate-900">{service.service_code}</span>
                </nav>

                <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tiket #{service.service_code}</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Pelanggan: <span className="font-semibold text-slate-900">{service.customer?.name ?? '-'}</span>
                            {' · '}
                            Diterima: <span className="font-semibold text-slate-900">{new Date(service.received_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-800">
                            <Wrench className="h-3.5 w-3.5" /> {service.status?.name ?? 'Aktif'}
                        </span>
                        {service.payment_status === 'paid' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                                <Check className="h-3.5 w-3.5" /> Lunas
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold tracking-tight text-slate-900">Repair Progress</h2>
                            <div className="mt-8">
                                <div className="relative">
                                    <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-slate-200" />
                                    <div className="absolute left-0 top-5 h-1 rounded-full bg-blue-800 transition-all duration-500" style={{ width: `${(stepIdx / 4) * 100}%` }} />
                                    <div className="relative flex justify-between">
                                        {stepLabels.map((s, i) => {
                                            const isDone = i < stepIdx;
                                            const isCurrent = i === stepIdx;
                                            return (
                                                <div key={s.key} className="flex w-16 flex-col items-center text-center">
                                                    <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm shadow-sm transition-all ${
                                                        isDone || isCurrent ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-400'
                                                    } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                                                        {isDone ? <Check className="h-4 w-4" /> : isCurrent ? <Wrench className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
                                                    </div>
                                                    <span className={`mt-2 text-xs font-semibold ${isCurrent ? 'text-blue-800' : isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                                                        {s.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold tracking-tight text-slate-900">Informasi Perangkat</h2>
                            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Model</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">{service.brand ?? '-'} {service.model ?? '-'}</p>
                                    </div>
                                    {service.serial_number && (
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Serial Number</p>
                                            <p className="mt-1 text-sm font-mono font-semibold text-slate-900">{service.serial_number}</p>
                                        </div>
                                    )}
                                    {service.kelengkapan && (
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Kelengkapan</p>
                                            <p className="mt-1 text-sm text-slate-700">{service.kelengkapan}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Keluhan</p>
                                        <p className="mt-1 text-sm leading-relaxed text-slate-700">{service.complaint}</p>
                                    </div>
                                    {service.initial_condition && (
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Kondisi Awal</p>
                                            <p className="mt-1 text-sm text-slate-700">{service.initial_condition}</p>
                                        </div>
                                    )}
                                </div>
                                {parts.length > 0 && (
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Sparepart Digunakan</p>
                                        <ul className="mt-3 space-y-2">
                                            {parts.map((p) => (
                                                <li key={p.id} className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-700">{p.part_name} <span className="text-xs text-slate-500">x{p.quantity}</span></span>
                                                    <span className="font-semibold text-slate-900">{currencyFormatter.format(Number(p.selling_price ?? 0))}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </section>

                        {service.updates && service.updates.length > 0 && (
                            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-bold tracking-tight text-slate-900">Repair Updates</h2>
                                <div className="mt-6 space-y-5 border-l-2 border-slate-200 pl-6">
                                    {service.updates.map((u) => (
                                        <div key={u.id} className="relative">
                                            <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-4 border-white bg-blue-800" />
                                            <p className="text-sm font-semibold text-slate-900">{u.note || `Status: ${u.new_status}`}</p>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                {new Date(u.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="space-y-4">
                        <section className="rounded-xl bg-blue-800 p-6 text-white shadow-md">
                            <h3 className="text-lg font-bold">Ringkasan</h3>
                            <div className="mt-4 space-y-3">
                                {service.estimated_completion_date && (
                                    <div className="flex items-center justify-between border-b border-blue-700 pb-3">
                                        <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Estimasi Selesai</span>
                                        <span className="text-sm font-bold">
                                            {new Date(service.estimated_completion_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider opacity-75">Rincian Biaya</p>
                                    <div className="mt-2 space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                            <span className="opacity-90">Biaya Diagnosa</span>
                                            <span className="font-semibold">{currencyFormatter.format(50000)}</span>
                                        </div>
                                        {parts.length > 0 && (
                                            <div className="flex justify-between">
                                                <span className="opacity-90">Sparepart + Pasang</span>
                                                <span className="font-semibold">{currencyFormatter.format(partTotal)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-blue-700 pt-3">
                                    <span className="text-sm font-bold">Total Estimasi</span>
                                    <span className="text-lg font-bold">{currencyFormatter.format(Number(service.estimated_cost ?? 50000 + partTotal))}</span>
                                </div>
                                <p className="text-[11px] italic opacity-75">* Harga transparan berdasarkan diagnosa terkini. Anda akan diberi tahu jika ada perubahan.</p>
                            </div>
                        </section>

                        <a href={waLink} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-600 active:scale-95">
                            <MessageCircle className="h-4 w-4" /> Hubungi Teknisi (WhatsApp)
                        </a>

                        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-50 active:scale-95">
                            <Download className="h-4 w-4" /> Unduh Laporan Servis
                        </button>

                        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                                <HelpCircle className="h-4 w-4 text-blue-800" /> Butuh Bantuan?
                            </h4>
                            <p className="text-xs text-slate-600">Punya pertanyaan tentang status perbaikan atau rincian biaya? Tim support kami siap membantu.</p>
                            <Link href="/" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-800 hover:underline">
                                Pusat Bantuan <ArrowRight className="h-3 w-3" />
                            </Link>
                        </section>
                    </div>
                </div>
            </main>

            <PublicFooter website={website} />
        </div>
    );
}

function PublicHeader({ active, website }: { active: 'home' | 'shop' | 'services' | 'status' | 'contact'; website: WebsiteSetting }) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-2 text-blue-800">
                        <Laptop className="h-7 w-7" />
                        <span className="text-xl font-bold tracking-tight">{website.website_name}</span>
                    </Link>
                    <nav className="hidden items-center gap-8 md:flex">
                        <Link href="/" className={`text-sm font-medium transition-colors ${active === 'home' ? 'text-blue-800 font-semibold' : 'text-slate-600 hover:text-blue-800'}`}>Home</Link>
                        <Link href="/laptops" className={`text-sm font-medium transition-colors ${active === 'shop' ? 'text-blue-800 font-semibold' : 'text-slate-600 hover:text-blue-800'}`}>Shop</Link>
                        <a href="#services" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-800">Services</a>
                        <Link href="/services/track" className={`text-sm font-medium transition-colors ${active === 'status' ? 'text-blue-800 font-semibold' : 'text-slate-600 hover:text-blue-800'}`}>Check Status</Link>
                        <a href="#contact" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-800">Contact</a>
                    </nav>
                </div>
                <Link href="/login" className="rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-900">
                    Sign In
                </Link>
            </div>
        </header>
    );
}

function PublicFooter({ website }: { website: WebsiteSetting }) {
    return (
        <footer className="mt-12 border-t border-slate-200 bg-white">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-10 text-sm md:grid-cols-4">
                <div>
                    <Link href="/" className="flex items-center gap-2 text-base font-bold text-blue-800">
                        <Laptop className="h-5 w-5" /> {website.website_name}
                    </Link>
                    <p className="mt-2 text-xs text-slate-500">{website.footer_description ?? 'Solusi terpercaya untuk laptop refurbished berkualitas dan perbaikan hardware profesional.'}</p>
                </div>
                <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-900">Connect</h4>
                    <p className="text-xs text-slate-500">{website.address ?? 'Alamat belum diatur.'}</p>
                    <p className="text-xs text-slate-500">{website.phone ?? website.whatsapp_number ?? '-'}</p>
                </div>
                <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-900">Social</h4>
                    {website.facebook_url && <a href={website.facebook_url} target="_blank" rel="noreferrer" className="block text-xs text-slate-500 hover:text-blue-800">Facebook</a>}
                    {website.instagram_url && <a href={website.instagram_url} target="_blank" rel="noreferrer" className="block text-xs text-slate-500 hover:text-blue-800">Instagram</a>}
                    {website.youtube_url && <a href={website.youtube_url} target="_blank" rel="noreferrer" className="block text-xs text-slate-500 hover:text-blue-800">YouTube</a>}
                    {website.tiktok_url && <a href={website.tiktok_url} target="_blank" rel="noreferrer" className="block text-xs text-slate-500 hover:text-blue-800">TikTok</a>}
                </div>
                <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-900">Newsletter</h4>
                    <p className="text-xs text-slate-500">Dapatkan info stok terbaru dan promo servis.</p>
                </div>
            </div>
            <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} {website.website_name} Laptop Solutions. All rights reserved.
            </div>
        </footer>
    );
}
