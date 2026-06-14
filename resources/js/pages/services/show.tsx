import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { User } from '@/types';

type Customer = {
    id: number | string;
    name: string;
    phone?: string | null;
    address?: string | null;
};

type ServiceStatus = {
    id: number | string;
    name: string;
    slug?: string;
    color?: string;
};

type SparepartType = {
    id: number | string;
    name: string;
};

type ServiceUpdate = {
    id: number | string;
    new_status?: string | null;
    note?: string | null;
    created_at?: string | null;
    creator?: User | null;
};

type ServicePart = {
    id: number | string;
    part_name: string;
    type?: SparepartType | null;
    sparepart_type_id?: number | string | null;
    quantity: number;
    selling_price: number;
    installation_fee?: number;
    note?: string | null;
};

interface ServiceData {
    id: number | string;
    service_code?: string | null;
    customer?: Customer | null;
    device_name?: string | null;
    brand?: string | null;
    model?: string | null;
    serial_number?: string | null;
    complaint?: string | null;
    initial_condition?: string | null;
    estimated_cost?: number | string | null;
    final_cost?: number | string | null;
    estimated_completion_date?: string | null;
    service_status_id?: number | string | null;
    status?: ServiceStatus | null;
    technician?: User | null;
    tracking_code?: string | null;
    payment_status?: string | null;
    received_at?: string | null;
    completed_at?: string | null;
    picked_up_at?: string | null;
    created_at?: string | null;
    updates?: ServiceUpdate[];
    parts?: ServicePart[];
}

interface Props {
    service: ServiceData;
    statuses: ServiceStatus[];
    sparepart_types: SparepartType[];
}

type HalamanComponent = ((props: Props) => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

const statusColors: Record<string, string> = {
    diterima: 'bg-slate-100 text-slate-700 border-slate-200',
    'dicek-teknisi': 'bg-indigo-50 text-indigo-700 border-indigo-100',
    'dalam-pengerjaan': 'bg-blue-50 text-blue-700 border-blue-100',
    selesai: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    diambil: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    dibatalkan: 'bg-red-50 text-red-700 border-red-100',
};

function StatusBadge({ status }: { status?: ServiceStatus | null }) {
    if (!status) return null;
    const key = (status.slug ?? status.name.toLowerCase()).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const color = statusColors[key] ?? 'bg-slate-100 text-slate-700 border-slate-200';
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
            {status.name}
        </span>
    );
}

function StatusPill({ status }: { status?: ServiceStatus | null }) {
    if (!status) return null;
    const key = (status.slug ?? status.name.toLowerCase()).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const colors: Record<string, string> = {
        diterima: 'bg-slate-100 text-slate-700 border-slate-200',
        'dicek-teknisi': 'bg-indigo-50 text-indigo-700 border-indigo-100',
        'dalam-pengerjaan': 'bg-blue-50 text-blue-700 border-blue-100',
        selesai: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        diambil: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        dibatalkan: 'bg-red-50 text-red-700 border-red-100',
    };
    const color = colors[key] ?? 'bg-slate-100 text-slate-700 border-slate-200';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
            {status.name}
        </span>
    );
}

function formatTanggal(value?: string | null) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function formatCurrency(value?: number | string | null) {
    const amount = Number(value ?? 0);
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function serviceCode(service: ServiceData) {
    return service.service_code ?? `SRV-${service.id}`;
}

const ServicesShow: HalamanComponent = ({ service, statuses, sparepart_types }) => {
    const updates = service.updates ?? [];
    const parts = service.parts ?? [];
    const updateForm = useForm({ service_status_id: service.status ? String(service.status.id) : '', description: '' });
    const partForm = useForm({ part_name: '', quantity: '1', selling_price: '', sparepart_type_id: '' });

    const submitUpdate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        updateForm.post(`/services/${service.id}/updates`, { onSuccess: () => updateForm.reset('description') });
    };

    const submitPart = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        partForm.post(`/services/${service.id}/parts`, { onSuccess: () => partForm.reset() });
    };

    return (
        <>
            <Head title={serviceCode(service)} />
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{serviceCode(service)}</h2>
                            <StatusBadge status={service.status} />
                        </div>
                        <p className="text-sm text-slate-500">Detail servis, riwayat, sparepart, dan tindakan.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/services"
                            className="px-4 py-2 border border-slate-200 bg-white text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors shadow-sm inline-block"
                        >
                            Kembali
                        </Link>
                        <Link
                            href={`/services/${service.id}/edit`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm inline-block"
                        >
                            Edit Servis
                        </Link>
                    </div>
                </div>

                {/* Info Cards Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer Info Card */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4">Informasi Pelanggan</h3>
                        <div className="space-y-4">
                            <div>
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">NAMA</span>
                                <span className="text-sm text-slate-900 font-medium">{service.customer?.name ?? '-'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">TELEPON</span>
                                <span className="text-sm text-slate-900 font-medium">{service.customer?.phone ?? '-'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">ALAMAT</span>
                                <span className="text-sm text-slate-900 font-medium">{service.customer?.address ?? '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Device Info Card */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4">Informasi Perangkat</h3>
                        <div className="space-y-4">
                            <div>
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">NAMA PERANGKAT</span>
                                <span className="text-sm text-slate-900 font-medium">{service.device_name ?? '-'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">MEREK</span>
                                <span className="text-sm text-slate-900 font-medium">{service.brand ?? '-'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">MODEL</span>
                                <span className="text-sm text-slate-900 font-medium">{service.model ?? '-'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">NOMOR SERI</span>
                                <span className="text-sm text-slate-900 font-medium">{service.serial_number ?? '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Service Detail Card */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4">Detail Servis</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">KELUHAN</span>
                                <span className="text-sm text-slate-900 font-medium">{service.complaint ?? '-'}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">KONDISI AWAL</span>
                                <span className="text-sm text-slate-900 font-medium">{service.initial_condition ?? '-'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">ESTIMASI BIAYA</span>
                                <span className="text-sm text-slate-900 font-medium">{formatCurrency(service.estimated_cost)}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">BIAYA AKHIR</span>
                                <span className="text-sm text-slate-900 font-medium">{formatCurrency(service.final_cost)}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">ESTIMASI SELESAI</span>
                                <span className="text-sm text-slate-900 font-medium">{formatTanggal(service.estimated_completion_date)}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">DITERIMA</span>
                                <span className="text-sm text-slate-900 font-medium">{formatTanggal(service.received_at ?? service.created_at)}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">STATUS PEMBAYARAN</span>
                                <span className="text-sm text-slate-900 font-medium">
                                    {service.payment_status === 'paid' ? 'Lunas' : 'Belum Dibayar'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Timeline + Update Status */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Timeline / History */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full">
                            <div className="mb-5">
                                <h3 className="font-semibold text-slate-900 text-lg">Riwayat Status</h3>
                                <p className="text-sm text-slate-500">Perkembangan update dari teknisi.</p>
                            </div>
                            {updates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                                    <h3 className="text-sm font-semibold text-slate-900">Belum ada update</h3>
                                    <p className="mt-1 text-sm text-slate-500">Perubahan status akan muncul di sini.</p>
                                </div>
                            ) : (
                                <div className="relative pl-8 pt-2">
                                    <div className="absolute left-[7px] top-6 bottom-0 w-0.5 bg-slate-200" />
                                    {updates.map((update) => (
                                        <div key={update.id} className="relative pb-8 last:pb-0">
                                            <div
                                                className="absolute left-[-8px] top-[6px] w-4 h-4 rounded-full bg-blue-600 border-4 border-white z-10"
                                            />
                                            <div className="flex items-center gap-3 mb-1">
                                                <StatusPill status={{ id: '', name: update.new_status ?? '-' } as ServiceStatus} />
                                                <span className="text-xs text-slate-500 font-medium">{formatTanggal(update.created_at)}</span>
                                            </div>
                                            <p className="text-sm text-slate-900 font-medium mb-1">{update.note ?? 'Status diperbarui.'}</p>
                                            <p className="text-xs text-slate-500">Oleh {update.creator?.name ?? 'System'}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Update Status Form */}
                    <div>
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                            <div className="mb-4">
                                <h3 className="font-semibold text-slate-900 text-lg">Perbarui Status</h3>
                                <p className="text-sm text-slate-500">Catat update status baru untuk servis ini.</p>
                            </div>
                            <form onSubmit={submitUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-900 mb-1">Status</label>
                                    <div className="relative">
                                        <select
                                            value={updateForm.data.service_status_id || 'none'}
                                            onChange={(e) => updateForm.setData('service_status_id', e.target.value === 'none' ? '' : e.target.value)}
                                            className="block w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="none" disabled>Pilih status</option>
                                            {statuses.map((s) => (
                                                <option key={s.id} value={String(s.id)}>{s.name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                            </svg>
                                        </div>
                                    </div>
                                    {updateForm.errors.service_status_id && (
                                        <p className="text-sm text-red-600 mt-1">{updateForm.errors.service_status_id}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-900 mb-1">Deskripsi</label>
                                    <textarea
                                        value={updateForm.data.description}
                                        onChange={(e) => updateForm.setData('description', e.target.value)}
                                        placeholder="Jelaskan perkembangan servis"
                                        rows={3}
                                        className="block w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {updateForm.errors.description && (
                                        <p className="text-sm text-red-600 mt-1">{updateForm.errors.description}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={updateForm.processing}
                                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updateForm.processing ? 'Menyimpan...' : 'Simpan Update'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Row 3: Spareparts Table + Add Sparepart Form */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sparepart Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full">
                            <div className="mb-4">
                                <h3 className="font-semibold text-slate-900 text-lg">Sparepart Digunakan</h3>
                                <p className="text-sm text-slate-500">Sparepart yang dipasang untuk servis ini.</p>
                            </div>
                            {parts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                                    <h3 className="text-sm font-semibold text-slate-900">Belum ada sparepart</h3>
                                    <p className="mt-1 text-sm text-slate-500">Gunakan form di samping untuk menambah sparepart.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                                        <thead>
                                            <tr className="border-b border-slate-200">
                                                <th scope="col" className="px-4 py-3 font-semibold text-slate-900">Nama Part</th>
                                                <th scope="col" className="px-4 py-3 font-semibold text-slate-900">Tipe</th>
                                                <th scope="col" className="px-4 py-3 font-semibold text-slate-900">Jumlah</th>
                                                <th scope="col" className="px-4 py-3 font-semibold text-slate-900">Harga Jual</th>
                                                <th scope="col" className="px-4 py-3 font-semibold text-slate-900">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {parts.map((part) => (
                                                <tr key={part.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-slate-900">{part.part_name}</td>
                                                    <td className="px-4 py-3 text-slate-500">{part.type?.name ?? '-'}</td>
                                                    <td className="px-4 py-3 text-slate-500">{part.quantity ?? 0}</td>
                                                    <td className="px-4 py-3 text-slate-500">{formatCurrency(part.selling_price)}</td>
                                                    <td className="px-4 py-3 text-slate-900 font-medium">
                                                        {formatCurrency(Number(part.quantity ?? 0) * Number(part.selling_price ?? 0))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add Sparepart Form */}
                    <div>
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                            <div className="mb-4">
                                <h3 className="font-semibold text-slate-900 text-lg">Tambah Sparepart</h3>
                                <p className="text-sm text-slate-500">Tambahkan sparepart yang digunakan.</p>
                            </div>
                            <form onSubmit={submitPart} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-900 mb-1">Nama Part</label>
                                    <input
                                        type="text"
                                        value={partForm.data.part_name}
                                        onChange={(e) => partForm.setData('part_name', e.target.value)}
                                        placeholder="Keyboard, SSD, Baterai"
                                        className="block w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {partForm.errors.part_name && (
                                        <p className="text-sm text-red-600 mt-1">{partForm.errors.part_name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-900 mb-1">Tipe Sparepart</label>
                                    <div className="relative">
                                        <select
                                            value={partForm.data.sparepart_type_id || 'none'}
                                            onChange={(e) => partForm.setData('sparepart_type_id', e.target.value === 'none' ? '' : e.target.value)}
                                            className="block w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="none">Pilih tipe</option>
                                            {sparepart_types.map((type) => (
                                                <option key={type.id} value={String(type.id)}>{type.name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                            </svg>
                                        </div>
                                    </div>
                                    {partForm.errors.sparepart_type_id && (
                                        <p className="text-sm text-red-600 mt-1">{partForm.errors.sparepart_type_id}</p>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1/3">
                                        <label className="block text-sm font-medium text-slate-900 mb-1">Jumlah</label>
                                        <input
                                            type="number"
                                            value={partForm.data.quantity}
                                            onChange={(e) => partForm.setData('quantity', e.target.value)}
                                            className="block w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {partForm.errors.quantity && (
                                            <p className="text-sm text-red-600 mt-1">{partForm.errors.quantity}</p>
                                        )}
                                    </div>
                                    <div className="w-2/3">
                                        <label className="block text-sm font-medium text-slate-900 mb-1">Harga Jual</label>
                                        <input
                                            type="text"
                                            value={partForm.data.selling_price}
                                            onChange={(e) => partForm.setData('selling_price', e.target.value)}
                                            placeholder="Rp 0"
                                            className="block w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {partForm.errors.selling_price && (
                                            <p className="text-sm text-red-600 mt-1">{partForm.errors.selling_price}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={partForm.processing}
                                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {partForm.processing ? 'Menambahkan...' : 'Tambah Sparepart'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

ServicesShow.layout = (page) => (
    <AppLayout breadcrumbs={[{ title: 'Servis', href: '/services' }, { title: 'Detail Servis', href: '#' }]}>
        {page}
    </AppLayout>
);

export default ServicesShow;
