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
import type { MasterData } from '@/types';

interface Props {
    types: MasterData[];
    conditions: string[];
}

type SparepartForm = {
    sku: string;
    name: string;
    sparepart_type_id: string;
    condition: string;
    stock: string;
    cost_price: string;
    selling_price: string;
    description: string;
    is_active: boolean;
};

const inputClass =
    'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50';

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

function SparepartBuat({ types, conditions }: Props) {
    const form = useForm<SparepartForm>({
        sku: '',
        name: '',
        sparepart_type_id: '',
        condition: 'baru',
        stock: '',
        cost_price: '',
        selling_price: '',
        description: '',
        is_active: true,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/spareparts');
    }

    return (
        <>
            <Head title="Tambah Sparepart" />
            <form
                onSubmit={submit}
                className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4"
            >
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Tambah Sparepart
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Catat stok sparepart baru atau bekas untuk dijual
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/spareparts">
                            <ArrowLeft className="size-4" />
                            Kembali
                        </Link>
                    </Button>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Sparepart</CardTitle>
                        <CardDescription>
                            SKU boleh dikosongkan, sistem buatkan otomatis.
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
                                    placeholder="Baterai Lenovo ThinkPad T480"
                                    required
                                />
                            </Field>
                            <Field
                                label="SKU (opsional)"
                                error={form.errors.sku}
                            >
                                <Input
                                    value={form.data.sku}
                                    onChange={(e) =>
                                        form.setData('sku', e.target.value)
                                    }
                                    placeholder="Otomatis bila kosong"
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
                                            e.target.value,
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
                                    placeholder="0"
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
                                    placeholder="0"
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
                                    placeholder="0"
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
                                placeholder="Kondisi fisik, kompatibilitas, garansi..."
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
                        <Link href="/spareparts">Batal</Link>
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        <Save className="size-4" />
                        Simpan Sparepart
                    </Button>
                </div>
            </form>
        </>
    );
}

SparepartBuat.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Sparepart', href: '/spareparts' },
            { title: 'Tambah', href: '/spareparts/create' },
        ]}
    >
        {page}
    </AppLayout>
);

export default SparepartBuat;
