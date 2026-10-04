import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import DeleteDialog from '@/components/shared/delete-dialog';
import Reveal from '@/components/shared/reveal';
import StatusBadge from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatTanggal } from '@/lib/format';
import type { PaginatedResponse, Rental, RentalStatus } from '@/types';

interface Props {
    rentals: PaginatedResponse<Rental>;
    filters: {
        search?: string;
        rental_status_id?: string;
    };
    statuses: RentalStatus[];
}

type HalamanComponent = ((props: Props) => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

function HapusRentalDialog({
    rental,
    onClose,
}: {
    rental: Rental;
    onClose: () => void;
}) {
    // Gagal hapus (mis. sewa masih aktif) dikirim backend sebagai flash
    // toast error — dialog cukup ditutup, pesan tampil global via toaster.
    const handleDelete = () => {
        router.delete(`/rentals/${rental.id}`, {
            preserveState: true,
            replace: true,
            onFinish: () => {
                onClose();
            },
        });
    };

    return (
        <DeleteDialog
            open
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            onKonfirmasi={handleDelete}
            title="Hapus penyewaan?"
            description={`Menghapus ${rental.rental_code} dari sistem. Data yang sudah dihapus tidak dapat dikembalikan.`}
        />
    );
}

const RentalsIndex: HalamanComponent = ({ rentals, filters, statuses }) => {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusId, setStatusId] = useState(filters.rental_status_id ?? 'all');
    const [deleteRental, setDeleteRental] = useState<Rental | null>(null);

    const applyFilters = () => {
        router.get(
            '/rentals',
            {
                search: search || undefined,
                rental_status_id: statusId === 'all' ? undefined : statusId,
            },
            { preserveState: true, replace: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatusId('all');
        router.get('/rentals', {}, { preserveState: true, replace: true });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    return (
        <>
            <Head title="Penyewaan" />
            <div className="flex flex-col gap-6 p-8">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Penyewaan
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Kelola penyewaan unit laptop
                        </p>
                    </div>
                    <Button variant="primary" size="lg" asChild>
                        <Link href="/rentals/create">Sewa Baru</Link>
                    </Button>
                </div>

                <Reveal tone="admin">
                    <section className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="min-w-[300px] flex-1">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Cari kode sewa, pelanggan, atau unit..."
                                className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 leading-5 placeholder-slate-400 transition-colors focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand focus:outline-none sm:text-sm"
                            />
                        </div>
                        <div className="relative w-56">
                            <select
                                value={statusId}
                                onChange={(e) => setStatusId(e.target.value)}
                                className="block w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pr-10 pl-4 text-base text-slate-700 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none sm:text-sm"
                            >
                                <option value="all">Semua status</option>
                                {statuses.map((s) => (
                                    <option key={s.id} value={String(s.id)}>
                                        {s.name}
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
                        <Button
                            type="button"
                            variant="primary"
                            size="lg"
                            onClick={applyFilters}
                        >
                            Filter
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={clearFilters}
                        >
                            Reset Filter
                        </Button>
                    </section>
                </Reveal>

                <Reveal tone="admin" delay={80}>
                    <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        {rentals.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <h3 className="text-base font-semibold text-slate-900">
                                    Tidak ada penyewaan
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Sesuaikan filter atau buat penyewaan baru.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <Th>Kode Sewa</Th>
                                                <Th>Pelanggan</Th>
                                                <Th>Unit</Th>
                                                <Th>Tarif / Hari</Th>
                                                <Th>Jatuh Tempo</Th>
                                                <Th>Status</Th>
                                                <Th align="right">Aksi</Th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {rentals.data.map((rental) => (
                                                <tr
                                                    key={rental.id}
                                                    className="transition-colors hover:bg-slate-50"
                                                >
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                        <Link
                                                            href={`/rentals/${rental.id}`}
                                                            className="text-brand hover:text-brand-dark"
                                                        >
                                                            {rental.rental_code}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
                                                        {rental.customer
                                                            ?.name ?? '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="font-medium text-slate-900">
                                                            {rental.laptop
                                                                ?.brand?.name ??
                                                                ''}
                                                            {rental.laptop
                                                                ?.model ??
                                                                rental.laptop
                                                                    ?.name ??
                                                                '-'}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {rental.laptop
                                                                ?.sku ?? ''}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
                                                        {formatCurrency(
                                                            rental.daily_rate,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
                                                        {formatTanggal(
                                                            rental.due_at,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <StatusBadge
                                                            status={
                                                                rental.status
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                asChild
                                                                variant="default"
                                                                size="sm"
                                                            >
                                                                <Link
                                                                    href={`/rentals/${rental.id}`}
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
                                                                    href={`/rentals/${rental.id}/edit`}
                                                                >
                                                                    <Edit className="mr-1 size-4" />
                                                                    Edit
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setDeleteRental(
                                                                        rental,
                                                                    )
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

                                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
                                    <div className="text-sm text-slate-700">
                                        Menampilkan{' '}
                                        <span className="font-medium">
                                            {rentals.from ?? 0}
                                        </span>{' '}
                                        -{' '}
                                        <span className="font-medium">
                                            {rentals.to ?? 0}
                                        </span>{' '}
                                        dari{' '}
                                        <span className="font-medium">
                                            {rentals.total}
                                        </span>{' '}
                                        penyewaan
                                    </div>
                                    <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                                        <Link
                                            href={
                                                rentals.current_page <= 1
                                                    ? '#'
                                                    : `/rentals?page=${Math.max(1, rentals.current_page - 1)}${search ? `&search=${encodeURIComponent(search)}` : ''}${statusId !== 'all' ? `&rental_status_id=${statusId}` : ''}`
                                            }
                                            className={`relative inline-flex items-center rounded-l-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium ${
                                                rentals.current_page <= 1
                                                    ? 'cursor-not-allowed text-slate-300'
                                                    : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                            preserveState
                                        >
                                            Sebelumnya
                                        </Link>
                                        <span className="relative inline-flex items-center border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                                            {rentals.current_page} /{' '}
                                            {rentals.last_page}
                                        </span>
                                        <Link
                                            href={
                                                rentals.current_page >=
                                                rentals.last_page
                                                    ? '#'
                                                    : `/rentals?page=${Math.min(rentals.last_page, rentals.current_page + 1)}${search ? `&search=${encodeURIComponent(search)}` : ''}${statusId !== 'all' ? `&rental_status_id=${statusId}` : ''}`
                                            }
                                            className={`relative inline-flex items-center rounded-r-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium ${
                                                rentals.current_page >=
                                                rentals.last_page
                                                    ? 'cursor-not-allowed text-slate-300'
                                                    : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                            preserveState
                                        >
                                            Selanjutnya
                                        </Link>
                                    </nav>
                                </div>
                            </>
                        )}
                    </section>
                </Reveal>

                {deleteRental && (
                    <HapusRentalDialog
                        rental={deleteRental}
                        onClose={() => setDeleteRental(null)}
                    />
                )}
            </div>
        </>
    );
};

function Th({
    children,
    align = 'left',
}: {
    children: React.ReactNode;
    align?: 'left' | 'right';
}) {
    return (
        <th
            scope="col"
            className={`px-6 py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase ${
                align === 'right' ? 'text-right' : 'text-left'
            }`}
        >
            {children}
        </th>
    );
}

RentalsIndex.layout = (page) => (
    <AppLayout breadcrumbs={[{ title: 'Penyewaan', href: '/rentals' }]}>
        {page}
    </AppLayout>
);

export default RentalsIndex;
