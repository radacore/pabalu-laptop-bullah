import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import DeleteDialog from '@/components/shared/delete-dialog';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { Customer as BaseCustomer, ModelUser } from '@/types';

type Customer = BaseCustomer & {
    phone: string;
    address: string | null;
    note: string | null;
    created_at: string | null;
    services_count: number;
    user?: Pick<ModelUser, 'id' | 'email'> | null;
};

interface Props {
    customers: {
        data: Customer[];
        current_page: number;
        last_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    filters: { search?: string };
}

type HalamanComponent = ((props: Props) => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

function customerInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function formatDate(value: string | null) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(
        new Date(value),
    );
}

function relativeTime(value: string | null) {
    if (!value) return '-';

    const seconds = Math.max(
        0,
        Math.floor((Date.now() - new Date(value).getTime()) / 1000),
    );
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} tahun lalu`;
    if (months > 0) return `${months} bulan lalu`;
    if (days > 0) return `${days} hari lalu`;
    if (hours > 0) return `${hours} jam lalu`;
    if (minutes > 0) return `${minutes} menit lalu`;

    return 'baru saja';
}

const PelanggansIndex: HalamanComponent = ({ customers, filters }) => {
    const [search, setSearch] = useState(filters.search ?? '');
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
        null,
    );

    function visitCustomers(page?: number) {
        router.get(
            '/customers',
            {
                search: search || undefined,
                page: page && page > 1 ? page : undefined,
            },
            { preserveState: true, replace: true },
        );
    }

    function applyFilters() {
        visitCustomers();
    }

    function clearFilters() {
        setSearch('');
        router.get('/customers', {}, { preserveState: true, replace: true });
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') applyFilters();
    }

    function confirmDelete() {
        if (!customerToDelete) return;

        router.delete(`/customers/${customerToDelete.id}`, {
            preserveState: true,
            replace: true,
            onFinish: () => {
                setCustomerToDelete(null);
            },
        });
    }

    return (
        <>
            <Head title="Pelanggan" />
            <div className="flex flex-col gap-6 p-8">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Pelanggan
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Kelola profil pelanggan dan riwayat service
                        </p>
                    </div>
                    <Link
                        href="/customers/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        <UserPlus className="size-4" />
                        Tambah Pelanggan
                    </Link>
                </div>

                <section className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="min-w-[300px] flex-1">
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Cari nama atau telepon..."
                            className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 leading-5 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        />
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
                    {customers.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <h3 className="text-base font-semibold text-slate-900">
                                Tidak ada pelanggan
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Sesuaikan filter atau tambah pelanggan baru.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Nama &amp; Kontak
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Alamat
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Total Service
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Pelanggan Sejak
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {customers.data.map((customer) => (
                                            <tr
                                                key={customer.id}
                                                className="transition-colors hover:bg-slate-50"
                                            >
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                                                            {customerInitials(
                                                                customer.name,
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <Link
                                                                href={`/customers/${customer.id}`}
                                                                className="text-sm font-semibold text-slate-900 transition-colors hover:text-blue-600"
                                                            >
                                                                {customer.name}
                                                            </Link>
                                                            <div className="mt-0.5 text-sm text-slate-500">
                                                                {customer.phone}
                                                            </div>
                                                            {customer.user?.email && (
                                                                <div className="mt-0.5 truncate text-sm text-slate-500">
                                                                    {
                                                                        customer
                                                                            .user
                                                                            .email
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <p className="line-clamp-2 text-sm text-slate-600">
                                                        {customer.address ?? '-'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-center align-top">
                                                    <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
                                                        {customer.services_count}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <div className="text-sm text-slate-900">
                                                        {formatDate(
                                                            customer.created_at,
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-slate-500">
                                                        {relativeTime(
                                                            customer.created_at,
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right align-top">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            asChild
                                                            variant="default"
                                                            size="sm"
                                                        >
                                                            <Link
                                                                href={`/customers/${customer.id}`}
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
                                                                href={`/customers/${customer.id}/edit`}
                                                            >
                                                                <Edit className="mr-1 size-4" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() =>
                                                                setCustomerToDelete(
                                                                    customer,
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

                            {customers.last_page > 1 && (
                                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
                                    <div className="text-sm text-slate-700">
                                        Menampilkan{' '}
                                        <span className="font-medium">
                                            {customers.from ?? 0}
                                        </span>
                                        -
                                        <span className="font-medium">
                                            {customers.to ?? 0}
                                        </span>{' '}
                                        dari{' '}
                                        <span className="font-medium">
                                            {customers.total}
                                        </span>{' '}
                                        pelanggan
                                    </div>
                                    <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                                        <Link
                                            href={
                                                customers.current_page <= 1
                                                    ? '#'
                                                    : `/customers?page=${Math.max(1, customers.current_page - 1)}${search ? `&search=${encodeURIComponent(search)}` : ''}`
                                            }
                                            className={`relative inline-flex items-center rounded-l-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium ${
                                                customers.current_page <= 1
                                                    ? 'cursor-not-allowed text-slate-300'
                                                    : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                            preserveState
                                        >
                                            Sebelumnya
                                        </Link>
                                        <span className="relative inline-flex items-center border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                                            {customers.current_page} /{' '}
                                            {customers.last_page}
                                        </span>
                                        <Link
                                            href={
                                                customers.current_page >=
                                                customers.last_page
                                                    ? '#'
                                                    : `/customers?page=${Math.min(customers.last_page, customers.current_page + 1)}${search ? `&search=${encodeURIComponent(search)}` : ''}`
                                            }
                                            className={`relative inline-flex items-center rounded-r-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium ${
                                                customers.current_page >=
                                                customers.last_page
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
                    open={customerToDelete !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setCustomerToDelete(null);
                        }
                    }}
                    onKonfirmasi={confirmDelete}
                    title="Hapus pelanggan?"
                    description={
                        customerToDelete
                            ? `Pelanggan ${customerToDelete.name} akan dihapus dan tidak bisa dikembalikan.`
                            : ''
                    }
                />
            </div>
        </>
    );
};

PelanggansIndex.layout = (page: ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Pelanggan', href: '/customers' }]}>
        {page}
    </AppLayout>
);

export default PelanggansIndex;
