import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/shared/input-error';
import StatusBadge from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatTanggalWaktu } from '@/lib/format';
import type { Customer, Laptop, Rental, RentalStatus } from '@/types';

interface Props {
    rental: Rental & {
        customer?: Customer | null;
        laptop?: Laptop | null;
        financial_transactions?: Array<{
            id: number;
            transaction_code: string;
            type: string;
            amount: number | string;
            transaction_date: string;
            description?: string | null;
        }>;
    };
    customers: Customer[];
    statuses: RentalStatus[];
    laptops: Laptop[];
}

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="grid gap-1">
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                {label}
            </dt>
            <dd className="text-sm text-slate-900">{value}</dd>
        </div>
    );
}

const inputClass =
    'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]';

function RentalLihat({ rental, statuses }: Props) {
    const statusForm = useForm({
        rental_status_id: rental.rental_status_id
            ? String(rental.rental_status_id)
            : '',
        returned_at: rental.returned_at ? rental.returned_at.slice(0, 16) : '',
        deposit_returned: Boolean(rental.deposit_returned),
        deposit: String(rental.deposit ?? ''),
        paid_amount: String(rental.paid_amount ?? ''),
        payment_status: rental.payment_status ?? 'unpaid',
    });

    function submitStatus(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        statusForm.put(`/rentals/${rental.id}`, {
            preserveScroll: true,
        });
    }

    const transactions = rental.financial_transactions ?? [];

    return (
        <>
            <Head title={rental.rental_code} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {rental.rental_code}
                            </h1>
                            <StatusBadge status={rental.status} />
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Tracking: {rental.tracking_code}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/rentals">
                                <ArrowLeft className="size-4" />
                                Kembali
                            </Link>
                        </Button>
                        <Button variant="primary" asChild>
                            <Link href={`/rentals/${rental.id}/edit`}>
                                <Edit className="size-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Penyewaan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                <DetailRow
                                    label="Pelanggan"
                                    value={rental.customer?.name ?? '-'}
                                />
                                <DetailRow
                                    label="Unit"
                                    value={
                                        rental.laptop
                                            ? `${rental.laptop.brand?.name ?? ''} ${rental.laptop.model ?? rental.laptop.name ?? ''} (${rental.laptop.sku})`
                                            : '-'
                                    }
                                />
                                <DetailRow
                                    label="Mulai Sewa"
                                    value={formatTanggalWaktu(rental.rented_at)}
                                />
                                <DetailRow
                                    label="Jatuh Tempo"
                                    value={formatTanggalWaktu(rental.due_at)}
                                />
                                <DetailRow
                                    label="Dikembalikan"
                                    value={formatTanggalWaktu(
                                        rental.returned_at,
                                    )}
                                />
                                <DetailRow
                                    label="Tarif / Hari"
                                    value={formatCurrency(rental.daily_rate)}
                                />
                                <DetailRow
                                    label="Deposit"
                                    value={`${formatCurrency(rental.deposit)}${rental.deposit_returned ? ' (dikembalikan)' : ''}`}
                                />
                                <DetailRow
                                    label="Total"
                                    value={
                                        rental.total_cost != null
                                            ? `${formatCurrency(rental.total_cost)}${rental.total_days != null ? ` (${rental.total_days} hari)` : ''}`
                                            : '-'
                                    }
                                />
                            </dl>
                            {rental.note ? (
                                <p className="text-muted-foreground mt-4 text-sm whitespace-pre-line">
                                    {rental.note}
                                </p>
                            ) : null}
                        </CardContent>
                    </Card>

                    <div className="grid content-start gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ubah Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={submitStatus}
                                    className="grid gap-4"
                                >
                                    <div className="grid gap-2">
                                        <Label>Status</Label>
                                        <select
                                            value={
                                                statusForm.data.rental_status_id
                                            }
                                            onChange={(e) =>
                                                statusForm.setData(
                                                    'rental_status_id',
                                                    e.target.value,
                                                )
                                            }
                                            className={`${inputClass} admin-select`}
                                        >
                                            <option value="">—</option>
                                            {statuses.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={
                                                statusForm.errors
                                                    .rental_status_id
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Tanggal Kembali</Label>
                                        <input
                                            type="datetime-local"
                                            value={statusForm.data.returned_at}
                                            onChange={(e) =>
                                                statusForm.setData(
                                                    'returned_at',
                                                    e.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        />
                                        <InputError
                                            message={
                                                statusForm.errors.returned_at
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label>Deposit (Rp)</Label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={statusForm.data.deposit}
                                                onChange={(e) =>
                                                    statusForm.setData(
                                                        'deposit',
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                            />
                                            <InputError
                                                message={
                                                    statusForm.errors.deposit
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Dibayar (Rp)</Label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={
                                                    statusForm.data.paid_amount
                                                }
                                                onChange={(e) =>
                                                    statusForm.setData(
                                                        'paid_amount',
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                            />
                                            <InputError
                                                message={
                                                    statusForm.errors
                                                        .paid_amount
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <div className="grid gap-2">
                                            <Label>Status Bayar</Label>
                                            <select
                                                value={
                                                    statusForm.data
                                                        .payment_status
                                                }
                                                onChange={(e) =>
                                                    statusForm.setData(
                                                        'payment_status',
                                                        e.target.value,
                                                    )
                                                }
                                                className={`${inputClass} admin-select`}
                                            >
                                                <option value="unpaid">
                                                    Belum bayar
                                                </option>
                                                <option value="partial">
                                                    Sebagian (DP/angsuran)
                                                </option>
                                                <option value="paid">
                                                    Lunas
                                                </option>
                                            </select>
                                        </div>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    statusForm.data
                                                        .deposit_returned
                                                }
                                                onChange={(e) =>
                                                    statusForm.setData(
                                                        'deposit_returned',
                                                        e.target.checked,
                                                    )
                                                }
                                                className="size-4"
                                            />
                                            Deposit sudah dikembalikan
                                        </label>
                                        <InputError
                                            message={
                                                statusForm.errors
                                                    .deposit_returned
                                            }
                                        />
                                        <InputError
                                            message={
                                                statusForm.errors.payment_status
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={statusForm.processing}
                                    >
                                        Simpan Status
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Transaksi Terkait</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {transactions.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">
                                        Belum ada transaksi tercatat (dibuat
                                        otomatis saat status selesai).
                                    </p>
                                ) : (
                                    <ul className="grid gap-3">
                                        {transactions.map((t) => (
                                            <li
                                                key={t.id}
                                                className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                                            >
                                                <div>
                                                    <p className="font-medium">
                                                        {t.transaction_code}
                                                    </p>
                                                    <p className="text-muted-foreground text-xs">
                                                        {t.description ??
                                                            t.type}
                                                    </p>
                                                </div>
                                                <p className="font-semibold">
                                                    {formatCurrency(t.amount)}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

RentalLihat.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Penyewaan', href: '/rentals' },
            { title: 'Detail', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);

export default RentalLihat;
