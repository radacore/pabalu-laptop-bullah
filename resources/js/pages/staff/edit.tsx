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

interface StaffUser {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    is_active: boolean;
}

type StaffForm = {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    is_active: boolean;
};

type HalamanComponent = ((props: { staffUser: StaffUser }) => ReactNode) & {
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

const StaffUbah: HalamanComponent = ({ staffUser }) => {
    const form = useForm<StaffForm>({
        name: staffUser.name,
        email: staffUser.email,
        phone: staffUser.phone ?? '',
        password: '',
        role: staffUser.role,
        is_active: staffUser.is_active,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(`/staff/${staffUser.id}`);
    };

    return (
        <>
            <Head title="Ubah Akun Tim" />
            <form
                onSubmit={submit}
                className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4"
            >
                <HalamanHeader
                    title="Ubah Akun Tim"
                    description={`Kelola ${staffUser.name}`}
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
                            Kosongkan password bila tidak ingin mengubahnya.
                            Menonaktifkan akun langsung memutus aksesnya.
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
                        <Field
                            label="Password baru (opsional)"
                            error={form.errors.password}
                        >
                            <Input
                                type="password"
                                value={form.data.password}
                                onChange={(event) =>
                                    form.setData('password', event.target.value)
                                }
                                placeholder="Kosongkan bila tidak diubah"
                                autoComplete="new-password"
                            />
                        </Field>
                        <Field label="Status" error={form.errors.is_active}>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(event) =>
                                        form.setData(
                                            'is_active',
                                            event.target.checked,
                                        )
                                    }
                                />
                                Akun aktif (bisa login & akses panel)
                            </label>
                        </Field>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button asChild variant="outline">
                        <Link href="/staff">Batal</Link>
                    </Button>
                    <Button disabled={form.processing}>Simpan</Button>
                </div>
            </form>
        </>
    );
};

StaffUbah.layout = (page) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Staff', href: '/staff' },
            { title: 'Ubah Akun', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);

export default StaffUbah;
