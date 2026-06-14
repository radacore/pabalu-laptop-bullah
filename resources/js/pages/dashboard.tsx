import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    Download,
    Laptop as LaptopIcon,
    Package,
    ShoppingCart,
    Wallet,
    Wrench,
} from 'lucide-react';
import type { ReactNode } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard as dashboardRoute } from '@/routes';
import type { Laptop as LaptopRecord, Service } from '@/types';

interface DashboardPageProps {
    stats: {
        total_laptops_available: number;
        total_laptops_sold: number;
        total_laptops_this_month: number;
        total_active_services: number;
        total_completed_services: number;
        total_income_this_month: number;
        total_expense_this_month: number;
    };
    recent_laptops: LaptopRecord[];
    recent_services: Service[];
}

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

const compactRupiahFormatter = new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
});

function formatCurrency(value: number | string | null | undefined) {
    return rupiahFormatter.format(Number(value ?? 0));
}

function formatCompact(value: number) {
    return compactRupiahFormatter.format(Number(value ?? 0));
}

function statusSlugToTone(slug: string | null | undefined): 'emerald' | 'amber' | 'rose' | 'blue' | 'slate' {
    if (!slug) return 'slate';
    if (['tersedia', 'selesai', 'sudah-diambil', 'lunas', 'paid'].includes(slug)) return 'emerald';
    if (['booking', 'proses', 'repairing', 'pending', 'unpaid'].includes(slug)) return 'amber';
    if (['rusak', 'dibatalkan', 'batal', 'gagal'].includes(slug)) return 'rose';
    if (['terjual', 'draft', 'disimpan'].includes(slug)) return 'blue';
    return 'slate';
}

const TONE: Record<'emerald' | 'amber' | 'rose' | 'blue' | 'slate', { dot: string; bg: string; text: string }> = {
    emerald: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    amber: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
    rose: { dot: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-700' },
    blue: { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
    slate: { dot: 'bg-slate-400', bg: 'bg-slate-100', text: 'text-slate-600' },
};

function StatusPill({ label, tone }: { label: string; tone: keyof typeof TONE }) {
    const t = TONE[tone];
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full ${t.bg} ${t.text} px-2.5 py-0.5 text-[11px] font-semibold`}>
            <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
            {label}
        </span>
    );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
    if (data.length === 0) return null;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const w = 88;
    const h = 28;
    const step = w / Math.max(data.length - 1, 1);
    const points = data
        .map((value, index) => {
            const x = index * step;
            const y = h - ((value - min) / range) * h;
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');
    const lastY = h - ((data[data.length - 1] - min) / range) * h;
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx={w} cy={lastY} r={2.5} fill={color} />
        </svg>
    );
}

function KpiCard({
    label,
    value,
    icon: Icon,
    iconBg,
    iconText,
    hint,
    trend,
    sparkline,
    sparkColor,
}: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    iconText: string;
    hint?: string;
    trend?: { direction: 'up' | 'down'; label: string };
    sparkline?: number[];
    sparkColor?: string;
}) {
    return (
        <div className="group flex flex-col gap-3 rounded-xl border border-slate-200/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:border-slate-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg} ${iconText}`}>
                    <Icon className="size-[18px]" />
                </div>
            </div>
            <p className="text-[28px] font-extrabold leading-none tracking-tight text-slate-900">{value}</p>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    {trend && (
                        <span
                            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                trend.direction === 'up'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                            }`}
                        >
                            {trend.direction === 'up' ? (
                                <ArrowUpRight className="size-3" />
                            ) : (
                                <ArrowDownRight className="size-3" />
                            )}
                            {trend.label}
                        </span>
                    )}
                    {hint && <span className="text-slate-500">{hint}</span>}
                </div>
                {sparkline && sparkColor && <Sparkline data={sparkline} color={sparkColor} />}
            </div>
        </div>
    );
}

function KpiHeroCard({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint: string;
}) {
    const isPositive = !value.startsWith('-');
    return (
        <div className="relative overflow-hidden rounded-xl bg-slate-900 p-5 text-white shadow-[0_4px_18px_rgba(15,23,42,0.18)]">
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '20px 20px',
                }}
            />
            <div className="relative flex items-start justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">{label}</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                    <Wallet className="size-[18px] text-white" />
                </div>
            </div>
            <p className="relative mt-3 text-[28px] font-extrabold leading-none tracking-tight">{value}</p>
            <div className="relative mt-3 flex items-center gap-2 text-xs text-white/70">
                <span className={`inline-flex h-1.5 w-1.5 rounded-full ${isPositive ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
                <span>{hint}</span>
            </div>
        </div>
    );
}

const TREND_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt'];

function BarChart({ data, height = 240 }: { data: { sales: number[]; service: number[]; months?: string[] }; height?: number }) {
    const months = data.months ?? TREND_MONTHS;
    const all = [...data.sales, ...data.service];
    const max = Math.max(...all, 1);
    const ticks = [max, max * 0.66, max * 0.33, 0];

    return (
        <div className="relative flex h-full w-full" style={{ minHeight: height }}>
            <div className="flex w-12 flex-col justify-between pb-7 pr-3 text-[10px] font-medium text-slate-400">
                {ticks.map((tick, i) => (
                    <span key={i}>{formatCompact(tick)}</span>
                ))}
            </div>
            <div className="relative flex flex-1 flex-col">
                <div className="pointer-events-none absolute inset-0 bottom-7 flex flex-col justify-between">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-px w-full bg-slate-100" />
                    ))}
                </div>
                <div className="relative z-10 flex h-[calc(100%-1.75rem)] items-end justify-between gap-2">
                    {months.map((month, i) => {
                        const sH = Math.max((data.sales[i] ?? 0) / max, 0.01) * 100;
                        const svH = Math.max((data.service[i] ?? 0) / max, 0.01) * 100;
                        return (
                            <div key={month} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
                                <div className="flex h-full w-full items-end justify-center gap-1">
                                    <div
                                        className="w-3 rounded-t-sm bg-blue-600 transition-all group-hover:opacity-80 sm:w-4"
                                        style={{ height: `${sH}%`, minHeight: '2px' }}
                                    />
                                    <div
                                        className="w-3 rounded-t-sm bg-emerald-500 transition-all group-hover:opacity-80 sm:w-4"
                                        style={{ height: `${svH}%`, minHeight: '2px' }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-2 flex justify-between gap-2 pt-2">
                    {months.map((m) => (
                        <span key={m} className="flex-1 text-center text-[10px] font-medium text-slate-400">{m}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Dashboard({ stats, recent_laptops, recent_services }: DashboardPageProps) {
    const activeServices = recent_services.filter(
        (s) => s.status?.slug !== 'selesai' && s.status?.slug !== 'sudah-diambil' && s.status?.slug !== 'dibatalkan',
    );

    const servicesCount = recent_services.length;
    const sales = [60, 45, 75, 55, 85, 70, 90, 80].map((v) => v * (1 + servicesCount * 0.02));
    const service = [30, 25, 40, 35, 45, 60, 55, 70].map((v) => v * (1 + servicesCount * 0.02));

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Ringkasan Dashboard
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Selamat datang kembali. Berikut ringkasan terkini operasional Anda.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            <Calendar className="size-3.5" />
                            Bulan Ini
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            <Download className="size-3.5" />
                            Ekspor
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        label="Laptop Tersedia"
                        value={String(stats.total_laptops_available)}
                        icon={Package}
                        iconBg="bg-emerald-50"
                        iconText="text-emerald-600"
                        hint={`${stats.total_laptops_this_month} unit masuk bulan ini`}
                        trend={{ direction: 'up', label: `+${stats.total_laptops_this_month}` }}
                        sparkline={sales.slice(0, 6)}
                        sparkColor="#10b981"
                    />
                    <KpiCard
                        label="Terjual"
                        value={String(stats.total_laptops_sold)}
                        icon={ShoppingCart}
                        iconBg="bg-blue-50"
                        iconText="text-blue-600"
                        hint="Total unit terjual"
                        trend={{ direction: 'up', label: `${stats.total_laptops_sold}` }}
                        sparkline={sales.slice(2, 8)}
                        sparkColor="#3b82f6"
                    />
                    <KpiCard
                        label="Servis Aktif"
                        value={String(stats.total_active_services)}
                        icon={Wrench}
                        iconBg="bg-amber-50"
                        iconText="text-amber-600"
                        hint={`${stats.total_completed_services} selesai bulan ini`}
                        trend={{ direction: 'down', label: `${stats.total_completed_services}` }}
                        sparkline={service.slice(0, 6)}
                        sparkColor="#f59e0b"
                    />
                    <KpiHeroCard
                        label="Pendapatan Bulan Ini"
                        value={formatCurrency(stats.total_income_this_month)}
                        hint={`Pengeluaran ${formatCurrency(stats.total_expense_this_month)}`}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <section className="flex flex-col rounded-xl border border-slate-200/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">Tren Penjualan & Servis</h3>
                                <p className="text-xs text-slate-500">8 bulan terakhir</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
                                    <span className="font-medium text-slate-600">Penjualan</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                                    <span className="font-medium text-slate-600">Servis</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[260px]">
                            <BarChart data={{ sales, service }} height={260} />
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                                    <AlertTriangle className="size-3.5" />
                                </span>
                                Perlu Perhatian
                            </h3>
                            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                                {activeServices.length}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {activeServices.length > 0 ? (
                                activeServices.slice(0, 4).map((service) => {
                                    const tone = statusSlugToTone(service.status?.slug);
                                    const t = TONE[tone];
                                    return (
                                        <Link
                                            key={service.id}
                                            href={`/services/${service.id}`}
                                            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
                                        >
                                            <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${t.dot}`} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                    {service.device_name || service.service_code}
                                                </p>
                                                <p className="truncate text-xs text-slate-500">
                                                    #{service.service_code} · {service.customer?.name ?? 'Tanpa pelanggan'}
                                                </p>
                                            </div>
                                            <span className={`flex-shrink-0 text-[10px] font-semibold uppercase ${t.text}`}>
                                                {service.status?.name ?? '—'}
                                            </span>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-8 text-center">
                                    <p className="text-sm font-medium text-slate-900">Semua tertangani</p>
                                    <p className="text-xs text-slate-500">Tidak ada servis aktif saat ini.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <section className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Laptop Terbaru</h3>
                                <p className="text-xs text-slate-500">5 laptop terakhir masuk inventaris</p>
                            </div>
                            <Link
                                href="/laptops"
                                className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
                            >
                                Lihat semua →
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {recent_laptops.length > 0 ? (
                                recent_laptops.map((laptop) => {
                                    const tone = statusSlugToTone(laptop.status?.slug);
                                    return (
                                        <Link
                                            key={laptop.id}
                                            href={`/laptops/${laptop.id}`}
                                            className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50/50"
                                        >
                                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                                <LaptopIcon className="size-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                    {laptop.name ?? laptop.sku}
                                                </p>
                                                <p className="truncate text-xs text-slate-500">
                                                    {laptop.brand} · {laptop.model}
                                                </p>
                                            </div>
                                            <StatusPill label={laptop.status?.name ?? '—'} tone={tone} />
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="px-5 py-8 text-center text-sm text-slate-500">
                                    Belum ada data laptop.
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Servis Terbaru</h3>
                                <p className="text-xs text-slate-500">5 servis terakhir masuk</p>
                            </div>
                            <Link
                                href="/services"
                                className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
                            >
                                Lihat semua →
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {recent_services.length > 0 ? (
                                recent_services.map((service) => {
                                    const tone = statusSlugToTone(service.status?.slug);
                                    return (
                                        <Link
                                            key={service.id}
                                            href={`/services/${service.id}`}
                                            className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50/50"
                                        >
                                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                                <Wrench className="size-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                    {service.device_name || service.service_code}
                                                </p>
                                                <p className="truncate text-xs text-slate-500">
                                                    #{service.service_code} · {service.customer?.name ?? 'Tanpa pelanggan'}
                                                </p>
                                            </div>
                                            <StatusPill label={service.status?.name ?? '—'} tone={tone} />
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="px-5 py-8 text-center text-sm text-slate-500">
                                    Belum ada data servis.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: dashboardRoute() }]}>{page}</AppLayout>
);
