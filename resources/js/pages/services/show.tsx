import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatCurrencyOrDash, formatTanggalWaktu } from '@/lib/format';
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
    financial_transactions?: FinancialTransaction[];
}

type FinancialTransaction = {
    id: number | string;
    type: 'income' | 'expense';
    amount: number;
    transaction_code: string;
    description?: string | null;
    transaction_date: string;
    category?: { name: string } | null;
};

interface Props {
    service: ServiceData;
    statuses: ServiceStatus[];
    sparepart_types: SparepartType[];
    spareparts: Array<{
        id: number;
        name: string;
        stock: number;
        selling_price: number | string;
    }>;
}

type HalamanComponent = ((props: Props) => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

const statusColors: Record<string, string> = {
    diterima: 'bg-slate-100 text-slate-700 border-slate-200',
    'dicek-teknisi': 'bg-indigo-50 text-indigo-700 border-indigo-100',
    'dalam-pengerjaan': 'bg-brand-soft text-brand border-brand-soft',
    selesai: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    diambil: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    dibatalkan: 'bg-red-50 text-red-700 border-red-100',
};

function StatusBadge({ status }: { status?: ServiceStatus | null }) {
    if (!status) {
        return null;
    }

    const key = (status.slug ?? status.name.toLowerCase())
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const color =
        statusColors[key] ?? 'bg-slate-100 text-slate-700 border-slate-200';

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}
        >
            {status.name}
        </span>
    );
}

function StatusPill({ status }: { status?: ServiceStatus | null }) {
    if (!status) {
        return null;
    }

    const key = (status.slug ?? status.name.toLowerCase())
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const colors: Record<string, string> = {
        diterima: 'bg-slate-100 text-slate-700 border-slate-200',
        'dicek-teknisi': 'bg-indigo-50 text-indigo-700 border-indigo-100',
        'dalam-pengerjaan': 'bg-brand-soft text-brand border-brand-soft',
        selesai: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        diambil: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        dibatalkan: 'bg-red-50 text-red-700 border-red-100',
    };
    const color = colors[key] ?? 'bg-slate-100 text-slate-700 border-slate-200';

    return (
        <span
            className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${color}`}
        >
            {status.name}
        </span>
    );
}

function serviceCode(service: ServiceData) {
    return service.service_code ?? `SRV-${service.id}`;
}

const ServicesShow: HalamanComponent = ({
    service,
    statuses,
    sparepart_types,
    spareparts,
}) => {
    const updates = service.updates ?? [];
    const parts = service.parts ?? [];
    const updateForm = useForm({
        status_to: service.status ? String(service.status.id) : '',
        description: '',
    });
    const partForm = useForm({
        part_name: '',
        quantity: '1',
        unit_price: '',
        sparepart_type_id: '',
        sparepart_id: '',
    });

    // Pilih dari inventori → nama + harga terisi otomatis.
    function pickInventory(id: string) {
        partForm.setData('sparepart_id', id);

        const item = spareparts.find((s) => String(s.id) === id);

        if (item) {
            partForm.setData('part_name', item.name);
            partForm.setData('unit_price', String(item.selling_price));
        }
    }

    const submitUpdate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        updateForm.post(`/services/${service.id}/updates`, {
            onSuccess: () => updateForm.reset('description'),
        });
    };

    const submitPart = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        partForm.post(`/services/${service.id}/parts`, {
            onSuccess: () => partForm.reset(),
        });
    };

    return (
        <>
            <Head title={serviceCode(service)} />
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="mb-1 flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                {serviceCode(service)}
                            </h2>
                            <StatusBadge status={service.status} />
                        </div>
                        <p className="text-sm text-slate-500">
                            Detail servis, riwayat, sparepart, dan tindakan.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/services">Kembali</Link>
                        </Button>
                        <Button variant="primary" asChild>
                            <Link href={`/services/${service.id}/edit`}>
                                Edit Servis
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Info Cards Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Customer Info Card */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 font-semibold text-slate-900">
                            Informasi Pelanggan
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    NAMA
                                </span>
                                <span className="text-sm font-medium text-slate-900">
                                    {service.customer?.name ?? '-'}
                                </span>
                            </div>
                            <div>
                                <span className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    TELEPON
                                </span>
                                <span className="text-sm font-medium text-slate-900">
                                    {service.customer?.phone ?? '-'}
                                </span>
                            </div>
                            <div>
                                <span className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    ALAMAT
                                </span>
                                <span className="text-sm font-medium text-slate-900">
                                    {service.customer?.address ?? '-'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Device Info Card */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 font-semibold text-slate-900">
                            Informasi Perangkat
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    NAMA PERANGKAT
                                </span>
                                <span className="text-sm font-medium text-slate-900">
                                    {service.device_name ?? '-'}
                                </span>
                            </div>
                            <div>
                                <span className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    MEREK
                                </span>
                                <span className="text-sm font-medium text-slate-900">
                                    {service.brand ?? '-'}
                                </span>
                            </div>
                            <div>
                                <span className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    MODEL
                                </span>
                                <span className="text-sm font-medium text-slate-900">
                                    {service.model ?? '-'}
                                </span>
                            </div>
                            <div>
                                <span className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    NOMOR SERI
                                </span>
                                <span className="text-sm font-medium text-slate-900">
                                    {service.serial_number ?? '-'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Service Detail Card */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 font-semibold text-slate-900">
                            Detail Servis
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="col-span-2">
                                <span className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    KELUHAN
                                </span>
                                <span className="text-sm font-medium text-slate-900">
                                    {service.complaint ?? '-'}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <span className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    KONDISI AWAL
                                </span>
                                <span className="text-sm font-medium text-slate-900">
                                    {service.initial_condition ?? '-'}
                                </span>
                            </div>
                            <div>
                                <span className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    ESTIMASI BIAYA
                                </span>
                                <span className="text-sm font-medium text-slate-900">
                                    {formatCurrencyOrDash(
                                        service.estimated_cost,
                                    )}
                                </span>
                            </div>
                            <div>
                                <span className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    BIAYA AKHIR
                                </span>
                                <span className="text-sm font-medium text-slate-900">
                                    {formatCurrencyOrDash(service.final_cost)}
                                </span>
                            </div>
                            <div>
                                <span className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    ESTIMASI SELESAI
                                </span>
                                <span className="text-sm font-medium text-slate-900">
                                    {formatTanggalWaktu(
                                        service.estimated_completion_date,
                                    )}
                                </span>
                            </div>
                            <div>
                                <span className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    DITERIMA
                                </span>
                                <span className="text-sm font-medium text-slate-900">
                                    {formatTanggalWaktu(
                                        service.received_at ??
                                            service.created_at,
                                    )}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <span className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    STATUS PEMBAYARAN
                                </span>
                                <span className="text-sm font-medium text-slate-900">
                                    {service.payment_status === 'paid'
                                        ? 'Lunas'
                                        : 'Belum Dibayar'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Timeline + Update Status */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Timeline / History */}
                    <div className="lg:col-span-2">
                        <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-5">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Riwayat Status
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Perkembangan update dari teknisi.
                                </p>
                            </div>
                            {updates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Belum ada update
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Perubahan status akan muncul di sini.
                                    </p>
                                </div>
                            ) : (
                                <div className="relative pt-2 pl-8">
                                    <div className="absolute top-6 bottom-0 left-[7px] w-0.5 bg-slate-200" />
                                    {updates.map((update) => (
                                        <div
                                            key={update.id}
                                            className="relative pb-8 last:pb-0"
                                        >
                                            <div className="absolute top-[6px] left-[-8px] z-10 h-4 w-4 rounded-full border-4 border-white bg-brand" />
                                            <div className="mb-1 flex items-center gap-3">
                                                <StatusPill
                                                    status={
                                                        {
                                                            id: '',
                                                            name:
                                                                update.new_status ??
                                                                '-',
                                                        } as ServiceStatus
                                                    }
                                                />
                                                <span className="text-xs font-medium text-slate-500">
                                                    {formatTanggalWaktu(
                                                        update.created_at,
                                                    )}
                                                </span>
                                            </div>
                                            <p className="mb-1 text-sm font-medium text-slate-900">
                                                {update.note ??
                                                    'Status diperbarui.'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Oleh{' '}
                                                {update.creator?.name ??
                                                    'System'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Update Status Form */}
                    <div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Perbarui Status
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Catat update status baru untuk servis ini.
                                </p>
                            </div>
                            <form onSubmit={submitUpdate} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-900">
                                        Status
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={
                                                updateForm.data.status_to ||
                                                'none'
                                            }
                                            onChange={(e) =>
                                                updateForm.setData(
                                                    'status_to',
                                                    e.target.value === 'none'
                                                        ? ''
                                                        : e.target.value,
                                                )
                                            }
                                            className="block w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none"
                                        >
                                            <option value="none" disabled>
                                                Pilih status
                                            </option>
                                            {statuses.map((s) => (
                                                <option
                                                    key={s.id}
                                                    value={String(s.id)}
                                                >
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
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
                                    {updateForm.errors.status_to && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {updateForm.errors.status_to}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-900">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        value={updateForm.data.description}
                                        onChange={(e) =>
                                            updateForm.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Jelaskan perkembangan servis"
                                        rows={3}
                                        className="block w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none"
                                    />
                                    {updateForm.errors.description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {updateForm.errors.description}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={updateForm.processing}
                                    className="w-full"
                                >
                                    {updateForm.processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Update'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Row 3: Spareparts Table + Add Sparepart Form */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Sparepart Table */}
                    <div className="lg:col-span-2">
                        <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Sparepart Digunakan
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Sparepart yang dipasang untuk servis ini.
                                </p>
                            </div>
                            {parts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Belum ada sparepart
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Gunakan form di samping untuk menambah
                                        sparepart.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                                        <thead>
                                            <tr className="border-b border-slate-200">
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 font-semibold text-slate-900"
                                                >
                                                    Nama Part
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 font-semibold text-slate-900"
                                                >
                                                    Tipe
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 font-semibold text-slate-900"
                                                >
                                                    Jumlah
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 font-semibold text-slate-900"
                                                >
                                                    Harga Jual
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 font-semibold text-slate-900"
                                                >
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {parts.map((part) => (
                                                <tr
                                                    key={part.id}
                                                    className="transition-colors hover:bg-slate-50"
                                                >
                                                    <td className="px-4 py-3 font-medium text-slate-900">
                                                        {part.part_name}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">
                                                        {part.type?.name ?? '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">
                                                        {part.quantity ?? 0}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">
                                                        {formatCurrencyOrDash(
                                                            part.selling_price,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-slate-900">
                                                        {formatCurrencyOrDash(
                                                            Number(
                                                                part.quantity ??
                                                                    0,
                                                            ) *
                                                                Number(
                                                                    part.selling_price ??
                                                                        0,
                                                                ),
                                                        )}
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
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Tambah Sparepart
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Tambahkan sparepart yang digunakan.
                                </p>
                            </div>
                            <form onSubmit={submitPart} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-900">
                                        Ambil dari Stok (opsional)
                                    </label>
                                    <select
                                        value={
                                            partForm.data.sparepart_id || 'none'
                                        }
                                        onChange={(e) =>
                                            pickInventory(
                                                e.target.value === 'none'
                                                    ? ''
                                                    : e.target.value,
                                            )
                                        }
                                        className="block w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none"
                                    >
                                        <option value="none">
                                            Part manual (tidak dari stok)
                                        </option>
                                        {spareparts.map((s) => (
                                            <option
                                                key={s.id}
                                                value={String(s.id)}
                                            >
                                                {s.name} (stok: {s.stock})
                                            </option>
                                        ))}
                                    </select>
                                    {partForm.errors.sparepart_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {partForm.errors.sparepart_id}
                                        </p>
                                    )}
                                    {partForm.errors.quantity &&
                                        partForm.data.sparepart_id && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {partForm.errors.quantity}
                                            </p>
                                        )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-900">
                                        Nama Part
                                    </label>
                                    <input
                                        type="text"
                                        value={partForm.data.part_name}
                                        onChange={(e) =>
                                            partForm.setData(
                                                'part_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Keyboard, SSD, Baterai"
                                        className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none"
                                    />
                                    {partForm.errors.part_name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {partForm.errors.part_name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-900">
                                        Tipe Sparepart
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={
                                                partForm.data
                                                    .sparepart_type_id || 'none'
                                            }
                                            onChange={(e) =>
                                                partForm.setData(
                                                    'sparepart_type_id',
                                                    e.target.value === 'none'
                                                        ? ''
                                                        : e.target.value,
                                                )
                                            }
                                            className="block w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none"
                                        >
                                            <option value="none">
                                                Pilih tipe
                                            </option>
                                            {sparepart_types.map((type) => (
                                                <option
                                                    key={type.id}
                                                    value={String(type.id)}
                                                >
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
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
                                    {partForm.errors.sparepart_type_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {partForm.errors.sparepart_type_id}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1/3">
                                        <label className="mb-1 block text-sm font-medium text-slate-900">
                                            Jumlah
                                        </label>
                                        <input
                                            type="number"
                                            value={partForm.data.quantity}
                                            onChange={(e) =>
                                                partForm.setData(
                                                    'quantity',
                                                    e.target.value,
                                                )
                                            }
                                            className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none"
                                        />
                                        {partForm.errors.quantity && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {partForm.errors.quantity}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-2/3">
                                        <label className="mb-1 block text-sm font-medium text-slate-900">
                                            Harga Jual
                                        </label>
                                        <input
                                            type="text"
                                            value={partForm.data.unit_price}
                                            onChange={(e) =>
                                                partForm.setData(
                                                    'unit_price',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Rp 0"
                                            className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none"
                                        />
                                        {partForm.errors.unit_price && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {partForm.errors.unit_price}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={partForm.processing}
                                    className="w-full"
                                >
                                    {partForm.processing
                                        ? 'Menambahkan...'
                                        : 'Tambah Sparepart'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Row 4: Financial Transactions */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Transaksi Keuangan
                        </h3>
                        <p className="text-sm text-slate-500">
                            Transaksi otomatis yang terkait dengan servis ini.
                        </p>
                    </div>
                    {!service.financial_transactions ||
                    service.financial_transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                            <h3 className="text-sm font-semibold text-slate-900">
                                Belum ada transaksi
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Transaksi akan muncul otomatis saat servis
                                selesai.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="px-4 py-3 font-semibold text-slate-900">
                                            Kode
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-slate-900">
                                            Tipe
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-slate-900">
                                            Kategori
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-slate-900">
                                            Jumlah
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-slate-900">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {service.financial_transactions.map(
                                        (ft) => {
                                            const isIncome =
                                                ft.type === 'income';

                                            return (
                                                <tr
                                                    key={ft.id}
                                                    className="transition-colors hover:bg-slate-50"
                                                >
                                                    <td className="px-4 py-3 font-mono text-sm font-medium text-slate-900">
                                                        {ft.transaction_code}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                                isIncome
                                                                    ? 'bg-emerald-50 text-emerald-700'
                                                                    : 'bg-rose-50 text-rose-700'
                                                            }`}
                                                        >
                                                            {isIncome
                                                                ? 'Pemasukan'
                                                                : 'Pengeluaran'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">
                                                        {ft.category?.name ??
                                                            '-'}
                                                    </td>
                                                    <td
                                                        className={`px-4 py-3 font-bold tabular-nums ${
                                                            isIncome
                                                                ? 'text-emerald-700'
                                                                : 'text-rose-700'
                                                        }`}
                                                    >
                                                        {isIncome ? '+' : '−'}{' '}
                                                        {new Intl.NumberFormat(
                                                            'id-ID',
                                                            {
                                                                style: 'currency',
                                                                currency: 'IDR',
                                                                maximumFractionDigits: 0,
                                                            },
                                                        ).format(
                                                            Number(
                                                                ft.amount ?? 0,
                                                            ),
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/financial-transactions/${ft.id}`}
                                                            >
                                                                Lihat
                                                            </Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        },
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

ServicesShow.layout = (page) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Servis', href: '/services' },
            { title: 'Detail Servis', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);

export default ServicesShow;
