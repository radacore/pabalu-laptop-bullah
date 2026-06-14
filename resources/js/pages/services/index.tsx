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
    filters: { search?: string; service_status_id?: string; technician_id?: string };
    statuses: ServiceStatus[];
    technicians: User[];
}

type HalamanComponent = ((props: Props) => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

function formatTanggal(value?: string | null) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value));
}

function truncate(value?: string | null, limit = 72) {
    if (!value) return '-';
    return value.length > limit ? `${value.slice(0, limit)}...` : value;
}

function serviceCode(service: ServiceListItem) {
    return service.service_code ?? service.code ?? `SRV-${service.id}`;
}

function HapusServiceDialog({ service, onClose }: { service: Service; onClose: () => void }) {
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

const ServicesIndex: HalamanComponent = ({ services, filters, statuses, technicians }) => {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusId, setStatusId] = useState(filters.service_status_id ?? 'all');
    const [technicianId, setTeknisiId] = useState(filters.technician_id ?? 'all');
    const [deleteService, setDeleteService] = useState<Service | null>(null);

    const applyFilters = () => {
        router.get('/services', {
            search: search || undefined,
            service_status_id: statusId === 'all' ? undefined : statusId,
            technician_id: technicianId === 'all' ? undefined : technicianId,
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearch('');
        setStatusId('all');
        setTeknisiId('all');
        router.get('/services', {}, { preserveState: true, replace: true });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') applyFilters();
    };

    return (
        <>
            <Head title="Servis" />
            <div className="flex flex-col gap-6 p-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Servis</h2>
                        <p className="text-slate-500 mt-1.5 text-sm">Manage service requests &amp; repairs</p>
                    </div>
                    <Link
                        href="/services/create"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm inline-flex items-center gap-2"
                    >
                        Servis Baru
                    </Link>
                </div>

                <section className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center gap-4 shadow-sm">
                    <div className="flex-1 min-w-[300px]">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Cari kode service, pelanggan, atau perangkat..."
                            className="block w-full px-4 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                        />
                    </div>
                    <div className="w-56 relative">
                        <select
                            value={statusId}
                            onChange={(e) => setStatusId(e.target.value)}
                            className="block w-full pl-4 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-white border text-slate-700 appearance-none"
                        >
                            <option value="all">Semua status</option>
                            {statuses.map((s) => (
                                <option key={s.id} value={String(s.id)}>{s.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>
                    <div className="w-56 relative">
                        <select
                            value={technicianId}
                            onChange={(e) => setTeknisiId(e.target.value)}
                            className="block w-full pl-4 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-white border text-slate-700 appearance-none"
                        >
                            <option value="all">Semua teknisi</option>
                            {technicians.map((t) => (
                                <option key={t.id} value={String(t.id)}>{t.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={applyFilters}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                    >
                        Filter
                    </button>
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                        Reset Filter
                    </button>
                </section>

                <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    {services.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <h3 className="text-base font-semibold text-slate-900">Tidak ada service</h3>
                            <p className="mt-1 text-sm text-slate-500">Sesuaikan filter atau buat service baru.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kode Servis</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pelanggan</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Perangkat</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Keluhan</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Teknisi</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal Diterima</th>
                                            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {services.data.map((service) => (
                                            <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link href={`/services/${service.id}`} className="text-blue-600 hover:text-blue-700">
                                                        {serviceCode(service)}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                    {service.customer?.name ?? '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="font-medium text-slate-900">{service.device_name ?? '-'}</div>
                                                    <div className="text-slate-500 text-xs">
                                                        {[service.brand, service.model].filter(Boolean).join(' ')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                                                    {truncate(service.complaint)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                    {service.technician?.name ?? '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge status={service.status} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                    {formatTanggal(service.received_date ?? service.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button asChild variant="default" size="sm">
                                                            <Link href={`/services/${service.id}`}>
                                                                <Eye className="mr-1 size-4" />
                                                                Lihat
                                                            </Link>
                                                        </Button>
                                                        <Button asChild variant="success" size="sm">
                                                            <Link href={`/services/${service.id}/edit`}>
                                                                <Edit className="mr-1 size-4" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => setDeleteService(service)}
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

                            <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                                <div className="text-sm text-slate-700">
                                    Menampilkan <span className="font-medium">{services.from ?? 0}</span>-<span className="font-medium">{services.to ?? 0}</span> dari <span className="font-medium">{services.total}</span> service
                                </div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <Link
                                        href={services.current_page <= 1 ? '#' : `/services?page=${Math.max(1, services.current_page - 1)}`}
                                        className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-slate-200 bg-white text-sm font-medium ${
                                            services.current_page <= 1
                                                ? 'text-slate-300 cursor-not-allowed'
                                                : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                        preserveState
                                    >
                                        Sebelumnya
                                    </Link>
                                    <span className="relative inline-flex items-center px-4 py-2 border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700">
                                        {services.current_page} / {services.last_page}
                                    </span>
                                    <Link
                                        href={services.current_page >= services.last_page ? '#' : `/services?page=${Math.min(services.last_page, services.current_page + 1)}`}
                                        className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-slate-200 bg-white text-sm font-medium ${
                                            services.current_page >= services.last_page
                                                ? 'text-slate-300 cursor-not-allowed'
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
