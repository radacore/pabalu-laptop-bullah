import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, ImageIcon } from 'lucide-react';
import StatusBadge from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function LaptopShow({ laptop }: LaptopShowHalamanProps) {
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
                            <p className="text-sm text-muted-foreground">
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
                    <Card className="border-sidebar-border/70 shadow-sm dark:border-sidebar-border">
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
                                        <dt className="text-sm font-medium text-muted-foreground">
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

                    <Card className="border-sidebar-border/70 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Harga & Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <div className="text-sm text-muted-foreground">
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
                    <Card className="border-sidebar-border/70 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Foto</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {photos.map((photo) => (
                                <figure
                                    key={photo.id}
                                    className="overflow-hidden rounded-xl border bg-muted/30"
                                >
                                    <img
                                        src={photo.file_path}
                                        alt={photo.caption ?? laptop.name ?? undefined}
                                        className="aspect-video w-full object-cover"
                                    />
                                    {photo.caption && (
                                        <figcaption className="px-3 py-2 text-sm text-muted-foreground">
                                            {photo.caption}
                                        </figcaption>
                                    )}
                                </figure>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {photos.length === 0 && (
                    <Card className="border-dashed border-sidebar-border/70 shadow-sm dark:border-sidebar-border">
                        <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
                            <ImageIcon className="size-5" />
                            Tidak photos have been uploaded for this laptop.
                        </CardContent>
                    </Card>
                )}

                {(laptop.description || laptop.internal_note) && (
                    <section className="grid gap-4 lg:grid-cols-2">
                        {laptop.description && (
                            <Card className="border-sidebar-border/70 shadow-sm dark:border-sidebar-border">
                                <CardHeader>
                                    <CardTitle>Deskripsi</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
                                        {laptop.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                        {laptop.internal_note && (
                            <Card className="border-sidebar-border/70 shadow-sm dark:border-sidebar-border">
                                <CardHeader>
                                    <CardTitle>Catatan Internal</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
                                        {laptop.internal_note}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </section>
                )}
            </div>
        </>
    );
}

LaptopShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Inventaris', href: '/laptops' },
        { title: 'Laptop Detail', href: '#' },
    ],
};
