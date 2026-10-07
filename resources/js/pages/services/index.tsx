import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import DeleteDialog from '@/components/shared/delete-dialog';
import Reveal from '@/components/shared/reveal';
import StatusBadge from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatTanggal } from '@/lib/format';
import { dashboard } from '@/routes';
import type { Customer, Service, ServiceStatus } from '@/types';

type ServiceListItem = Service & {
    code?: string | null;
    customer?: Customer | null;
    status?: ServiceStatus | null;
    created_at?: string | null;
    received_date?: string | null;
};

interface Props {
    services: {
        data: ServiceListItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    filters: {
        search?: string;
        service_status_id?: string;
    };
    statuses: ServiceStatus[];
}

type HalamanComponent = ((props: Props) => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

function serviceCode(service: ServiceListItem) {
    return service.service_code ?? service.code ?? `SRV-${service.id}`;
}

function HapusServiceDialog({
    service,
    onClose,
}: {
    service: Service;
    onClose: () => void;
}) {
    // Gagal hapus (mis. servis selesai dilindungi audit) dikirim backend
    // sebagai flash toast error — dialog cukup ditutup.
    const handleDelete = () => {
        router.delete(`/services/${service.id}`, {
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
            title="Hapus service?"
            description={`Menghapus ${serviceCode(service)} dari sistem. Data yang sudah dihapus tidak dapat dikembalikan.`}
        />
    );
}

const ServicesIndex: HalamanComponent = ({ services, filters, statuses }) => {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusId, setStatusId] = useState(
        filters.service_status_id ?? 'all',
    );
    const [deleteService, setDeleteService] = useState<Service | null>(null);

    const applyFilters = () => {
        router.get(
            '/services',
            {
                search: search || undefined,
                service_status_id: statusId === 'all' ? undefined : statusId,
            },
            { preserveState: true, replace: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatusId('all');
        router.get('/services', {}, { preserveState: true, replace: true });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    return (
        <>
            <Head title="Servis" />
            <div className="flex flex-col gap-6 p-8">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Servis
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Kelola tiket dan perbaikan servis
                        </p>
                    </div>
                    <Button variant="primary" size="lg" asChild>
                        <Link href="/services/create">Servis Baru</Link>
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
                                placeholder="Cari kode service, pelanggan, atau perangkat..."
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
                        {services.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <h3 className="text-base font-semibold text-slate-900">
                                    Tidak ada service
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Sesuaikan filter atau buat service baru.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase"
                                                >
                                                    Kode Servis
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase"
                                                >
                                                    Pelanggan
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase"
                                                >
                                                    Perangkat
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase"
                                                >
                                                    Status
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase"
                                                >
                                                    Tanggal Diterima
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase"
                                                >
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {services.data.map((service) => (
                                                <tr
                                                    key={service.id}
                                                    className="transition-colors hover:bg-slate-50"
                                                >
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                        <Link
                                                            href={`/services/${service.id}`}
                                                            className="text-brand hover:text-brand-dark"
                                                        >
                                                            {serviceCode(
                                                                service,
                                                            )}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
                                                        {service.customer
                                                            ?.name ?? '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="font-medium text-slate-900">
                                                            {service.device_name ??
                                                                '-'}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {[
                                                                service.brand,
                                                                service.model,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(' ')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <StatusBadge
                                                            status={
                                                                service.status
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
                                                        {formatTanggal(
                                                            service.received_date ??
                                                                service.created_at,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                asChild
                                                                variant="default"
                                                                size="sm"
                                                            >
                                                                <Link
                                                                    href={`/services/${service.id}`}
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
                                                                    href={`/services/${service.id}/edit`}
                                                                >
                                                                    <Edit className="mr-1 size-4" />
                                                                    Edit
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setDeleteService(
                                                                        service,
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
                                            {services.from ?? 0}
                                        </span>
                                        -
                                        <span className="font-medium">
                                            {services.to ?? 0}
                                        </span>{' '}
                                        dari{' '}
                                        <span className="font-medium">
                                            {services.total}
                                        </span>{' '}
                                        service
                                    </div>
                                    <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                                        <Link
                                            href={
                                                services.current_page <= 1
                                                    ? '#'
                                                    : `/services?page=${Math.max(1, services.current_page - 1)}${search ? `&search=${encodeURIComponent(search)}` : ''}${statusId !== 'all' ? `&service_status_id=${statusId}` : ''}`
                                            }
                                            className={`relative inline-flex items-center rounded-l-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium ${
                                                services.current_page <= 1
                                                    ? 'cursor-not-allowed text-slate-300'
                                                    : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                            preserveState
                                        >
                                            Sebelumnya
                                        </Link>
                                        <span className="relative inline-flex items-center border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                                            {services.current_page} /{' '}
                                            {services.last_page}
                                        </span>
                                        <Link
                                            href={
                                                services.current_page >=
                                                services.last_page
                                                    ? '#'
                                                    : `/services?page=${Math.min(services.last_page, services.current_page + 1)}${search ? `&search=${encodeURIComponent(search)}` : ''}${statusId !== 'all' ? `&service_status_id=${statusId}` : ''}`
                                            }
                                            className={`relative inline-flex items-center rounded-r-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium ${
                                                services.current_page >=
                                                services.last_page
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

                {deleteService && (
                    <HapusServiceDialog
                        service={deleteService}
                        onClose={() => setDeleteService(null)}
                    />
                )}
            </div>
        </>
    );
};

ServicesIndex.layout = (page) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: dashboard() },
            { title: 'Servis', href: '/services' },
        ]}
    >
        {page}
    </AppLayout>
);

export default ServicesIndex;
