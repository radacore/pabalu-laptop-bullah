import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { Customer, Rental, RentalStatus } from '@/types';

interface Props {
    rental: Rental;
    customers: Customer[];
    statuses: RentalStatus[];
}

function toTanggalInput(value: string | null | undefined): string {
    if (!value) {
        return '';
    }

    return value.slice(0, 16);
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

const inputClass =
    'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50';

function RentalUbah({ rental, customers, statuses }: Props) {
    const form = useForm({
        customer_id: rental.customer_id ? String(rental.customer_id) : '',
        rental_status_id: rental.rental_status_id
            ? String(rental.rental_status_id)
            : '',
        daily_rate: String(rental.daily_rate ?? ''),
        deposit: String(rental.deposit ?? ''),
        deposit_returned: Boolean(rental.deposit_returned),
        total_cost: rental.total_cost != null ? String(rental.total_cost) : '',
        paid_amount: String(rental.paid_amount ?? ''),
        payment_status: rental.payment_status ?? 'unpaid',
        rented_at: toTanggalInput(rental.rented_at),
        due_at: toTanggalInput(rental.due_at),
        returned_at: toTanggalInput(rental.returned_at),
        note: rental.note ?? '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(`/rentals/${rental.id}`);
    }

    return (
        <>
            <Head title={`Edit ${rental.rental_code}`} />
            <form
                onSubmit={submit}
                className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4"
            >
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Edit {rental.rental_code}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Perbarui data penyewaan dan status unit
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={`/rentals/${rental.id}`}>
                            <ArrowLeft className="size-4" />
                            Kembali
                        </Link>
                    </Button>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Penyewaan</CardTitle>
                        <CardDescription>
                            Unit tidak bisa diganti. Hapus dan buat baru bila
                            salah unit.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field
                                label="Pelanggan"
                                error={form.errors.customer_id}
                            >
                                <select
                                    value={form.data.customer_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'customer_id',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                    required
                                >
                                    <option value="">Pilih pelanggan</option>
                                    {customers.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} — {c.phone}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field
                                label="Status"
                                error={form.errors.rental_status_id}
                            >
                                <select
                                    value={form.data.rental_status_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'rental_status_id',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="">—</option>
                                    {statuses.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <Field
                                label="Tarif / Hari (Rp)"
                                error={form.errors.daily_rate}
                            >
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.data.daily_rate}
                                    onChange={(e) =>
                                        form.setData(
                                            'daily_rate',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </Field>
                            <Field
                                label="Deposit (Rp)"
                                error={form.errors.deposit}
                            >
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.data.deposit}
                                    onChange={(e) =>
                                        form.setData('deposit', e.target.value)
                                    }
                                />
                            </Field>
                            <Field
                                label="Total Biaya (Rp)"
                                error={form.errors.total_cost}
                            >
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.data.total_cost}
                                    onChange={(e) =>
                                        form.setData(
                                            'total_cost',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Otomatis bila kosong"
                                />
                            </Field>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <Field
                                label="Dibayar (Rp)"
                                error={form.errors.paid_amount}
                            >
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.data.paid_amount}
                                    onChange={(e) =>
                                        form.setData(
                                            'paid_amount',
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Status Bayar"
                                error={form.errors.payment_status}
                            >
                                <select
                                    value={form.data.payment_status}
                                    onChange={(e) =>
                                        form.setData(
                                            'payment_status',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="unpaid">Belum bayar</option>
                                    <option value="partial">
                                        Sebagian (DP/angsuran)
                                    </option>
                                    <option value="paid">Lunas</option>
                                </select>
                            </Field>
                            <div className="grid gap-2">
                                <Label>Deposit</Label>
                                <label className="flex h-10 items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.data.deposit_returned}
                                        onChange={(e) =>
                                            form.setData(
                                                'deposit_returned',
                                                e.target.checked,
                                            )
                                        }
                                        className="size-4"
                                    />
                                    Sudah dikembalikan
                                </label>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <Field
                                label="Mulai Sewa"
                                error={form.errors.rented_at}
                            >
                                <Input
                                    type="datetime-local"
                                    value={form.data.rented_at}
                                    onChange={(e) =>
                                        form.setData(
                                            'rented_at',
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Jatuh Tempo"
                                error={form.errors.due_at}
                            >
                                <Input
                                    type="datetime-local"
                                    value={form.data.due_at}
                                    onChange={(e) =>
                                        form.setData('due_at', e.target.value)
                                    }
                                />
                            </Field>
                            <Field
                                label="Tanggal Kembali"
                                error={form.errors.returned_at}
                            >
                                <Input
                                    type="datetime-local"
                                    value={form.data.returned_at}
                                    onChange={(e) =>
                                        form.setData(
                                            'returned_at',
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                        </div>

                        <Field label="Catatan" error={form.errors.note}>
                            <textarea
                                value={form.data.note}
                                onChange={(e) =>
                                    form.setData('note', e.target.value)
                                }
                                rows={3}
                                className="border-input placeholder:text-muted-foreground min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none"
                            />
                        </Field>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button asChild variant="outline">
                        <Link href={`/rentals/${rental.id}`}>Batal</Link>
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={form.processing}
                    >
                        <Save className="size-4" />
                        Simpan
                    </Button>
                </div>
            </form>
        </>
    );
}

RentalUbah.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Penyewaan', href: '/rentals' },
            { title: 'Edit', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);

export default RentalUbah;
