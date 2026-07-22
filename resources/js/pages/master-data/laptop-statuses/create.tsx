import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FloppyDisk } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';

const textareaClass =
    'min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 transition-colors placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500';

const LaptopStatusesCreate = () => {
    const form = useForm({
        name: '',
        color: '',
        is_active: true,
        description: '',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/master-data/laptop-statuses');
    }

    return (
        <>
            <Head title="Tambah Status Laptop" />
            <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
                <header className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Tambah Status Laptop
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Tambahkan label status inventaris baru
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/master-data/laptop-statuses">
                            <ArrowLeft className="mr-2 size-4" weight="bold" />
                            Kembali
                        </Link>
                    </Button>
                </header>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <section className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Nama <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                placeholder="Contoh: Tersedia, Terjual, Garansi"
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="color">Warna</Label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    id="color"
                                    value={form.data.color || '#3b82f6'}
                                    onChange={(event) =>
                                        form.setData(
                                            'color',
                                            event.target.value,
                                        )
                                    }
                                    className="size-10 cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-1"
                                />
                                <Input
                                    value={form.data.color}
                                    onChange={(event) =>
                                        form.setData(
                                            'color',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="#3b82f6 (opsional)"
                                    className="font-mono"
                                />
                            </div>
                            <p className="text-xs text-slate-500">
                                Warna penanda untuk status ini pada tabel dan
                                badge.
                            </p>
                            <InputError message={form.errors.color} />
                        </div>

                        <div className="flex items-center gap-3">
                            <Switch
                                id="is_active"
                                checked={form.data.is_active}
                                onCheckedChange={(checked: boolean) =>
                                    form.setData('is_active', checked)
                                }
                            />
                            <Label htmlFor="is_active">Aktif</Label>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <textarea
                                id="description"
                                className={textareaClass}
                                value={form.data.description}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                placeholder="Deskripsi singkat tentang status ini (opsional)"
                            />
                            <InputError message={form.errors.description} />
                        </div>
                    </section>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/master-data/laptop-statuses">
                                Batal
                            </Link>
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            <FloppyDisk className="mr-2 size-4" weight="bold" />
                            Simpan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

LaptopStatusesCreate.layout = (page: ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: dashboard() },
            { title: 'Data Master', href: '/master-data' },
            { title: 'Status Laptop', href: '/master-data/laptop-statuses' },
            { title: 'Tambah', href: '/master-data/laptop-statuses/create' },
        ]}
    >
        {page}
    </AppLayout>
);

export default LaptopStatusesCreate;
