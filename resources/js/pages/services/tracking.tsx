import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    CaretLeft,
    CaretRight,
    ChatCircle,
    ClipboardText,
    CurrencyDollar,
    Download,
    Laptop,
    MagnifyingGlass,
    Question,
    Wrench,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import {
    PublicPage,
    formatCurrency,
} from '@/components/public-layout';
import type {
    Service,
    ServicePart,
    ServiceUpdate,
    WebsiteSetting,
} from '@/types';

type StepKey = 'received' | 'diagnosis' | 'repairing' | 'testing' | 'ready';
type TrackedService = Service & { updates?: ServiceUpdate[] };

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
    if (
        slug.includes('selesai') ||
        slug.includes('diambil') ||
        slug.includes('siap') ||
        name.includes('selesai') ||
        name.includes('siap') ||
        name.includes('diambil')
    )
        return 4;
    if (
        slug.includes('pergantian') ||
        slug.includes('menunggu') ||
        name.includes('pergantian') ||
        name.includes('menunggu')
    )
        return 2;
    if (slug.includes('pengerjaan') || name.includes('pengerjaan')) return 2;
    if (
        slug.includes('diagnos') ||
        slug.includes('dicek') ||
        name.includes('diagnos') ||
        name.includes('dicek')
    )
        return 1;
    return 0;
}

function formatDate(
    value: string | null | undefined,
    options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    },
) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', options);
}

function InfoItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 uppercase">{label}</p>
            <p className={`mt-1 text-sm font-medium text-slate-900 ${mono ? 'font-mono' : ''}`}>{value}</p>
        </div>
    );
}

export default function ServiceTracking({
    service,
    website,
    error,
    tracking_code,
}: {
    service?: TrackedService;
    website: WebsiteSetting;
    error?: string;
    tracking_code?: string;
}) {
    const form = useForm({ code: '' });
    const pageTitle = service
        ? `Tiket ${service.service_code} - ${website.website_name}`
        : `Cek Status Servis - ${website.website_name}`;

    function submitSearch(event: { preventDefault: () => void }) {
        event.preventDefault();
        const code = form.data.code.trim();
        if (code) router.get(`/services/track/${code}`);
    }

    if (!service) {
        return (
            <PublicPage
                website={website}
                title={pageTitle}
                currentPath="/#status"
            >
                <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-20 pt-20 lg:pb-28 lg:pt-28">
                    <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                            <Wrench className="h-6 w-6" weight="duotone" />
                        </div>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                            Lacak progres servis laptop Anda
                        </h1>
                        <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                            Masukkan kode tiket untuk melihat status pengerjaan, estimasi selesai, dan ringkasan biaya terbaru.
                        </p>

                        {error && (
                            <div className="mx-auto mt-6 max-w-xl rounded-xl border border-red-200 bg-red-50 p-4">
                                <p className="text-sm text-red-800">{error}</p>
                                {tracking_code && (
                                    <p className="mt-2 text-xs text-red-600">
                                        Kode yang dicari: <span className="font-mono font-semibold">{tracking_code}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        <form onSubmit={submitSearch} className="mx-auto mt-10 max-w-xl">
                            <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100">
                                <div className="flex flex-1 items-center gap-3 px-3">
                                    <MagnifyingGlass className="h-5 w-5 shrink-0 text-slate-400" weight="duotone" />
                                    <input
                                        type="text"
                                        value={form.data.code}
                                        onChange={(e) => form.setData('code', e.target.value)}
                                        placeholder="Masukkan kode servis (contoh: SRV-20260613-3836)"
                                        className="min-w-0 flex-1 border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                                >
                                    Lacak
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </PublicPage>
        );
    }

    const stepIdx = getStepIndex(service);
    const waText = encodeURIComponent(
        `Halo, saya ingin menanyakan status servis ${service.service_code} atas nama ${service.customer?.name ?? '-'}.`,
    );
    const waLink = `https://wa.me/${(website.whatsapp_number ?? '6281234567890').replace(/[^0-9]/g, '')}?text=${waText}`;
    const parts = service.parts ?? [];
    const updates = service.updates ?? [];
    const partTotal = parts.reduce(
        (sum, part) =>
            sum +
            (Number(part.selling_price ?? 0) + Number(part.installation_fee ?? 0)) *
                part.quantity,
        0,
    );
    const diagnosisCost = 50_000;
    const estimatedTotal = Number(service.estimated_cost ?? diagnosisCost + partTotal);

    return (
        <PublicPage
            website={website}
            title={pageTitle}
            currentPath="/#status"
        >
            {/* ─── Ticket Header ─── */}
            <section className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-10 pt-10 lg:pb-14 lg:pt-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.14em] text-blue-600 uppercase">Tiket Servis</p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                                #{service.service_code}
                            </h1>
                            <p className="mt-2 text-sm text-slate-600">
                                Pelanggan:{' '}
                                <span className="font-semibold text-slate-950">{service.customer?.name ?? '-'}</span>
                                <span className="mx-2 text-slate-300">/</span>
                                Diterima:{' '}
                                <span className="font-semibold text-slate-950">{formatDate(service.received_at)}</span>
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold tracking-[0.12em] text-blue-600 uppercase">
                                <Wrench className="h-3.5 w-3.5" weight="fill" />
                                {service.status?.name ?? 'Aktif'}
                            </span>
                            {service.payment_status === 'paid' && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3.5 py-1.5 text-xs font-semibold tracking-[0.12em] text-green-600 uppercase">
                                    Lunas
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Main Content ─── */}
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:px-8 lg:py-12">
                <div className="space-y-6">
                    {/* Progress Tracker */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold tracking-tight text-slate-950">Repair Progress</h2>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                {stepIdx + 1} / {stepLabels.length}
                            </span>
                        </div>

                        <div className="mt-8">
                            {/* Desktop horizontal stepper */}
                            <div className="hidden sm:block">
                                <div className="relative flex items-center justify-between">
                                    <div className="absolute inset-x-0 top-5 h-0.5 bg-slate-200" />
                                    <div
                                        className="absolute top-5 h-0.5 bg-blue-600 transition-all duration-500"
                                        style={{
                                            width: `${(stepIdx / (stepLabels.length - 1)) * 100}%`,
                                        }}
                                    />
                                    {stepLabels.map((step, index) => {
                                        const isDone = index < stepIdx;
                                        const isCurrent = index === stepIdx;
                                        return (
                                            <div key={step.key} className="relative flex flex-col items-center">
                                                <div
                                                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold shadow-sm transition ${
                                                        isDone || isCurrent
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white text-slate-400 ring-2 ring-slate-200'
                                                    }`}
                                                >
                                                    {isDone ? (
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : isCurrent ? (
                                                        <Wrench className="h-4 w-4" weight="fill" />
                                                    ) : (
                                                        <span>{index + 1}</span>
                                                    )}
                                                </div>
                                                <p
                                                    className={`mt-3 text-center text-[11px] font-semibold leading-tight ${
                                                        isCurrent ? 'text-blue-600' : isDone ? 'text-slate-900' : 'text-slate-400'
                                                    }`}
                                                >
                                                    {step.label}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Mobile vertical stepper */}
                            <div className="sm:hidden">
                                <div className="space-y-0">
                                    {stepLabels.map((step, index) => {
                                        const isDone = index < stepIdx;
                                        const isCurrent = index === stepIdx;
                                        return (
                                            <div key={step.key} className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                                            isDone || isCurrent
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-slate-100 text-slate-400'
                                                        }`}
                                                    >
                                                        {isDone ? '✓' : index + 1}
                                                    </div>
                                                    {index < stepLabels.length - 1 && (
                                                        <div className={`h-6 w-0.5 ${isDone ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                                    )}
                                                </div>
                                                <div className="pb-6">
                                                    <p
                                                        className={`text-sm font-semibold ${
                                                            isCurrent ? 'text-blue-600' : isDone ? 'text-slate-900' : 'text-slate-400'
                                                        }`}
                                                    >
                                                        {step.label}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Device Info */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-lg font-bold tracking-tight text-slate-950">Informasi Perangkat</h2>
                        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                                <InfoItem label="Model" value={`${service.brand ?? '-'} ${service.model ?? '-'}`} />
                                {service.device_name && <InfoItem label="Perangkat" value={service.device_name} />}
                                {service.serial_number && <InfoItem label="Serial Number" value={service.serial_number} mono />}
                                {service.kelengkapan && <InfoItem label="Kelengkapan" value={service.kelengkapan} />}
                                <InfoItem label="Keluhan" value={service.complaint ?? '-'} />
                                {service.initial_condition && (
                                    <InfoItem label="Kondisi Awal" value={service.initial_condition} />
                                )}
                            </div>

                            {parts.length > 0 && (
                                <div className="rounded-xl bg-slate-50 p-5">
                                    <h3 className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                        Sparepart Digunakan
                                    </h3>
                                    <ul className="mt-4 space-y-3">
                                        {parts.map((part) => (
                                            <li key={part.id} className="flex items-center justify-between gap-4 text-sm">
                                                <span className="text-slate-700">
                                                    {part.part_name ?? part.name ?? '-'}{' '}
                                                    <span className="text-xs text-slate-500">x{part.quantity}</span>
                                                </span>
                                                <span className="font-semibold text-slate-950">
                                                    {formatCurrency(part.selling_price ?? part.price ?? 0)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Repair Updates Timeline */}
                    {updates.length > 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="text-lg font-bold tracking-tight text-slate-950">Repair Updates</h2>
                            <div className="mt-6 space-y-5 border-l-2 border-slate-200 pl-6">
                                {updates.map((update) => (
                                    <div key={update.id} className="relative">
                                        <span className="absolute top-1.5 -left-[31px] h-3 w-3 rounded-full bg-blue-600 ring-4 ring-white" />
                                        <p className="text-sm font-semibold text-slate-950">
                                            {update.note ||
                                                update.description ||
                                                update.title ||
                                                `Status: ${update.new_status ?? update.status_to ?? '-'}`}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {new Date(update.created_at).toLocaleString('id-ID', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="mt-6 space-y-4 lg:mt-0">
                    {/* Summary */}
                    <div className="sticky top-24 space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-base font-bold tracking-tight text-slate-950">Ringkasan</h3>

                            {service.estimated_completion_date && (
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Estimasi Selesai</span>
                                    <span className="text-sm font-semibold text-slate-950">
                                        {formatDate(service.estimated_completion_date, {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            )}

                            <div className="mt-4 rounded-xl bg-slate-50 p-4">
                                <h4 className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                    Rincian Biaya
                                </h4>
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Biaya Diagnosa</span>
                                        <span className="font-semibold text-slate-900">{formatCurrency(diagnosisCost)}</span>
                                    </div>
                                    {parts.length > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">Sparepart + Pasang</span>
                                            <span className="font-semibold text-slate-900">{formatCurrency(partTotal)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                                <span className="text-sm font-bold text-slate-950">Total Estimasi</span>
                                <span className="text-lg font-bold text-blue-600">{formatCurrency(estimatedTotal)}</span>
                            </div>
                            <p className="mt-2 text-[11px] leading-5 text-slate-500">
                                Harga transparan berdasarkan diagnosa terkini. Anda akan diberi tahu jika ada perubahan.
                            </p>
                        </div>

                        <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
                        >
                            <ChatCircle className="h-4 w-4" weight="fill" />
                            Hubungi Teknisi
                        </a>

                        <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
                            <Download className="h-4 w-4" weight="duotone" />
                            Unduh Laporan Servis
                        </button>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-950">
                                <Question className="h-4 w-4 text-blue-600" weight="duotone" />
                                Butuh Bantuan?
                            </h4>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Punya pertanyaan tentang status perbaikan atau rincian biaya? Tim support kami siap membantu.
                            </p>
                            <a
                                href="/"
                                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Pusat Bantuan
                                <ArrowRight className="h-3 w-3" weight="bold" />
                            </a>
                        </div>
                    </div>
                </aside>
            </section>
        </PublicPage>
    );
}
