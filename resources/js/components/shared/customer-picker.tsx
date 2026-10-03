import { useMemo, useState } from 'react';

export interface CustomerOption {
    id: number | string;
    name: string;
    phone?: string | null;
}

export type CustomerMode = 'existing' | 'new';

interface CustomerPickerProps {
    customers: CustomerOption[];
    mode: CustomerMode;
    onModeChange: (mode: CustomerMode) => void;
    customerId: string;
    onCustomerIdChange: (id: string) => void;
    customerName: string;
    onCustomerNameChange: (value: string) => void;
    customerPhone: string;
    onCustomerPhoneChange: (value: string) => void;
    errors?: {
        customer_id?: string;
        customer_name?: string;
        customer_phone?: string;
    };
    /** False = kunci di pelanggan lama (mis. form edit). */
    allowNew?: boolean;
    /** Class input milik halaman pemanggil agar gaya seragam. */
    inputClass: string;
}

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

/**
 * Pilih pelanggan lama (cari + daftar) atau buat baru.
 *
 * Menggantikan pola lama "kotak cari + select native + field
 * nama/telepon mati" yang membingungkan: field nama/telepon lama
 * tidak pernah terkirim ke backend, dan opsi "Pelanggan baru"
 * selalu gagal validasi. Di sini setiap mode eksplisit dan jujur.
 */
export default function CustomerPicker({
    customers,
    mode,
    onModeChange,
    customerId,
    onCustomerIdChange,
    customerName,
    onCustomerNameChange,
    customerPhone,
    onCustomerPhoneChange,
    errors,
    allowNew = true,
    inputClass,
}: CustomerPickerProps) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        if (!q) {
            return customers;
        }

        return customers.filter((c) =>
            `${c.name} ${c.phone ?? ''}`.toLowerCase().includes(q),
        );
    }, [query, customers]);

    const selected = customers.find((c) => String(c.id) === customerId);

    return (
        <div>
            {allowNew && (
                <div
                    role="group"
                    aria-label="Jenis pelanggan"
                    className="mb-4 inline-flex rounded-lg border border-slate-300 bg-white p-1"
                >
                    {(
                        [
                            { value: 'existing', label: 'Pelanggan Lama' },
                            { value: 'new', label: 'Pelanggan Baru' },
                        ] as const
                    ).map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onModeChange(opt.value)}
                            aria-pressed={mode === opt.value}
                            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                                mode === opt.value
                                    ? 'bg-brand text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}

            {mode === 'existing' ? (
                <div>
                    <label
                        htmlFor="customer-search"
                        className="mb-1 block text-sm font-medium text-slate-700"
                    >
                        Cari Pelanggan
                    </label>
                    <input
                        id="customer-search"
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ketik nama atau telepon…"
                        className={inputClass}
                    />
                    {selected && (
                        <p className="mt-2 text-sm text-slate-600">
                            Terpilih:{' '}
                            <span className="font-semibold text-slate-900">
                                {selected.name}
                            </span>{' '}
                            ({selected.phone ?? '-'})
                            <button
                                type="button"
                                onClick={() => {
                                    onCustomerIdChange('');
                                    setQuery('');
                                }}
                                className="ml-2 text-sm font-medium text-red-600 hover:text-red-700"
                            >
                                Ganti
                            </button>
                        </p>
                    )}
                    <div
                        role="listbox"
                        aria-label="Daftar pelanggan"
                        className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-slate-200"
                    >
                        {filtered.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-slate-500">
                                Tidak ada pelanggan yang cocok.
                            </p>
                        ) : (
                            filtered.map((c) => {
                                const active = String(c.id) === customerId;

                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        role="option"
                                        aria-selected={active}
                                        onClick={() =>
                                            onCustomerIdChange(String(c.id))
                                        }
                                        className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 ${
                                            active
                                                ? 'bg-slate-100 font-semibold text-slate-900'
                                                : 'text-slate-700'
                                        }`}
                                    >
                                        <span>{c.name}</span>
                                        <span className="shrink-0 text-xs text-slate-500">
                                            {c.phone ?? '-'}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                    <FieldError message={errors?.customer_id} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="customer-name"
                            className="mb-1 block text-sm font-medium text-slate-700"
                        >
                            Nama Pelanggan{' '}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="customer-name"
                            type="text"
                            value={customerName}
                            onChange={(e) =>
                                onCustomerNameChange(e.target.value)
                            }
                            placeholder="Nama lengkap pelanggan"
                            className={inputClass}
                        />
                        <FieldError message={errors?.customer_name} />
                    </div>
                    <div>
                        <label
                            htmlFor="customer-phone"
                            className="mb-1 block text-sm font-medium text-slate-700"
                        >
                            Telepon <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="customer-phone"
                            type="text"
                            value={customerPhone}
                            onChange={(e) =>
                                onCustomerPhoneChange(e.target.value)
                            }
                            placeholder="08…"
                            className={inputClass}
                        />
                        <FieldError message={errors?.customer_phone} />
                    </div>
                    <p className="text-sm text-slate-500 sm:col-span-2">
                        Pelanggan baru langsung tersimpan bersama servis ini.
                    </p>
                </div>
            )}
        </div>
    );
}
