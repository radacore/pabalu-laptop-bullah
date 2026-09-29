import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, ImageIcon } from 'lucide-react';
import StatusBadge from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { Laptop } from '@/types';

interface LaptopShowHalamanProps {
    laptop: Laptop;
}

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

function formatCurrency(value: number | string | null | undefined) {
    return currencyFormatter.format(Number(value ?? 0));
}

function detailValue(value: string | number | null | undefined) {
    return value === null || value === undefined || value === '' ? '-' : value;
}

function LaptopShow({ laptop }: LaptopShowHalamanProps) {
    const specification = laptop.specification;
    const margin =
        Number(laptop.selling_price ?? 0) -
        Number(laptop.cost_price ?? 0) -
        Number(laptop.repair_cost ?? 0);
    const specificationRows = [
        ['Prosesor', specification?.processor],
        ['RAM', specification?.ram],
        ['Storage', specification?.storage],
        ['GPU/Grafis', specification?.graphics],
        ['Layar', specification?.display],
        ['Sistem Operasi', specification?.operating_system],
        ['Baterai', specification?.battery],
        ['Kondisi', specification?.condition],
    ];
    const photos = laptop.photos ?? [];

    return (
        <>
            <Head title={laptop.name ?? undefined} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {laptop.brand?.name} {laptop.model}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                SKU: {laptop.sku}
                                {laptop.name && ` - ${laptop.name}`}
                            </p>
                        </div>
                        <StatusBadge
                            status={laptop.status}
                            className="text-sm"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/laptops">
                                <ArrowLeft className="size-4" />
                                Kembali ke Daftar
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/laptops/${laptop.id}/edit`}>
                                <Edit className="size-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </header>

                <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border shadow-sm">
                        <CardHeader>
                            <CardTitle>Spesifikasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="divide-y rounded-lg border">
                                {specificationRows.map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4"
                                    >
                                        <dt className="text-muted-foreground text-sm font-medium">
                                            {label}
                                        </dt>
                                        <dd className="text-sm sm:col-span-2">
                                            {detailValue(value)}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border shadow-sm">
                        <CardHeader>
                            <CardTitle>Harga & Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <div className="text-muted-foreground text-sm">
                                    Harga Jual
                                </div>
                                <div className="mt-1 text-2xl font-semibold tracking-tight">
                                    {formatCurrency(laptop.selling_price)}
                                </div>
                            </div>
                            <dl className="space-y-3 text-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-muted-foreground">
                                        Harga Modal
                                    </dt>
                                    <dd className="font-medium">
                                        {formatCurrency(laptop.cost_price)}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-muted-foreground">
                                        Biaya Perbaikan
                                    </dt>
                                    <dd className="font-medium">
                                        {formatCurrency(laptop.repair_cost)}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4 border-t pt-3">
                                    <dt className="text-muted-foreground">
                                        Margin
                                    </dt>
                                    <dd className="font-semibold">
                                        {formatCurrency(margin)}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4 border-t pt-3">
                                    <dt className="text-muted-foreground">
                                        Status
                                    </dt>
                                    <dd>
                                        <StatusBadge status={laptop.status} />
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-muted-foreground">
                                        Source
                                    </dt>
                                    <dd className="font-medium">
                                        {laptop.source?.name ?? '-'}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </section>

                {photos.length > 0 && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border shadow-sm">
                        <CardHeader>
                            <CardTitle>Foto</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {photos.map((photo) => (
                                <figure
                                    key={photo.id}
                                    className="bg-muted/30 overflow-hidden rounded-xl border"
                                >
                                    <img
                                        src={photo.file_path}
                                        alt={
                                            photo.caption ??
                                            laptop.name ??
                                            undefined
                                        }
                                        className="aspect-video w-full object-cover"
                                    />
                                    {photo.caption && (
                                        <figcaption className="text-muted-foreground px-3 py-2 text-sm">
                                            {photo.caption}
                                        </figcaption>
                                    )}
                                </figure>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {photos.length === 0 && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border border-dashed shadow-sm">
                        <CardContent className="text-muted-foreground flex items-center gap-3 p-6 text-sm">
                            <ImageIcon className="size-5" />
                            Belum ada foto untuk laptop ini.
                        </CardContent>
                    </Card>
                )}

                {(laptop.description || laptop.internal_note) && (
                    <section className="grid gap-4 lg:grid-cols-2">
                        {laptop.description && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border shadow-sm">
                                <CardHeader>
                                    <CardTitle>Deskripsi</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-sm leading-6 whitespace-pre-wrap">
                                        {laptop.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                        {laptop.internal_note && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border shadow-sm">
                                <CardHeader>
                                    <CardTitle>Catatan Internal</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-sm leading-6 whitespace-pre-wrap">
                                        {laptop.internal_note}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </section>
                )}

                {laptop.financial_transactions &&
                    laptop.financial_transactions.length > 0 && (
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border shadow-sm">
                            <CardHeader>
                                <CardTitle>Transaksi Penjualan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-muted-foreground px-4 py-3 font-semibold">
                                                    Kode
                                                </th>
                                                <th className="text-muted-foreground px-4 py-3 font-semibold">
                                                    Tipe
                                                </th>
                                                <th className="text-muted-foreground px-4 py-3 font-semibold">
                                                    Tanggal
                                                </th>
                                                <th className="text-muted-foreground px-4 py-3 font-semibold">
                                                    Jumlah
                                                </th>
                                                <th className="text-muted-foreground px-4 py-3 font-semibold">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {laptop.financial_transactions.map(
                                                (ft) => (
                                                    <tr
                                                        key={ft.id}
                                                        className="hover:bg-muted/30 transition-colors"
                                                    >
                                                        <td className="px-4 py-3 font-mono text-sm font-medium">
                                                            {
                                                                ft.transaction_code
                                                            }
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                                    ft.type ===
                                                                    'income'
                                                                        ? 'bg-emerald-50 text-emerald-700'
                                                                        : 'bg-rose-50 text-rose-700'
                                                                }`}
                                                            >
                                                                {ft.type ===
                                                                'income'
                                                                    ? 'Pemasukan'
                                                                    : 'Pengeluaran'}
                                                            </span>
                                                        </td>
                                                        <td className="text-muted-foreground px-4 py-3">
                                                            {new Intl.DateTimeFormat(
                                                                'id-ID',
                                                                {
                                                                    dateStyle:
                                                                        'medium',
                                                                },
                                                            ).format(
                                                                new Date(
                                                                    ft.transaction_date,
                                                                ),
                                                            )}
                                                        </td>
                                                        <td
                                                            className={`px-4 py-3 font-bold tabular-nums ${
                                                                ft.type ===
                                                                'income'
                                                                    ? 'text-emerald-700'
                                                                    : 'text-rose-700'
                                                            }`}
                                                        >
                                                            {ft.type ===
                                                            'income'
                                                                ? '+'
                                                                : '−'}{' '}
                                                            {new Intl.NumberFormat(
                                                                'id-ID',
                                                                {
                                                                    style: 'currency',
                                                                    currency:
                                                                        'IDR',
                                                                    maximumFractionDigits: 0,
                                                                },
                                                            ).format(
                                                                Number(
                                                                    ft.amount ??
                                                                        0,
                                                                ),
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Link
                                                                href={`/financial-transactions/${ft.id}`}
                                                                className="inline-flex items-center rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                                                            >
                                                                Lihat
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
            </div>
        </>
    );
}

LaptopShow.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: dashboard() },
            { title: 'Inventaris', href: '/laptops' },
            { title: 'Laptop Detail', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);

export default LaptopShow;
