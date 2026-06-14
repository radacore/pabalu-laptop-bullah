import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import DeleteDialog from '@/components/shared/delete-dialog';
import StatusBadge from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type {
    Laptop,
    LaptopSource,
    LaptopStatus,
    PaginatedResponse,
} from '@/types';

interface LaptopsIndexHalamanProps {
    laptops: PaginatedResponse<Laptop>;
    filters: {
        search?: string;
        laptop_status_id?: string;
        laptop_source_id?: string;
    };
    statuses: LaptopStatus[];
    sources: LaptopSource[];
}

type HalamanComponent = ((props: LaptopsIndexHalamanProps) => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

function formatCurrency(value: number | string | null | undefined) {
    return currencyFormatter.format(Number(value ?? 0));
}

function buildLaptopsUrl(
    page: number,
    filters: LaptopsIndexHalamanProps['filters'],
) {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.laptop_status_id)
        params.set('laptop_status_id', filters.laptop_status_id);
    if (filters.laptop_source_id)
        params.set('laptop_source_id', filters.laptop_source_id);
    if (page > 1) params.set('page', String(page));

    const query = params.toString();

    return query ? `/laptops?${query}` : '/laptops';
}

const LaptopsIndex: HalamanComponent = ({
    laptops,
    filters,
    statuses,
    sources,
}) => {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusId, setStatusId] = useState(filters.laptop_status_id ?? 'all');
    const [sourceId, setSourceId] = useState(filters.laptop_source_id ?? 'all');
    const [toDelete, setToDelete] = useState<Laptop | null>(null);

    function applyFilters() {
        router.get(
            '/laptops',
            {
                search: search || undefined,
                laptop_status_id: statusId === 'all' ? undefined : statusId,
                laptop_source_id: sourceId === 'all' ? undefined : sourceId,
            },
            { preserveState: true, replace: true },
        );
    }

    function clearFilters() {
        setSearch('');
        setStatusId('all');
        setSourceId('all');
        router.get('/laptops', {}, { preserveState: true, replace: true });
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') applyFilters();
    }

    function deleteLaptop() {
        if (!toDelete) {
            return;
        }
        router.delete(`/laptops/${toDelete.id}`);
        setToDelete(null);
    }

    return (
        <>
            <Head title="Inventaris" />
            <div className="flex flex-col gap-6 p-8">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Inventaris
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Kelola stok laptop Anda
                        </p>
                    </div>
                    <Link
                        href="/laptops/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        <Plus className="size-4" />
                        Tambah Laptop
                    </Link>
                </div>

                <section className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="min-w-[300px] flex-1">
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Cari nama, merek, model, atau SKU..."
                            className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 leading-5 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="relative w-56">
                        <select
                            value={statusId}
                            onChange={(event) => setStatusId(event.target.value)}
                            className="block w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-base text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        >
                            <option value="all">Semua status</option>
                            {statuses.map((status) => (
                                <option key={status.id} value={String(status.id)}>
                                    {status.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                            <svg
                                className="h-4 w-4"
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
                    <div className="relative w-56">
                        <select
                            value={sourceId}
                            onChange={(event) => setSourceId(event.target.value)}
                            className="block w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-base text-slate-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        >
                            <option value="all">Semua sumber</option>
                            {sources.map((source) => (
                                <option key={source.id} value={String(source.id)}>
                                    {source.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                            <svg
                                className="h-4 w-4"
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
                    <button
                        type="button"
                        onClick={applyFilters}
                        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        Filter
                    </button>
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Reset Filter
                    </button>
                </section>

                <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {laptops.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <h3 className="text-base font-semibold text-slate-900">
                                Tidak ada laptop
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Sesuaikan filter atau tambah laptop baru.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                SKU
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Nama
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Merek
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Model
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Sumber
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Harga Modal
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Harga Jual
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {laptops.data.map((laptop) => (
                                            <tr
                                                key={laptop.id}
                                                className="transition-colors hover:bg-slate-50"
                                            >
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                    <Link
                                                        href={`/laptops/${laptop.id}`}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        {laptop.sku}
                                                    </Link>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                                    {laptop.name ?? '-'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                                    {laptop.brand}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {laptop.model}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <StatusBadge
                                                        status={laptop.status}
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                                    {laptop.source?.name ?? '-'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-slate-900">
                                                    {formatCurrency(
                                                        laptop.cost_price,
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-slate-900">
                                                    {formatCurrency(
                                                        laptop.selling_price,
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            asChild
                                                            variant="default"
                                                            size="sm"
                                                        >
                                                            <Link
                                                                href={`/laptops/${laptop.id}`}
                                                            >
                                                                <Eye className="mr-1 size-4" />
                                                                Lihat
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            asChild
                                                            variant="success"
                                                            size="sm"
                                                        >
                                                            <Link
                                                                href={`/laptops/${laptop.id}/edit`}
                                                            >
                                                                <Edit className="mr-1 size-4" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() =>
                                                                setToDelete(laptop)
                                                            }
                                                        >
                                                            <Trash2 className="mr-1 size-4" />
                                                            Hapus
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {laptops.last_page > 1 && (
                                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
                                    <div className="text-sm text-slate-700">
                                        Menampilkan{' '}
                                        <span className="font-medium">
                                            {laptops.from ?? 0}
                                        </span>
                                        -
                                        <span className="font-medium">
                                            {laptops.to ?? 0}
                                        </span>{' '}
                                        dari{' '}
                                        <span className="font-medium">
                                            {laptops.total}
                                        </span>{' '}
                                        laptop
                                    </div>
                                    <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                                        <Link
                                            href={buildLaptopsUrl(
                                                Math.max(1, laptops.current_page - 1),
                                                filters,
                                            )}
                                            className={`relative inline-flex items-center rounded-l-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium ${
                                                laptops.current_page <= 1
                                                    ? 'cursor-not-allowed text-slate-300'
                                                    : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                            preserveState
                                        >
                                            Sebelumnya
                                        </Link>
                                        <span className="relative inline-flex items-center border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                                            {laptops.current_page} /{' '}
                                            {laptops.last_page}
                                        </span>
                                        <Link
                                            href={buildLaptopsUrl(
                                                Math.min(
                                                    laptops.last_page,
                                                    laptops.current_page + 1,
                                                ),
                                                filters,
                                            )}
                                            className={`relative inline-flex items-center rounded-r-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium ${
                                                laptops.current_page >=
                                                laptops.last_page
                                                    ? 'cursor-not-allowed text-slate-300'
                                                    : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                            preserveState
                                        >
                                            Selanjutnya
                                        </Link>
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </section>

                <DeleteDialog
                    open={toDelete !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setToDelete(null);
                        }
                    }}
                    onKonfirmasi={deleteLaptop}
                    title="Hapus Laptop?"
                    description={
                        toDelete
                            ? `Aksi ini tidak dapat dibatalkan. Laptop ${toDelete.name ?? toDelete.sku} akan dihapus dari inventaris.`
                            : ''
                    }
                />
            </div>
        </>
    );
};

LaptopsIndex.layout = (page) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: dashboard() },
            { title: 'Inventaris', href: '/laptops' },
        ]}
    >
        {page}
    </AppLayout>
);

export default LaptopsIndex;
