import { Head, Link, useForm } from '@inertiajs/react';
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

type StaffForm = {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
};

type HalamanComponent = (() => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

function HalamanHeader({
    title,
    description,
    actions,
}: {
    title: string;
    description: string;
    actions?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-foreground text-2xl font-semibold tracking-tight">
                    {title}
                </h1>
                <p className="text-muted-foreground text-sm">{description}</p>
            </div>
            {actions}
        </div>
    );
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

const StaffBuat: HalamanComponent = () => {
    const form = useForm<StaffForm>({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'staff',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/staff');
    };

    return (
        <>
            <Head title="Tambah Akun Tim" />
            <form
                onSubmit={submit}
                className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4"
            >
                <HalamanHeader
                    title="Tambah Akun Tim"
                    description="Buat akun admin atau teknisi untuk akses panel"
                    actions={
                        <Button asChild variant="outline">
                            <Link href="/staff">Kembali</Link>
                        </Button>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Akun</CardTitle>
                        <CardDescription>
                            Password minimal 8 karakter. Sampaikan ke pemilik
                            akun lewat jalur aman.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Nama" error={form.errors.name}>
                                <Input
                                    required
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    placeholder="Nama lengkap"
                                />
                            </Field>
                            <Field label="Email" error={form.errors.email}>
                                <Input
                                    required
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) =>
                                        form.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="nama@pabalu.com"
                                />
                            </Field>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Telepon" error={form.errors.phone}>
                                <Input
                                    value={form.data.phone}
                                    onChange={(event) =>
                                        form.setData(
                                            'phone',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Nomor telepon (opsional)"
                                />
                            </Field>
                            <Field label="Role" error={form.errors.role}>
                                <select
                                    value={form.data.role}
                                    onChange={(event) =>
                                        form.setData('role', event.target.value)
                                    }
                                    className="border-input rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none"
                                >
                                    <option value="staff">
                                        Teknisi (staff)
                                    </option>
                                    <option value="admin">Admin</option>
                                </select>
                            </Field>
                        </div>
                        <Field label="Password" error={form.errors.password}>
                            <Input
                                required
                                type="password"
                                value={form.data.password}
                                onChange={(event) =>
                                    form.setData('password', event.target.value)
                                }
                                placeholder="Minimal 8 karakter"
                                autoComplete="new-password"
                            />
                        </Field>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button asChild variant="outline">
                        <Link href="/staff">Batal</Link>
                    </Button>
                    <Button variant="primary" disabled={form.processing}>
                        Buat Akun
                    </Button>
                </div>
            </form>
        </>
    );
};

StaffBuat.layout = (page) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Staff', href: '/staff' },
            { title: 'Tambah Akun', href: '/staff/create' },
        ]}
    >
        {page}
    </AppLayout>
);

export default StaffBuat;
