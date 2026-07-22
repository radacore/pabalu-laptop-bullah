import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import DeleteDialog from '@/components/shared/delete-dialog';
import StatusBadge from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { Customer, Service, ServiceStatus, User } from '@/types';

type ServiceListItem = Service & {
    code?: string | null;
    customer?: Customer | null;
    status?: ServiceStatus | null;
    technician?: User | null;
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
        technician_id?: string;
    };
    statuses: ServiceStatus[];
    technicians: User[];
}

type HalamanComponent = ((props: Props) => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

function formatTanggal(value?: string | null) {
    if (!value) {
return '-';
}

    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(
        new Date(value),
    );
}

function truncate(value?: string | null, limit = 72) {
    if (!value) {
return '-';
}

    return value.length > limit ? `${value.slice(0, limit)}...` : value;
}

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
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/services/${service.id}`, {
            preserveState: true,
            replace: true,
            onFinish: () => {
                setDeleting(false);
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

const ServicesIndex: HalamanComponent = ({
    services,
    filters,
    statuses,
    technicians,
}) => {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusId, setStatusId] = useState(
        filters.service_status_id ?? 'all',
    );
    const [technicianId, setTeknisiId] = useState(
        filters.technician_id ?? 'all',
    );
    const [deleteService, setDeleteService] = useState<Service | null>(null);

    const applyFilters = () => {
        router.get(
            '/services',
            {
                search: search || undefined,
                service_status_id: statusId === 'all' ? undefined : statusId,
                technician_id:
                    technicianId === 'all' ? undefined : technicianId,
            },
            { preserveState: true, replace: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatusId('all');
        setTeknisiId('all');
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
                            Manage service requests &amp; repairs
                        </p>
                    </div>
                    <Link
                        href="/services/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        Servis Baru
                    </Link>
                </div>

                <section className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="min-w-[300px] flex-1">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Cari kode service, pelanggan, atau perangkat..."
                            className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 leading-5 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm"
                        />
                    </div>
                    <div className="relative w-56">
                        <select
                            value={statusId}
                            onChange={(e) => setStatusId(e.target.value)}
                            className="block w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pr-10 pl-4 text-base text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm"
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
                    <div className="relative w-56">
                        <select
                            value={technicianId}
                            onChange={(e) => setTeknisiId(e.target.value)}
                            className="block w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pr-10 pl-4 text-base text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm"
                        >
                            <option value="all">Semua teknisi</option>
                            {technicians.map((t) => (
                                <option key={t.id} value={String(t.id)}>
                                    {t.name}
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
                                                Keluhan
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase"
                                            >
                                                Teknisi
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
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        {serviceCode(service)}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
                                                    {service.customer?.name ??
                                                        '-'}
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
                                                <td className="max-w-xs truncate px-6 py-4 text-sm text-slate-600">
                                                    {truncate(
                                                        service.complaint,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
                                                    {service.technician?.name ??
                                                        '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge
                                                        status={service.status}
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
                                                : `/services?page=${Math.max(1, services.current_page - 1)}`
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
                                                : `/services?page=${Math.min(services.last_page, services.current_page + 1)}`
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
    <AppLayout breadcrumbs={[{ title: 'Servis', href: '/services' }]}>
        {page}
    </AppLayout>
);

export default ServicesIndex;
