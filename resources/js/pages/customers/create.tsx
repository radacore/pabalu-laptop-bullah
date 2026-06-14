import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

type PelangganForm = {
    name: string;
    phone: string;
    address: string;
    note: string;
    create_user_account: boolean;
};

type HalamanComponent = (() => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

function HalamanHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {actions}
        </div>
    );
}

function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return <textarea className={`min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

const PelanggansBuat: HalamanComponent = () => {
    const form = useForm<PelangganForm>({
        name: '',
        phone: '',
        address: '',
        note: '',
        create_user_account: false,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/customers');
    };

    return (
        <>
            <Head title="Tambah Pelanggan" />
            <form onSubmit={submit} className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <HalamanHeader
                    title="Tambah Pelanggan"
                    description="Buat profil pelanggan untuk manajemen service"
                    actions={<Button asChild variant="outline"><Link href="/customers">Kembali</Link></Button>}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Pelanggan</CardTitle>
                        <CardDescription>Simpan informasi kontak dan akses akun opsional.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Nama" error={form.errors.name}>
                                <Input required value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} placeholder="Nama pelanggan" />
                            </Field>
                            <Field label="Telepon" error={form.errors.phone}>
                                <Input required value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} placeholder="Nomor telepon" />
                            </Field>
                        </div>
                        <Field label="Alamat" error={form.errors.address}>
                            <Textarea value={form.data.address} onChange={(event) => form.setData('address', event.target.value)} placeholder="Alamat pelanggan" />
                        </Field>
                        <Field label="Catatan" error={form.errors.note}>
                            <Textarea value={form.data.note} onChange={(event) => form.setData('note', event.target.value)} placeholder="Catatan internal" />
                        </Field>
                        <div className="flex items-center gap-3 rounded-lg border p-4">
                            <Checkbox checked={form.data.create_user_account} onCheckedChange={(checked) => form.setData('create_user_account', checked === true)} id="create_user_account" />
                            <div className="grid gap-1">
                                <Label htmlFor="create_user_account">Buat Akun User</Label>
                                <p className="text-sm text-muted-foreground">Buat kredensial login untuk pelanggan ini.</p>
                            </div>
                        </div>
                        <InputError message={form.errors.create_user_account} />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button asChild variant="outline"><Link href="/customers">Batal</Link></Button>
                    <Button disabled={form.processing}>Buat Pelanggan</Button>
                </div>
            </form>
        </>
    );
};

PelanggansBuat.layout = (page) => <AppLayout breadcrumbs={[{ title: 'Pelanggan', href: '/customers' }, { title: 'Tambah Pelanggan', href: '/customers/create' }]}>{page}</AppLayout>;

export default PelanggansBuat;
