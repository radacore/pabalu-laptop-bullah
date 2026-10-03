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
import type { Customer, Laptop, RentalStatus } from '@/types';

interface Props {
    customers: Customer[];
    laptops: Laptop[];
    statuses: RentalStatus[];
}

type RentalForm = {
    customer_id: string;
    laptop_id: string;
    rental_status_id: string;
    daily_rate: string;
    deposit: string;
    rented_at: string;
    due_at: string;
    payment_status: string;
    note: string;
};

const inputClass =
    'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50';

const todayInput = new Date().toISOString().slice(0, 16);
const nextWeekInput = new Date(Date.now() + 7 * 86400000)
    .toISOString()
    .slice(0, 16);

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

function RentalBuat({ customers, laptops, statuses }: Props) {
    const form = useForm<RentalForm>({
        customer_id: '',
        laptop_id: '',
        rental_status_id: '',
        daily_rate: '',
        deposit: '',
        rented_at: todayInput,
        due_at: nextWeekInput,
        payment_status: 'unpaid',
        note: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/rentals');
    }

    return (
        <>
            <Head title="Sewa Baru" />
            <form
                onSubmit={submit}
                className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4"
            >
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Sewa Baru
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Catat penyewaan unit laptop oleh pelanggan
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/rentals">
                            <ArrowLeft className="size-4" />
                            Kembali
                        </Link>
                    </Button>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Penyewaan</CardTitle>
                        <CardDescription>
                            Unit harus berstatus Tersedia. Status unit otomatis
                            dikunci (Disewa) saat penyewaan aktif.
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
                            <Field label="Unit" error={form.errors.laptop_id}>
                                <select
                                    value={form.data.laptop_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'laptop_id',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                    required
                                >
                                    <option value="">Pilih unit</option>
                                    {laptops.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.brand?.name ?? ''} {l.model} (
                                            {l.sku})
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
                                    placeholder="100000"
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
                                    placeholder="0"
                                />
                            </Field>
                            <Field
                                label="Status Awal"
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
                                    <option value="">Otomatis (pertama)</option>
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
                                    required
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
                        </div>

                        <Field label="Catatan" error={form.errors.note}>
                            <textarea
                                value={form.data.note}
                                onChange={(e) =>
                                    form.setData('note', e.target.value)
                                }
                                placeholder="Catatan internal (kondisi unit, kesepakatan, dsb.)"
                                rows={3}
                                className="border-input placeholder:text-muted-foreground min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none"
                            />
                        </Field>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button asChild variant="outline">
                        <Link href="/rentals">Batal</Link>
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={form.processing}
                    >
                        <Save className="size-4" />
                        Simpan Penyewaan
                    </Button>
                </div>
            </form>
        </>
    );
}

RentalBuat.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Penyewaan', href: '/rentals' },
            { title: 'Sewa Baru', href: '/rentals/create' },
        ]}
    >
        {page}
    </AppLayout>
);

export default RentalBuat;
