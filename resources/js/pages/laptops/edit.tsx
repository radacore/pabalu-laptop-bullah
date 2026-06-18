import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes';
import type { Brand, Laptop, LaptopSource } from '@/types';

interface LaptopEditHalamanProps {
    laptop: Laptop;
    brands: Brand[];
    sources: LaptopSource[];
}

const textareaClass =
    'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50';

const emptySelectValue = '__pabalu__empty__';

function nullableString(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value);
}

function toTanggalInput(value: string | null | undefined): string {
    if (!value) return '';
    return value.split('T')[0] ?? '';
}

export default function LaptopEdit({
    laptop,
    brands,
    sources,
}: LaptopEditHalamanProps) {
    const form = useForm({
        sku: laptop.sku ?? '',
        name: nullableString(laptop.name),
        brand_id: laptop.brand_id ? String(laptop.brand_id) : '',
        model: laptop.model ?? '',
        laptop_source_id: laptop.laptop_source_id
            ? String(laptop.laptop_source_id)
            : '',
        purchase_date: toTanggalInput(
            laptop.purchase_date as string | null | undefined,
        ),
        cost_price: String(laptop.cost_price ?? ''),
        selling_price: String(laptop.selling_price ?? ''),
        repair_cost: String(
            (laptop.repair_cost ?? '') as
                | string
                | number
                | null,
        ),
        mines: nullableString(laptop.mines),
        specification: {
            other_specifications: nullableString(
                laptop.specification?.other_specifications,
            ),
        },
    });

    function submit(event: { preventDefault: () => void }) {
        event.preventDefault();
        form.put(`/laptops/${laptop.id}`);
    }

    return (
        <>
            <Head title={`Edit Laptop — ${laptop.sku}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Edit Laptop
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {laptop.sku} — {laptop.brand?.name || 'N/A'} {laptop.model}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={`/laptops/${laptop.id}`}>
                            <ArrowLeft className="size-4" />
                            Kembali
                        </Link>
                    </Button>
                </header>

                <form onSubmit={submit} className="space-y-6">
                    <input type="hidden" value={form.data.sku} readOnly />
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Produk</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">SN (Opsional)</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    placeholder="Serial number laptop"
                                />
                                <InputError message={form.errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="brand_id">Merek</Label>
                                <Select
                                    value={form.data.brand_id || emptySelectValue}
                                    onValueChange={(value) =>
                                        form.setData(
                                            'brand_id',
                                            value === emptySelectValue
                                                ? ''
                                                : value,
                                        )
                                    }
                                >
                                    <SelectTrigger id="brand_id">
                                        <SelectValue placeholder="Pilih merek" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={emptySelectValue}>
                                            —
                                        </SelectItem>
                                        {brands.map((brand) => (
                                            <SelectItem
                                                key={brand.id}
                                                value={String(brand.id)}
                                            >
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.brand_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="model">Model / Series</Label>
                                <Input
                                    id="model"
                                    value={form.data.model}
                                    onChange={(event) =>
                                        form.setData('model', event.target.value)
                                    }
                                />
                                <InputError message={form.errors.model} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="laptop_source_id">Sumber</Label>
                                <Select
                                    value={
                                        form.data.laptop_source_id ||
                                        emptySelectValue
                                    }
                                    onValueChange={(value) =>
                                        form.setData(
                                            'laptop_source_id',
                                            value === emptySelectValue
                                                ? ''
                                                : value,
                                        )
                                    }
                                >
                                    <SelectTrigger id="laptop_source_id">
                                        <SelectValue placeholder="Pilih sumber" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={emptySelectValue}>
                                            —
                                        </SelectItem>
                                        {sources.map((source) => (
                                            <SelectItem
                                                key={source.id}
                                                value={String(source.id)}
                                            >
                                                {source.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={form.errors.laptop_source_id}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Harga &amp; Status</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="purchase_date">
                                    Tanggal Pembelian
                                </Label>
                                <Input
                                    id="purchase_date"
                                    type="date"
                                    value={form.data.purchase_date}
                                    onChange={(event) =>
                                        form.setData(
                                            'purchase_date',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.purchase_date} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cost_price">
                                    Harga Pengambilan
                                </Label>
                                <Input
                                    id="cost_price"
                                    type="number"
                                    min={0}
                                    value={form.data.cost_price}
                                    onChange={(event) =>
                                        form.setData(
                                            'cost_price',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.cost_price} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="selling_price">Harga Jual</Label>
                                <Input
                                    id="selling_price"
                                    type="number"
                                    min={0}
                                    value={form.data.selling_price}
                                    onChange={(event) =>
                                        form.setData(
                                            'selling_price',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.selling_price} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="repair_cost">Ongkos Jadi</Label>
                                <Input
                                    id="repair_cost"
                                    type="number"
                                    min={0}
                                    value={form.data.repair_cost}
                                    onChange={(event) =>
                                        form.setData(
                                            'repair_cost',
                                            event.target.value,
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Biaya perbaikan / reparasi unit.
                                </p>
                                <InputError message={form.errors.repair_cost} />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="mines">
                                    Keterangan Mines (Opsional)
                                </Label>
                                <textarea
                                    id="mines"
                                    className={textareaClass}
                                    value={form.data.mines}
                                    onChange={(event) =>
                                        form.setData('mines', event.target.value)
                                    }
                                />
                                <InputError message={form.errors.mines} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Spesifikasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <textarea
                                id="other_specifications"
                                className={textareaClass}
                                value={form.data.specification.other_specifications}
                                onChange={(event) =>
                                    form.setData('specification', {
                                        other_specifications: event.target.value,
                                    })
                                }
                            />
                            <InputError
                                message={form.errors['specification.other_specifications']}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href={`/laptops/${laptop.id}`}>Batal</Link>
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            <Save className="size-4" />
                            Simpan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

LaptopEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Inventaris', href: '/laptops' },
        { title: 'Edit Laptop', href: '' },
    ],
};
