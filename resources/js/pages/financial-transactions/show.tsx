import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatCurrency, formatTanggal } from '@/lib/format';
import type { FinancialTransaction } from '@/types';

interface Props {
    transaction: FinancialTransaction;
}

function TransactionTipeBadge({
    type,
}: {
    type: FinancialTransaction['type'];
}) {
    return (
        <Badge
            variant="outline"
            className={
                type === 'income'
                    ? 'border-status-available/30 bg-status-available/10 text-status-available'
                    : 'border-status-error/30 bg-status-error/10 text-status-error'
            }
        >
            {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
        </Badge>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-border bg-muted/30 rounded-lg border p-4">
            <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {label}
            </dt>
            <dd className="text-foreground mt-2 text-sm font-medium">
                {value}
            </dd>
        </div>
    );
}

export default function ShowFinancialTransaction({ transaction }: Props) {
    return (
        <>
            <Head title={transaction.transaction_code} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-primary">
                            Akuntansi & Arus Kas
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {transaction.transaction_code}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Detail transaksi dan metadata akuntansi terkait.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/financial-transactions">
                                Kembali ke Transaksi
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link
                                href={`/financial-transactions/${transaction.id}/edit`}
                            >
                                Ubah Transaksi
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <CardTitle>Ringkasan Transaksi</CardTitle>
                                <CardDescription>
                                    Tercatat pada{' '}
                                    {formatTanggal(
                                        transaction.transaction_date,
                                    )}
                                </CardDescription>
                            </div>
                            <TransactionTipeBadge type={transaction.type} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="border-border bg-card rounded-xl border p-6">
                            <p className="text-muted-foreground text-sm">
                                Jumlah
                            </p>
                            <p
                                className={
                                    transaction.type === 'income'
                                        ? 'mt-2 text-3xl font-semibold tracking-tight text-status-available'
                                        : 'mt-2 text-3xl font-semibold tracking-tight text-status-error'
                                }
                            >
                                {formatCurrency(transaction.amount)}
                            </p>
                        </div>

                        <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <DetailItem
                                label="Kode"
                                value={transaction.transaction_code}
                            />
                            <DetailItem
                                label="Tanggal"
                                value={formatTanggal(
                                    transaction.transaction_date,
                                )}
                            />
                            <DetailItem
                                label="Kategori"
                                value={transaction.category?.name ?? '-'}
                            />
                            <DetailItem
                                label="Metode Pembayaran"
                                value={transaction.payment_method?.name ?? '-'}
                            />
                            <DetailItem
                                label="Tipe Terkait"
                                value={transaction.related_type ?? '-'}
                            />
                            <DetailItem
                                label="ID Terkait"
                                value={
                                    transaction.related_id?.toString() ?? '-'
                                }
                            />
                            <DetailItem
                                label="Dibuat Oleh"
                                value={transaction.created_by.toString()}
                            />
                        </dl>

                        <div className="border-border bg-muted/30 rounded-lg border p-4">
                            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                Deskripsi
                            </p>
                            <p className="text-foreground mt-2 text-sm leading-6">
                                {transaction.description || '-'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
