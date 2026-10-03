import { Head, Link, router } from '@inertiajs/react';
import { Edit, UserPlus } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import Reveal from '@/components/shared/reveal';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

interface StaffUser {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    is_active: boolean;
    created_at: string | null;
}

interface Props {
    users: {
        data: StaffUser[];
        current_page: number;
        last_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    filters: { search?: string };
}

type HalamanComponent = ((props: Props) => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

function userInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

const StaffIndex: HalamanComponent = ({ users, filters }) => {
    const [search, setSearch] = useState(filters.search ?? '');

    function visitStaff(page?: number) {
        router.get(
            '/staff',
            {
                search: search || undefined,
                page: page && page > 1 ? page : undefined,
            },
            { preserveState: true, replace: true },
        );
    }

    function applyFilters() {
        visitStaff();
    }

    function clearFilters() {
        setSearch('');
        router.get('/staff', {}, { preserveState: true, replace: true });
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            applyFilters();
        }
    }

    return (
        <>
            <Head title="Staff" />
            <div className="flex flex-col gap-6 p-8">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Staff
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Kelola akun tim internal (admin & teknisi)
                        </p>
                    </div>
                    <Button variant="primary" size="lg" asChild>
                        <Link href="/staff/create">
                            <UserPlus className="size-4" />
                            Tambah Akun
                        </Link>
                    </Button>
                </div>

                <Reveal tone="admin">
                    <section className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="min-w-[300px] flex-1">
                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                onKeyDown={handleKeyDown}
                                placeholder="Cari nama atau email..."
                                className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 leading-5 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="primary"
                            size="lg"
                            onClick={applyFilters}
                        >
                            Filter
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={clearFilters}
                        >
                            Reset Filter
                        </Button>
                    </section>
                </Reveal>

                <Reveal tone="admin" delay={80}>
                    <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        {users.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <h3 className="text-base font-semibold text-slate-900">
                                    Tidak ada akun tim
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Sesuaikan filter atau tambah akun baru.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                                    Nama &amp; Email
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                                    Role
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {users.data.map((staffUser) => (
                                                <tr
                                                    key={staffUser.id}
                                                    className="transition-colors hover:bg-slate-50"
                                                >
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                                                                {userInitials(
                                                                    staffUser.name,
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-semibold text-slate-900">
                                                                    {
                                                                        staffUser.name
                                                                    }
                                                                </div>
                                                                <div className="mt-0.5 truncate text-sm text-slate-500">
                                                                    {
                                                                        staffUser.email
                                                                    }
                                                                </div>
                                                                {staffUser.phone && (
                                                                    <div className="mt-0.5 text-sm text-slate-500">
                                                                        {
                                                                            staffUser.phone
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 align-top">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                                staffUser.role ===
                                                                'admin'
                                                                    ? 'bg-purple-100 text-purple-700'
                                                                    : 'bg-blue-100 text-blue-700'
                                                            }`}
                                                        >
                                                            {staffUser.role ===
                                                            'admin'
                                                                ? 'Admin'
                                                                : 'Teknisi'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center align-top">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                                staffUser.is_active
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : 'bg-slate-200 text-slate-600'
                                                            }`}
                                                        >
                                                            {staffUser.is_active
                                                                ? 'Aktif'
                                                                : 'Nonaktif'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right align-top whitespace-nowrap">
                                                        <Button
                                                            asChild
                                                            variant="success"
                                                            size="sm"
                                                        >
                                                            <Link
                                                                href={`/staff/${staffUser.id}/edit`}
                                                            >
                                                                <Edit className="mr-1 size-4" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {users.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
                                        <div className="text-sm text-slate-700">
                                            Menampilkan{' '}
                                            <span className="font-medium">
                                                {users.from ?? 0}
                                            </span>
                                            -
                                            <span className="font-medium">
                                                {users.to ?? 0}
                                            </span>{' '}
                                            dari{' '}
                                            <span className="font-medium">
                                                {users.total}
                                            </span>{' '}
                                            akun
                                        </div>
                                        <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                                            <Link
                                                href={
                                                    users.current_page <= 1
                                                        ? '#'
                                                        : `/staff?page=${Math.max(1, users.current_page - 1)}${search ? `&search=${encodeURIComponent(search)}` : ''}`
                                                }
                                                className={`relative inline-flex items-center rounded-l-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium ${
                                                    users.current_page <= 1
                                                        ? 'cursor-not-allowed text-slate-300'
                                                        : 'text-slate-500 hover:bg-slate-50'
                                                }`}
                                                preserveState
                                            >
                                                Sebelumnya
                                            </Link>
                                            <span className="relative inline-flex items-center border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                                                {users.current_page} /{' '}
                                                {users.last_page}
                                            </span>
                                            <Link
                                                href={
                                                    users.current_page >=
                                                    users.last_page
                                                        ? '#'
                                                        : `/staff?page=${Math.min(users.last_page, users.current_page + 1)}${search ? `&search=${encodeURIComponent(search)}` : ''}`
                                                }
                                                className={`relative inline-flex items-center rounded-r-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium ${
                                                    users.current_page >=
                                                    users.last_page
                                                        ? 'cursor-not-allowed text-slate-300'
                                                        : 'text-slate-500 hover:bg-slate-50'
                                                }`}
                                                preserveState
                                            >
                                                Selanjutnya
                                            </Link>
                                        </nav>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </Reveal>
            </div>
        </>
    );
};

StaffIndex.layout = (page) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Staff', href: '/staff' },
            { title: 'Daftar Akun', href: '/staff' },
        ]}
    >
        {page}
    </AppLayout>
);

export default StaffIndex;
