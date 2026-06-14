import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { Service, ServicePart, SparepartType } from '@/types';
import type { User } from '@/types';

type Customer = {
    id: number | string;
    name: string;
    phone?: string | null;
};

type ServiceStatus = {
    id: number | string;
    name: string;
    slug?: string;
    color?: string;
};

type PartItem = {
    tempId: string;
    kind: 'used' | 'sold';
    sparepart_type_id: string;
    part_name: string;
    quantity: string;
    cost_price: string;
    selling_price: string;
    installation_fee: string;
    note: string;
};

type ServiceForm = {
    customer_id: string;
    customer_name: string;
    customer_phone: string;
    brand: string;
    model: string;
    kelengkapan: string;
    complaint: string;
    initial_condition: string;
    estimated_cost: string;
    estimated_completion_date: string;
    technician_id: string;
    service_status_id: string;
    parts: PartItem[];
};

interface Props {
    service: Service;
    customers: Customer[];
    statuses: ServiceStatus[];
    technicians: User[];
    sparepart_types: SparepartType[];
}

type HalamanComponent = ((props: Props) => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

function nullableString(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value);
}

function toTanggalInput(value?: string | null): string {
    if (!value) return '';
    return value.split('T')[0] ?? '';
}

function partFromExisting(p: ServicePart): PartItem {
    return {
        tempId:
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        kind: p.kind === 'sold' ? 'sold' : 'used',
        sparepart_type_id: p.sparepart_type_id
            ? String(p.sparepart_type_id)
            : '',
        part_name: p.part_name ?? p.name ?? '',
        quantity: String(p.quantity ?? 1),
        cost_price: String(p.cost_price ?? 0),
        selling_price: String(
            p.selling_price ?? p.price ?? p.unit_price ?? 0,
        ),
        installation_fee: String(p.installation_fee ?? 0),
        note: p.note ?? '',
    };
}

const newPart = (): PartItem => ({
    tempId:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    kind: 'used',
    sparepart_type_id: '',
    part_name: '',
    quantity: '1',
    cost_price: '0',
    selling_price: '0',
    installation_fee: '0',
    note: '',
});

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-sm text-red-600 mt-1">{message}</p>;
}

const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm text-slate-900 bg-white';

const selectClass = `${inputClass} appearance-none`;

const ServicesEdit: HalamanComponent = ({
    service,
    customers,
    statuses,
    technicians,
    sparepart_types,
}) => {
    const form = useForm<ServiceForm>({
        customer_id: String(service.customer_id ?? service.customer?.id ?? ''),
        customer_name: service.customer?.name ?? '',
        customer_phone: service.customer?.phone ?? '',
        brand: service.brand ?? '',
        model: service.model ?? '',
        kelengkapan: service.kelengkapan ?? '',
        complaint: service.complaint ?? '',
        initial_condition: service.initial_condition ?? '',
        estimated_cost: String(service.estimated_cost ?? ''),
        estimated_completion_date: toTanggalInput(
            service.estimated_completion_date,
        ),
        technician_id: String(service.technician?.id ?? ''),
        service_status_id: String(service.status?.id ?? ''),
        parts: (service.parts ?? []).map(partFromExisting),
    });

    const addPart = () => {
        form.setData('parts', [...form.data.parts, newPart()]);
    };

    const removePart = (tempId: string) => {
        form.setData(
            'parts',
            form.data.parts.filter((p) => p.tempId !== tempId),
        );
    };

    const updatePart = <K extends keyof PartItem>(
        tempId: string,
        key: K,
        value: PartItem[K],
    ) => {
        form.setData(
            'parts',
            form.data.parts.map((p) =>
                p.tempId === tempId ? { ...p, [key]: value } : p,
            ),
        );
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(`/services/${service.id}`);
    };

    return (
        <>
            <Head title={`Edit Servis — ${service.service_code}`} />
            <form onSubmit={submit} className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Edit Servis
                        </h2>
                        <p className="text-slate-500 mt-1">
                            {service.service_code} —{' '}
                            {nullableString(service.customer?.name)}
                        </p>
                    </div>
                    <Link
                        href={`/services/${service.id}`}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm inline-block"
                    >
                        Kembali
                    </Link>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Informasi Pelanggan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Pelanggan
                            </label>
                            <select
                                value={form.data.customer_id || ''}
                                onChange={(e) =>
                                    form.setData('customer_id', e.target.value)
                                }
                                className={selectClass}
                            >
                                <option value="">—</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={String(c.id)}>
                                        {c.name} - {c.phone ?? '-'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Nama Pelanggan
                            </label>
                            <input
                                type="text"
                                value={form.data.customer_name}
                                onChange={(e) =>
                                    form.setData('customer_name', e.target.value)
                                }
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Telepon
                            </label>
                            <input
                                type="text"
                                value={form.data.customer_phone}
                                onChange={(e) =>
                                    form.setData('customer_phone', e.target.value)
                                }
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Informasi Perangkat
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Merek
                            </label>
                            <input
                                type="text"
                                value={form.data.brand}
                                onChange={(e) =>
                                    form.setData('brand', e.target.value)
                                }
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Model / Tipe
                            </label>
                            <input
                                type="text"
                                value={form.data.model}
                                onChange={(e) =>
                                    form.setData('model', e.target.value)
                                }
                                className={inputClass}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Kelengkapan
                            </label>
                            <textarea
                                value={form.data.kelengkapan}
                                onChange={(e) =>
                                    form.setData('kelengkapan', e.target.value)
                                }
                                className={`${inputClass} min-h-[80px]`}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Keluhan
                            </label>
                            <textarea
                                value={form.data.complaint}
                                onChange={(e) =>
                                    form.setData('complaint', e.target.value)
                                }
                                className={`${inputClass} min-h-[100px]`}
                            />
                            <FieldError message={form.errors.complaint} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Kondisi Awal
                            </label>
                            <textarea
                                value={form.data.initial_condition}
                                onChange={(e) =>
                                    form.setData(
                                        'initial_condition',
                                        e.target.value,
                                    )
                                }
                                className={`${inputClass} min-h-[80px]`}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Biaya &amp; Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Estimasi Biaya
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={form.data.estimated_cost}
                                onChange={(e) =>
                                    form.setData(
                                        'estimated_cost',
                                        e.target.value,
                                    )
                                }
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Estimasi Selesai
                            </label>
                            <input
                                type="date"
                                value={form.data.estimated_completion_date}
                                onChange={(e) =>
                                    form.setData(
                                        'estimated_completion_date',
                                        e.target.value,
                                    )
                                }
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Teknisi
                            </label>
                            <select
                                value={form.data.technician_id || ''}
                                onChange={(e) =>
                                    form.setData('technician_id', e.target.value)
                                }
                                className={selectClass}
                            >
                                <option value="">—</option>
                                {technicians.map((t) => (
                                    <option key={t.id} value={String(t.id)}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Status Servis
                            </label>
                            <select
                                value={form.data.service_status_id || ''}
                                onChange={(e) =>
                                    form.setData(
                                        'service_status_id',
                                        e.target.value,
                                    )
                                }
                                className={selectClass}
                            >
                                <option value="">—</option>
                                {statuses.map((s) => (
                                    <option key={s.id} value={String(s.id)}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Sparepart
                        </h3>
                        <button
                            type="button"
                            onClick={addPart}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            + Tambah Item
                        </button>
                    </div>
                    <p className="text-sm text-slate-500 mb-5">
                        Tambahkan sparepart yang dipakai untuk servis (pengambilan)
                        atau yang dijual langsung ke pelanggan (penjualan).
                    </p>

                    {form.data.parts.length === 0 ? (
                        <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-sm text-slate-500">
                            Belum ada item. Klik <b>Tambah Item</b> untuk mulai.
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {form.data.parts.map((part, index) => (
                                <li
                                    key={part.tempId}
                                    className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            Item #{index + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removePart(part.tempId)
                                            }
                                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                                        >
                                            Hapus
                                        </button>
                                    </div>

                                    <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1 mb-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updatePart(
                                                    part.tempId,
                                                    'kind',
                                                    'used',
                                                )
                                            }
                                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                                part.kind === 'used'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            Pengambilan untuk servis
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updatePart(
                                                    part.tempId,
                                                    'kind',
                                                    'sold',
                                                )
                                            }
                                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                                part.kind === 'sold'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            Penjualan ke customer
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Tipe Sparepart
                                            </label>
                                            <select
                                                value={
                                                    part.sparepart_type_id || ''
                                                }
                                                onChange={(e) =>
                                                    updatePart(
                                                        part.tempId,
                                                        'sparepart_type_id',
                                                        e.target.value,
                                                    )
                                                }
                                                className={selectClass}
                                            >
                                                <option value="">—</option>
                                                {sparepart_types.map((s) => (
                                                    <option
                                                        key={s.id}
                                                        value={String(s.id)}
                                                    >
                                                        {s.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Nama Sparepart
                                            </label>
                                            <input
                                                type="text"
                                                value={part.part_name}
                                                onChange={(e) =>
                                                    updatePart(
                                                        part.tempId,
                                                        'part_name',
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                            />
                                            <FieldError
                                                message={
                                                    form.errors[
                                                        `parts.${index}.part_name` as keyof typeof form.errors
                                                    ] as string | undefined
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Qty
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={part.quantity}
                                                onChange={(e) =>
                                                    updatePart(
                                                        part.tempId,
                                                        'quantity',
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Harga Modal
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={part.cost_price}
                                                onChange={(e) =>
                                                    updatePart(
                                                        part.tempId,
                                                        'cost_price',
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Harga Jual
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={part.selling_price}
                                                onChange={(e) =>
                                                    updatePart(
                                                        part.tempId,
                                                        'selling_price',
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Biaya Pasang
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={part.installation_fee}
                                                onChange={(e) =>
                                                    updatePart(
                                                        part.tempId,
                                                        'installation_fee',
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Catatan
                                            </label>
                                            <input
                                                type="text"
                                                value={part.note}
                                                onChange={(e) =>
                                                    updatePart(
                                                        part.tempId,
                                                        'note',
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <Link
                        href={`/services/${service.id}`}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                        {form.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </>
    );
};

ServicesEdit.layout = (page: ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: dashboard() },
            { title: 'Servis', href: '/services' },
            { title: 'Edit Servis', href: '' },
        ]}
    >
        {page}
    </AppLayout>
);

export default ServicesEdit;
