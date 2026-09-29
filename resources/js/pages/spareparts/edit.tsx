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
import type { MasterData, Sparepart } from '@/types';

interface Props {
    sparepart: Sparepart;
    types: MasterData[];
    conditions: string[];
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

function SparepartUbah({ sparepart, types, conditions }: Props) {
    const form = useForm({
        sku: sparepart.sku ?? '',
        name: sparepart.name ?? '',
        sparepart_type_id: sparepart.sparepart_type_id
            ? String(sparepart.sparepart_type_id)
            : '',
        condition: sparepart.condition ?? 'baru',
        stock: String(sparepart.stock ?? ''),
        cost_price: String(sparepart.cost_price ?? ''),
        selling_price: String(sparepart.selling_price ?? ''),
        description: sparepart.description ?? '',
        is_active: Boolean(sparepart.is_active),
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(`/spareparts/${sparepart.id}`);
    }

    return (
        <>
            <Head title={`Edit ${sparepart.name}`} />
            <form
                onSubmit={submit}
                className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4"
            >
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Edit Sparepart
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {sparepart.sku} — {sparepart.name}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={`/spareparts/${sparepart.id}`}>
                            <ArrowLeft className="size-4" />
                            Kembali
                        </Link>
                    </Button>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Sparepart</CardTitle>
                        <CardDescription>
                            Perubahan harga modal tidak mengubah jurnal lama.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Nama" error={form.errors.name}>
                                <Input
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                    required
                                />
                            </Field>
                            <Field label="SKU" error={form.errors.sku}>
                                <Input
                                    value={form.data.sku}
                                    onChange={(e) =>
                                        form.setData('sku', e.target.value)
                                    }
                                    required
                                />
                            </Field>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <Field
                                label="Tipe"
                                error={form.errors.sparepart_type_id}
                            >
                                <select
                                    value={form.data.sparepart_type_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'sparepart_type_id',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Pilih tipe</option>
                                    {types.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field
                                label="Kondisi"
                                error={form.errors.condition}
                            >
                                <select
                                    value={form.data.condition}
                                    onChange={(e) =>
                                        form.setData(
                                            'condition',
                                            e.target.value as 'baru' | 'bekas',
                                        )
                                    }
                                    className={inputClass}
                                    required
                                >
                                    {conditions.map((c) => (
                                        <option key={c} value={c}>
                                            {c === 'baru' ? 'Baru' : 'Bekas'}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Stok" error={form.errors.stock}>
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.data.stock}
                                    onChange={(e) =>
                                        form.setData('stock', e.target.value)
                                    }
                                    required
                                />
                            </Field>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field
                                label="Harga Modal (Rp)"
                                error={form.errors.cost_price}
                            >
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.data.cost_price}
                                    onChange={(e) =>
                                        form.setData(
                                            'cost_price',
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Harga Jual (Rp)"
                                error={form.errors.selling_price}
                            >
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.data.selling_price}
                                    onChange={(e) =>
                                        form.setData(
                                            'selling_price',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </Field>
                        </div>

                        <Field
                            label="Deskripsi"
                            error={form.errors.description}
                        >
                            <textarea
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData('description', e.target.value)
                                }
                                rows={3}
                                className="border-input placeholder:text-muted-foreground min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none"
                            />
                        </Field>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(e) =>
                                    form.setData('is_active', e.target.checked)
                                }
                                className="size-4"
                            />
                            Tampilkan di katalog publik
                        </label>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button asChild variant="outline">
                        <Link href={`/spareparts/${sparepart.id}`}>Batal</Link>
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        <Save className="size-4" />
                        Simpan
                    </Button>
                </div>
            </form>
        </>
    );
}

SparepartUbah.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Sparepart', href: '/spareparts' },
            { title: 'Edit', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);

export default SparepartUbah;
