import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Download,
    Edit,
    Eye,
    Plus,
    Wallet,
} from 'lucide-react';
import type { ReactNode } from 'react';
import AppLayout from '@/layouts/app-layout';
import { index as financialTransactionsIndex } from '@/routes/financial-transactions';
import type {
    FinancialTransaction,
    PaginatedResponse,
    TransactionCategory,
} from '@/types';

interface Props {
    transactions: PaginatedResponse<FinancialTransaction>;
    chart_transactions: CashflowTransaction[];
    filters: {
        search?: string;
        type?: string;
        from_date?: string;
        to_date?: string;
        transaction_category_id?: string;
    };
    summary: {
        total_income: number;
        total_expense: number;
        balance: number;
    };
    categories: TransactionCategory[];
}

type CashflowTransaction = {
    transaction_date: string;
    type: 'income' | 'expense';
    amount: number;
};

type FilterForm = {
    search: string;
    type: string;
    from_date: string;
    to_date: string;
    transaction_category_id: string;
};

type HalamanComponent = ((props: Props) => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

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

function formatCurrency(value: number) {
    return rupiahFormatter.format(Number(value ?? 0));
}

function formatCompact(value: number) {
    return compactRupiahFormatter.format(Number(value ?? 0));
}

function formatTanggal(value: string) {
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(
        new Date(value),
    );
}

function buildTransactionsHref(page: number, filters: Props['filters']) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
params.set(key, value);
}
    });

    if (page > 1) {
params.set('page', String(page));
}

    const query = params.toString();

    return query
        ? `/financial-transactions?${query}`
        : '/financial-transactions';
}

function buildPeriodLabel(filters: Props['filters']) {
    if (filters.from_date && filters.to_date) {
        return `${formatTanggal(filters.from_date)} – ${formatTanggal(filters.to_date)}`;
    }

    if (filters.from_date) {
return `Mulai ${formatTanggal(filters.from_date)}`;
}

    if (filters.to_date) {
return `Sampai ${formatTanggal(filters.to_date)}`;
}

    return 'Semua Periode';
}

function exportVisibleTransactions(transactions: FinancialTransaction[]) {
    const headers = [
        'Tanggal',
        'Kode',
        'Deskripsi',
        'Kategori',
        'Metode Pembayaran',
        'Tipe',
        'Jumlah',
    ];
    const rows = transactions.map((t) => [
        t.transaction_date,
        t.transaction_code,
        t.description ?? '',
        t.category?.name ?? '',
        t.paymentMethod?.name ?? '',
        t.type,
        String(Number(t.amount ?? 0)),
    ]);
    const csv = [headers, ...rows]
        .map((row) =>
            row
                .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
                .join(','),
        )
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'financial-transactions.csv';
    link.click();
    URL.revokeObjectURL(url);
}

function SummaryCard({
    title,
    value,
    tone,
    hint,
}: {
    title: string;
    value: number;
    tone: 'income' | 'expense' | 'balance';
    hint?: string;
}) {
    if (tone === 'balance') {
        const positive = value >= 0;

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
                    <p className="text-[11px] font-semibold tracking-wider text-white/60 uppercase">
                        {title}
                    </p>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                        <Wallet className="size-[18px] text-white" />
                    </div>
                </div>
                <p className="relative mt-3 text-[28px] leading-none font-extrabold tracking-tight">
                    {formatCurrency(value)}
                </p>
                <div className="relative mt-3 flex items-center gap-2 text-xs text-white/70">
                    <span
                        className={`inline-flex h-1.5 w-1.5 rounded-full ${
                            positive ? 'bg-emerald-400' : 'bg-rose-400'
                        } animate-pulse`}
                    />
                    <span>
                        {positive ? 'Cashflow positif' : 'Cashflow negatif'}
                    </span>
                </div>
            </div>
        );
    }

    const isIncome = tone === 'income';

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:border-slate-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between">
                <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                    {title}
                </p>
                <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        isIncome
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                    }`}
                >
                    {isIncome ? (
                        <ArrowUpRight className="size-[18px]" />
                    ) : (
                        <ArrowDownRight className="size-[18px]" />
                    )}
                </div>
            </div>
            <p
                className={`text-[28px] leading-none font-extrabold tracking-tight ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}
            >
                {formatCurrency(value)}
            </p>
            {hint && <p className="text-xs text-slate-500">{hint}</p>}
        </div>
    );
}

function CashflowChart({
    transactions,
}: {
    transactions: CashflowTransaction[];
}) {
    const buckets = new Map<string, { income: number; expense: number }>();
    transactions.forEach((t) => {
        const d = new Date(t.transaction_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const existing = buckets.get(key) ?? { income: 0, expense: 0 };

        if (t.type === 'income') {
existing.income += Number(t.amount ?? 0);
} else {
existing.expense += Number(t.amount ?? 0);
}

        buckets.set(key, existing);
    });

    const months = Array.from(buckets.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([key, value]) => {
            const [, m] = key.split('-');
            const label = new Intl.DateTimeFormat('id-ID', {
                month: 'short',
            }).format(new Date(2026, Number(m) - 1, 1));

            return { label, ...value };
        });

    if (months.length === 0) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 text-center">
                <p className="text-sm font-medium text-slate-900">
                    Belum ada data
                </p>
                <p className="text-xs text-slate-500">
                    Tambahkan transaksi untuk melihat tren.
                </p>
            </div>
        );
    }

    const max = Math.max(...months.flatMap((m) => [m.income, m.expense]), 1);
    const ticks = [max, max * 0.66, max * 0.33, 0];

    return (
        <div className="relative flex h-56 w-full sm:h-64">
            <div className="flex w-14 flex-col justify-between pr-3 pb-7 text-[10px] font-medium text-slate-400">
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
                <div className="relative z-10 flex h-[calc(100%-1.75rem)] items-end justify-between gap-3">
                    {months.map((m, i) => {
                        const iH = Math.max((m.income / max) * 100, 1);
                        const eH = Math.max((m.expense / max) * 100, 1);

                        return (
                            <div
                                key={i}
                                className="group flex h-full flex-1 flex-col items-center justify-end gap-1"
                            >
                                <div className="flex h-full w-full items-end justify-center gap-1">
                                    <div
                                        className="w-3 rounded-t-sm bg-emerald-500 transition-all group-hover:opacity-80 sm:w-4"
                                        style={{
                                            height: `${iH}%`,
                                            minHeight: '2px',
                                        }}
                                    />
                                    <div
                                        className="w-3 rounded-t-sm bg-rose-500 transition-all group-hover:opacity-80 sm:w-4"
                                        style={{
                                            height: `${eH}%`,
                                            minHeight: '2px',
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-2 flex justify-between gap-3 pt-2">
                    {months.map((m, i) => (
                        <span
                            key={i}
                            className="flex-1 text-center text-[10px] font-medium text-slate-400"
                        >
                            {m.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function CategoryBreakdownCard({
    transactions,
}: {
    transactions: FinancialTransaction[];
}) {
    const grouped = new Map<string, { income: number; expense: number }>();
    transactions.forEach((t) => {
        const name = t.category?.name ?? 'Tanpa Kategori';
        const existing = grouped.get(name) ?? { income: 0, expense: 0 };

        if (t.type === 'income') {
existing.income += Number(t.amount ?? 0);
} else {
existing.expense += Number(t.amount ?? 0);
}

        grouped.set(name, existing);
    });

    const items = Array.from(grouped.entries())
        .map(([name, v]) => ({
            name,
            total: v.income + v.expense,
            income: v.income,
            expense: v.expense,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    if (items.length === 0 || totalAmount === 0) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 text-center">
                <p className="text-sm font-medium text-slate-900">
                    Belum ada data
                </p>
                <p className="text-xs text-slate-500">
                    Kategori akan muncul setelah ada transaksi.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {items.map((item) => {
                const percentage = Math.round((item.total / totalAmount) * 100);
                const isIncome = item.income >= item.expense;

                return (
                    <div key={item.name}>
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-medium text-slate-900">
                                {item.name}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                                {percentage}%
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className={`h-full rounded-full ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                            {formatCurrency(item.total)}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

const FinancialTransactionsIndex: HalamanComponent = ({
    transactions,
    chart_transactions,
    filters,
    summary,
    categories,
}) => {
    const filterForm = useForm<FilterForm>({
        search: filters.search ?? '',
        type: filters.type ?? '',
        from_date: filters.from_date ?? '',
        to_date: filters.to_date ?? '',
        transaction_category_id: filters.transaction_category_id ?? '',
    });

    function submitFilters(event: { preventDefault: () => void }) {
        event.preventDefault();
        filterForm.get('/financial-transactions', {
            preserveState: true,
            replace: true,
        });
    }

    function clearFilters() {
        filterForm.setData({
            search: '',
            type: '',
            from_date: '',
            to_date: '',
            transaction_category_id: '',
        });
        router.get('/financial-transactions');
    }

    return (
        <>
            <Head title="Keuangan" />

            <div className="flex flex-col gap-6 p-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Keuangan
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Pantau kesehatan kas dan catatan transaksi Anda
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <button
                            type="button"
                            onClick={() =>
                                exportVisibleTransactions(transactions.data)
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            <Download className="size-3.5" />
                            Ekspor CSV
                        </button>
                        <Link
                            href="/financial-transactions/create"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                        >
                            <Plus className="size-4" />
                            Transaksi Baru
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <SummaryCard
                        title="Pemasukan"
                        value={summary.total_income}
                        tone="income"
                        hint="Akumulasi pemasukan dari filter aktif"
                    />
                    <SummaryCard
                        title="Pengeluaran"
                        value={summary.total_expense}
                        tone="expense"
                        hint="Akumulasi pengeluaran dari filter aktif"
                    />
                    <SummaryCard
                        title="Saldo (Net)"
                        value={summary.balance}
                        tone="balance"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <section className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Tren Arus Kas
                                </h3>
                                <p className="text-xs text-slate-500">
                                    6 bulan terakhir
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                                    <span className="font-medium text-slate-600">
                                        Pemasukan
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                                    <span className="font-medium text-slate-600">
                                        Pengeluaran
                                    </span>
                                </div>
                            </div>
                        </div>
                        <CashflowChart transactions={chart_transactions} />
                    </section>

                    <section className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-900">
                                Kategori
                            </h3>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                Top 5
                            </span>
                        </div>
                        <CategoryBreakdownCard
                            transactions={transactions.data}
                        />
                    </section>
                </div>

                <form
                    onSubmit={submitFilters}
                    className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200/60 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                >
                    <div className="grid min-w-44 flex-1 gap-1.5">
                        <label
                            htmlFor="ft-search"
                            className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
                        >
                            Cari
                        </label>
                        <input
                            id="ft-search"
                            type="text"
                            value={filterForm.data.search}
                            onChange={(e) =>
                                filterForm.setData('search', e.target.value)
                            }
                            placeholder="Cari kode, deskripsi..."
                            className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid min-w-40 gap-1.5">
                        <label
                            htmlFor="ft-type"
                            className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
                        >
                            Tipe
                        </label>
                        <div className="relative">
                            <select
                                id="ft-type"
                                value={filterForm.data.type}
                                onChange={(e) =>
                                    filterForm.setData('type', e.target.value)
                                }
                                className="block w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2 pr-9 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">Semua</option>
                                <option value="income">Pemasukan</option>
                                <option value="expense">Pengeluaran</option>
                            </select>
                            <svg
                                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M19 9l-7 7-7-7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="grid min-w-48 gap-1.5">
                        <label
                            htmlFor="ft-category"
                            className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
                        >
                            Kategori
                        </label>
                        <div className="relative">
                            <select
                                id="ft-category"
                                value={filterForm.data.transaction_category_id}
                                onChange={(e) =>
                                    filterForm.setData(
                                        'transaction_category_id',
                                        e.target.value,
                                    )
                                }
                                className="block w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2 pr-9 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">Semua kategori</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            <svg
                                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M19 9l-7 7-7-7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="grid w-full gap-1.5 sm:min-w-56">
                        <label className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                            Periode
                        </label>
                        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                            <input
                                type="date"
                                value={filterForm.data.from_date}
                                onChange={(e) =>
                                    filterForm.setData(
                                        'from_date',
                                        e.target.value,
                                    )
                                }
                                className="block w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                aria-label="Dari tanggal"
                            />
                            <span className="hidden text-xs text-slate-400 sm:inline">
                                →
                            </span>
                            <input
                                type="date"
                                value={filterForm.data.to_date}
                                onChange={(e) =>
                                    filterForm.setData(
                                        'to_date',
                                        e.target.value,
                                    )
                                }
                                className="block w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                aria-label="Sampai tanggal"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                        >
                            Filter
                        </button>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            Reset Filter
                        </button>
                    </div>
                </form>

                <section className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                                Daftar Transaksi
                            </h3>
                            <p className="text-xs text-slate-500">
                                {buildPeriodLabel(filters)} ·{' '}
                                {transactions.total} catatan
                            </p>
                        </div>
                    </div>

                    {transactions.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <Wallet className="size-6" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900">
                                Belum ada transaksi
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Sesuaikan filter atau buat transaksi baru.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase sm:px-6">
                                            Tanggal
                                        </th>
                                        <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase sm:px-6">
                                            Kode
                                        </th>
                                        <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase sm:px-6">
                                            Deskripsi
                                        </th>
                                        <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase sm:px-6">
                                            Kategori
                                        </th>
                                        <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase sm:px-6">
                                            Metode
                                        </th>
                                        <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase sm:px-6">
                                            Tipe
                                        </th>
                                        <th className="px-5 py-3 text-right text-[11px] font-semibold tracking-wider text-slate-500 uppercase sm:px-6">
                                            Jumlah
                                        </th>
                                        <th className="px-5 py-3 text-right text-[11px] font-semibold tracking-wider text-slate-500 uppercase sm:px-6">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {transactions.data.map((transaction) => {
                                        const isIncome =
                                            transaction.type === 'income';

                                        return (
                                            <tr
                                                key={transaction.id}
                                                className="transition-colors hover:bg-slate-50/50"
                                            >
                                                <td className="px-5 py-3.5 text-sm whitespace-nowrap text-slate-600 sm:px-6">
                                                    {formatTanggal(
                                                        transaction.transaction_date,
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 font-mono text-sm whitespace-nowrap text-slate-700 sm:px-6">
                                                    {
                                                        transaction.transaction_code
                                                    }
                                                </td>
                                                <td className="max-w-xs truncate px-5 py-3.5 text-sm text-slate-900 sm:px-6">
                                                    {transaction.description ??
                                                        '—'}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm whitespace-nowrap text-slate-600 sm:px-6">
                                                    {transaction.category
                                                        ?.name ?? '—'}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm whitespace-nowrap text-slate-600 sm:px-6">
                                                    {transaction.paymentMethod
                                                        ?.name ?? '—'}
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap sm:px-6">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                            isIncome
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : 'bg-rose-50 text-rose-700'
                                                        }`}
                                                    >
                                                        {isIncome ? (
                                                            <ArrowUpRight className="size-3" />
                                                        ) : (
                                                            <ArrowDownRight className="size-3" />
                                                        )}
                                                        {isIncome
                                                            ? 'Pemasukan'
                                                            : 'Pengeluaran'}
                                                    </span>
                                                </td>
                                                <td
                                                    className={`px-5 py-3.5 text-right text-sm font-bold whitespace-nowrap tabular-nums sm:px-6 ${
                                                        isIncome
                                                            ? 'text-emerald-700'
                                                            : 'text-rose-700'
                                                    }`}
                                                >
                                                    {isIncome ? '+' : '−'}{' '}
                                                    {formatCurrency(
                                                        Number(
                                                            transaction.amount ??
                                                                0,
                                                        ),
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-right whitespace-nowrap sm:px-6">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/financial-transactions/${transaction.id}`}
                                                            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                                                        >
                                                            <Eye className="size-3" />
                                                            Lihat
                                                        </Link>
                                                        <Link
                                                            href={`/financial-transactions/${transaction.id}/edit`}
                                                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                                                        >
                                                            <Edit className="size-3" />
                                                            Edit
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {transactions.last_page > 1 && (
                        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-xs text-slate-500">
                                Menampilkan {transactions.from ?? 0}–
                                {transactions.to ?? 0} dari {transactions.total}{' '}
                                transaksi
                            </p>
                            <div className="flex flex-wrap items-center gap-1">
                                {transactions.current_page > 1 && (
                                    <Link
                                        href={buildTransactionsHref(
                                            transactions.current_page - 1,
                                            filters,
                                        )}
                                        className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                    >
                                        Sebelumnya
                                    </Link>
                                )}
                                {Array.from(
                                    new Set(
                                        [
                                            1,
                                            transactions.current_page - 1,
                                            transactions.current_page,
                                            transactions.current_page + 1,
                                            transactions.last_page,
                                        ].filter(
                                            (p) =>
                                                p >= 1 &&
                                                p <= transactions.last_page,
                                        ),
                                    ),
                                ).map((page) =>
                                    page === transactions.current_page ? (
                                        <span
                                            key={page}
                                            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                                        >
                                            {page}
                                        </span>
                                    ) : (
                                        <Link
                                            key={page}
                                            href={buildTransactionsHref(
                                                page,
                                                filters,
                                            )}
                                            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                        >
                                            {page}
                                        </Link>
                                    ),
                                )}
                                {transactions.current_page <
                                    transactions.last_page && (
                                    <Link
                                        href={buildTransactionsHref(
                                            transactions.current_page + 1,
                                            filters,
                                        )}
                                        className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                    >
                                        Selanjutnya
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
};

FinancialTransactionsIndex.layout = (page: ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/' },
            { title: 'Keuangan', href: financialTransactionsIndex() },
        ]}
    >
        {page}
    </AppLayout>
);

export default FinancialTransactionsIndex;
