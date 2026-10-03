import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Edit, ImagePlus, Trash2 } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import DeleteDialog from '@/components/shared/delete-dialog';
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
import type {
    Customer,
    MasterData,
    PaymentMethod,
    Sparepart,
    SparepartPhoto,
    SparepartSale,
} from '@/types';

interface Props {
    sparepart: Sparepart & {
        type?: MasterData | null;
        photos?: SparepartPhoto[];
        sales?: Array<SparepartSale & { customer?: Customer | null }>;
        financial_transactions?: Array<{
            id: number;
            transaction_code: string;
            type: string;
            amount: number | string;
            transaction_date: string;
        }>;
    };
    types: MasterData[];
    conditions: string[];
    customers: Customer[];
    payment_methods: PaymentMethod[];
}

function formatRupiah(value?: string | number | null) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
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

function SparepartLihat({ sparepart, customers, payment_methods }: Props) {
    const [photoCaption, setPhotoCaption] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoToDelete, setPhotoToDelete] = useState<SparepartPhoto | null>(
        null,
    );
    const [photoErrors, setPhotoErrors] = useState<{
        photo?: string;
        caption?: string;
    }>({});

    const saleForm = useForm({
        customer_id: '',
        sparepart_id: String(sparepart.id),
        quantity: '1',
        payment_method_id: '',
        sold_at: '',
        note: '',
    });

    function submitPhoto(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!photoFile) {
            return;
        }

        router.post(
            `/spareparts/${sparepart.id}/photos`,
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

        // Gagal hapus dikirim backend sebagai flash toast error global.
        router.delete(
            `/spareparts/${sparepart.id}/photos/${photoToDelete.id}`,
            {
                preserveScroll: true,
                onFinish: () => {
                    setPhotoToDelete(null);
                },
            },
        );
    }

    function submitSale(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        saleForm.post('/sparepart-sales', { preserveScroll: true });
    }

    const photos = sparepart.photos ?? [];
    const sales = sparepart.sales ?? [];
    const transactions = sparepart.financial_transactions ?? [];

    return (
        <>
            <Head title={sparepart.name} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {sparepart.name}
                            </h1>
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    sparepart.condition === 'baru'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-amber-100 text-amber-800'
                                }`}
                            >
                                {sparepart.condition === 'baru'
                                    ? 'Baru'
                                    : 'Bekas'}
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {sparepart.sku} · Stok: {sparepart.stock} ·{' '}
                            {formatRupiah(sparepart.selling_price)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/spareparts">
                                <ArrowLeft className="size-4" />
                                Kembali
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/spareparts/${sparepart.id}/edit`}>
                                <Edit className="size-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Foto Produk</CardTitle>
                            <CardDescription>
                                Galeri multi-foto seperti laptop.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {photos.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    Belum ada foto.
                                </p>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    {photos.map((p) => (
                                        <div
                                            key={p.id}
                                            className="group relative overflow-hidden rounded-lg border"
                                        >
                                            <img
                                                src={`/storage/${p.file_path}`}
                                                alt={
                                                    p.caption ?? sparepart.name
                                                }
                                                className="aspect-square w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPhotoToDelete(p)
                                                }
                                                className="absolute top-1 right-1 hidden rounded-md bg-red-600 p-1.5 text-white group-hover:block"
                                                aria-label="Hapus foto"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <form
                                onSubmit={submitPhoto}
                                className="grid gap-3 rounded-lg border border-dashed p-4"
                            >
                                <Field
                                    label="Upload foto"
                                    error={photoErrors.photo}
                                >
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
                                </Field>
                                <Field
                                    label="Caption (opsional)"
                                    error={photoErrors.caption}
                                >
                                    <Input
                                        value={photoCaption}
                                        onChange={(e) =>
                                            setPhotoCaption(e.target.value)
                                        }
                                        placeholder="Tampak depan"
                                    />
                                </Field>
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Catat Penjualan</CardTitle>
                            <CardDescription>
                                Stok berkurang otomatis + jurnal pendapatan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitSale} className="grid gap-4">
                                <Field
                                    label="Pelanggan (opsional)"
                                    error={saleForm.errors.customer_id}
                                >
                                    <select
                                        value={saleForm.data.customer_id}
                                        onChange={(e) =>
                                            saleForm.setData(
                                                'customer_id',
                                                e.target.value,
                                            )
                                        }
                                        className={`${inputClass} admin-select`}
                                    >
                                        <option value="">
                                            Walk-in / tanpa pelanggan
                                        </option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} — {c.phone}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                        label="Jumlah"
                                        error={saleForm.errors.quantity}
                                    >
                                        <Input
                                            type="number"
                                            min={1}
                                            max={sparepart.stock}
                                            value={saleForm.data.quantity}
                                            onChange={(e) =>
                                                saleForm.setData(
                                                    'quantity',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="Metode Bayar"
                                        error={
                                            saleForm.errors.payment_method_id
                                        }
                                    >
                                        <select
                                            value={
                                                saleForm.data.payment_method_id
                                            }
                                            onChange={(e) =>
                                                saleForm.setData(
                                                    'payment_method_id',
                                                    e.target.value,
                                                )
                                            }
                                            className={`${inputClass} admin-select`}
                                        >
                                            <option value="">
                                                Default (tunai)
                                            </option>
                                            {payment_methods.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>
                                <Field
                                    label="Catatan"
                                    error={saleForm.errors.note}
                                >
                                    <Input
                                        value={saleForm.data.note}
                                        onChange={(e) =>
                                            saleForm.setData(
                                                'note',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Opsional"
                                    />
                                </Field>
                                <Button
                                    type="submit"
                                    disabled={
                                        saleForm.processing ||
                                        sparepart.stock <= 0
                                    }
                                >
                                    Jual {saleForm.data.quantity || 1} pcs
                                </Button>
                                {sparepart.stock <= 0 && (
                                    <p className="text-sm text-red-600">
                                        Stok habis, tidak bisa dijual.
                                    </p>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Penjualan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {sales.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    Belum ada penjualan tercatat.
                                </p>
                            ) : (
                                <ul className="grid gap-3">
                                    {sales.map((s) => (
                                        <li
                                            key={s.id}
                                            className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {s.sale_code} · {s.quantity}{' '}
                                                    pcs
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {s.customer?.name ??
                                                        'Walk-in'}{' '}
                                                    ·{' '}
                                                    {s.sold_at
                                                        ? new Date(
                                                              s.sold_at,
                                                          ).toLocaleDateString(
                                                              'id-ID',
                                                          )
                                                        : '-'}
                                                </p>
                                            </div>
                                            <p className="font-semibold">
                                                {formatRupiah(s.total_amount)}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Jurnal Terkait</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {transactions.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    Belum ada jurnal terkait produk ini.
                                </p>
                            ) : (
                                <ul className="grid gap-3">
                                    {transactions.map((t) => (
                                        <li
                                            key={t.id}
                                            className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                                        >
                                            <p className="font-medium">
                                                {t.transaction_code}
                                            </p>
                                            <p className="font-semibold">
                                                {formatRupiah(t.amount)}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <DeleteDialog
                open={photoToDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPhotoToDelete(null);
                    }
                }}
                onKonfirmasi={confirmDeletePhoto}
                title="Hapus foto?"
                description="Foto produk akan dihapus permanen dan tidak bisa dikembalikan."
            />
        </>
    );
}

SparepartLihat.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Sparepart', href: '/spareparts' },
            { title: 'Detail', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);

export default SparepartLihat;
