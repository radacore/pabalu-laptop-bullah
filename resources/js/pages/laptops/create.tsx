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
import type { Brand, LaptopSource } from '@/types';

interface LaptopBuatHalamanProps {
    brands: Brand[];
    sources: LaptopSource[];
}

const textareaClass =
    'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50';

const emptySelectValue = '__pabalu__empty__';

export default function LaptopBuat({ brands, sources }: LaptopBuatHalamanProps) {
    const form = useForm({
        name: '',
        brand_id: '',
        model: '',
        laptop_source_id: '',
        purchase_date: '',
        cost_price: '',
        selling_price: '',
        repair_cost: '',
        mines: '',
        specification: {
            other_specifications: '',
        },
    });

    function submit(event: { preventDefault: () => void }) {
        event.preventDefault();
        form.post('/laptops');
    }

    return (
        <>
            <Head title="Tambah Laptop Baru" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Tambah Laptop Baru
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Catat unit laptop yang masuk ke inventaris.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/laptops">
                            <ArrowLeft className="size-4" />
                            Kembali
                        </Link>
                    </Button>
                </header>

                <form onSubmit={submit} className="space-y-6">
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
                                            value === emptySelectValue ? '' : value,
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
                                    placeholder="Contoh: ThinkPad X230"
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
                                    placeholder="0"
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
                                    placeholder="0"
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
                                    placeholder="0"
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
                                    placeholder="Catatan mines / cacat unit (jika ada)"
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
                                placeholder="Tulis spesifikasi unit secara bebas. Contoh: Core i5-3210M / 4GB DDR3 / 320GB HDD / 12.5 inch / Windows 10"
                            />
                            <InputError
                                message={form.errors['specification.other_specifications']}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/laptops">Batal</Link>
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            <Save className="size-4" />
                            Simpan Laptop
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

LaptopBuat.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Inventaris', href: '/laptops' },
        { title: 'Tambah Laptop Baru', href: '/laptops/create' },
    ],
};
