import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, ImageIcon, ImagePlus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import DeleteDialog from '@/components/shared/delete-dialog';
import InputError from '@/components/shared/input-error';
import StatusBadge from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { dashboard } from '@/routes';
import type { Laptop, LaptopPhoto } from '@/types';

interface LaptopShowHalamanProps {
    laptop: Laptop;
}

function LaptopShow({ laptop }: LaptopShowHalamanProps) {
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoCaption, setPhotoCaption] = useState('');
    const [photoErrors, setPhotoErrors] = useState<{
        photo?: string;
        caption?: string;
    }>({});
    const [photoToDelete, setPhotoToDelete] = useState<LaptopPhoto | null>(
        null,
    );
    const margin =
        Number(laptop.selling_price ?? 0) -
        Number(laptop.cost_price ?? 0) -
        Number(laptop.repair_cost ?? 0);
    const photos = laptop.photos ?? [];

    function submitPhoto(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!photoFile) {
            return;
        }

        router.post(
            `/laptops/${laptop.id}/photos`,
            { photo: photoFile, caption: photoCaption || undefined },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setPhotoFile(null);
                    setPhotoCaption('');
                    setPhotoErrors({});
                },
                onError: (errors) =>
                    setPhotoErrors({
                        photo: errors.photo,
                        caption: errors.caption,
                    }),
            },
        );
    }

    function confirmDeletePhoto() {
        if (!photoToDelete) {
            return;
        }

        router.delete(
            `/laptops/${laptop.id}/photos/${photoToDelete.id}`,
            {
                preserveScroll: true,
                onFinish: () => {
                    setPhotoToDelete(null);
                },
            },
        );
    }

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

                <section className="grid gap-4">
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

                <Card className="border-sidebar-border/70 dark:border-sidebar-border shadow-sm">
                    <CardHeader>
                        <CardTitle>Foto Laptop</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {photos.length === 0 ? (
                            <p className="text-muted-foreground flex items-center gap-3 text-sm">
                                <ImageIcon className="size-5" />
                                Belum ada foto untuk laptop ini.
                            </p>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {photos.map((photo) => (
                                    <div
                                        key={photo.id}
                                        className="group relative overflow-hidden rounded-lg border"
                                    >
                                        <img
                                            src={`/storage/${photo.file_path}`}
                                            alt={
                                                photo.caption ??
                                                laptop.model
                                            }
                                            className="aspect-square w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPhotoToDelete(photo)
                                            }
                                            className="absolute top-1 right-1 hidden rounded-md bg-red-600 p-1.5 text-white group-hover:block"
                                            aria-label="Hapus foto"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                        {photo.caption && (
                                            <p className="text-muted-foreground px-2 py-1.5 text-xs">
                                                {photo.caption}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <form
                            onSubmit={submitPhoto}
                            className="grid gap-3 rounded-lg border border-dashed p-4"
                        >
                            <div className="grid gap-2">
                                <Label>Upload foto</Label>
                                <Input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={(e) => {
                                        setPhotoFile(
                                            e.target.files?.[0] ?? null,
                                        );
                                        setPhotoErrors({});
                                    }}
                                />
                                <InputError message={photoErrors.photo} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Caption (opsional)</Label>
                                <Input
                                    value={photoCaption}
                                    onChange={(e) =>
                                        setPhotoCaption(e.target.value)
                                    }
                                    placeholder="Tampak depan"
                                />
                                <InputError message={photoErrors.caption} />
                            </div>
                            <Button
                                type="submit"
                                variant="outline"
                                disabled={!photoFile}
                            >
                                <ImagePlus className="size-4" />
                                Unggah Foto
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <DeleteDialog
                    open={photoToDelete !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setPhotoToDelete(null);
                        }
                    }}
                    onKonfirmasi={confirmDeletePhoto}
                    title="Hapus foto?"
                    description="Foto akan dihapus permanen dari laptop ini."
                />

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
