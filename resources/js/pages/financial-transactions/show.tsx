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
import type { FinancialTransaction } from '@/types';

interface Props {
    transaction: FinancialTransaction;
}

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
    return rupiahFormatter.format(value);
}

function formatTanggal(value: string) {
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
    }).format(new Date(value));
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
                            Accounting & Cashflow
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {transaction.transaction_code}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Transaction detail and related accounting metadata.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/financial-transactions">
                                Back to Transactions
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link
                                href={`/financial-transactions/${transaction.id}/edit`}
                            >
                                Edit Transaction
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <CardTitle>Transaction Summary</CardTitle>
                                <CardDescription>
                                    Posted on{' '}
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
                                label="Code"
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
                                value={transaction.paymentMethod?.name ?? '-'}
                            />
                            <DetailItem
                                label="Related Tipe"
                                value={transaction.related_type ?? '-'}
                            />
                            <DetailItem
                                label="Related ID"
                                value={
                                    transaction.related_id?.toString() ?? '-'
                                }
                            />
                            <DetailItem
                                label="Dibuat By"
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
