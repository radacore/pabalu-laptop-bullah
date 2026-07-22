import { Head, Link, router } from '@inertiajs/react';
import {
    MagnifyingGlass,
    PencilSimple,
    Plus,
    Trash,
} from '@phosphor-icons/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import DeleteDialog from '@/components/shared/delete-dialog';
import StatusBadge from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { PaginatedResponse, SparepartType } from '@/types';

interface SparepartTypesIndexProps {
    sparepartTypes: PaginatedResponse<SparepartType>;
    filters: { search?: string };
}

function buildUrl(page: number, search: string | undefined) {
    const params = new URLSearchParams();

    if (search) {
params.set('search', search);
}

    if (page > 1) {
params.set('page', String(page));
}

    const query = params.toString();

    return query
        ? `/master-data/sparepart-types?${query}`
        : '/master-data/sparepart-types';
}

const SparepartTypesIndex = ({
    sparepartTypes,
    filters,
}: SparepartTypesIndexProps) => {
    const [toDelete, setToDelete] = useState<SparepartType | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');

    function applySearch(value: string) {
        setSearch(value);
        router.get(
            '/master-data/sparepart-types',
            { search: value || undefined },
            { preserveState: true, replace: true },
        );
    }

    function handleDelete() {
        if (!toDelete) {
return;
}

        router.delete(`/master-data/sparepart-types/${toDelete.id}`, {
            preserveState: true,
            replace: true,
            onSuccess: () => setToDelete(null),
        });
    }

    return (
        <>
            <Head title="Tipe Sparepart" />
            <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
                <header className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Tipe Sparepart
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Kelola kategori komponen sparepart
                        </p>
                    </div>
                    <Link
                        href="/master-data/sparepart-types/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        <Plus className="size-4" weight="bold" />
                        Tambah Tipe
                    </Link>
                </header>

                <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 p-4 sm:px-6">
                        <div className="relative w-full sm:max-w-sm">
                            <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    applySearch(event.target.value)
                                }
                                placeholder="Cari tipe sparepart..."
                                className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {sparepartTypes.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <h3 className="text-base font-semibold text-slate-900">
                                Belum ada tipe sparepart
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Tambahkan tipe komponen pertama Anda.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                            Nama
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {sparepartTypes.data.map((type) => (
                                        <tr
                                            key={type.id}
                                            className="transition-colors hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                {type.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge
                                                    status={
                                                        type.is_active
                                                            ? 'tersedia'
                                                            : 'error'
                                                    }
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        asChild
                                                        variant="success"
                                                        size="sm"
                                                    >
                                                        <Link
                                                            href={`/master-data/sparepart-types/${type.id}/edit`}
                                                        >
                                                            <PencilSimple
                                                                className="mr-1 size-4"
                                                                weight="bold"
                                                            />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            setToDelete(type)
                                                        }
                                                    >
                                                        <Trash
                                                            className="mr-1 size-4"
                                                            weight="bold"
                                                        />
                                                        Hapus
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <DeleteDialog
                    open={toDelete !== null}
                    onOpenChange={(open) => {
                        if (!open) {
setToDelete(null);
}
                    }}
                    onKonfirmasi={handleDelete}
                    title="Hapus Tipe Sparepart?"
                    description={
                        toDelete
                            ? `Aksi ini tidak dapat dibatalkan. Tipe sparepart "${toDelete.name}" akan dihapus permanen.`
                            : ''
                    }
                />
            </div>
        </>
    );
};

SparepartTypesIndex.layout = (page: ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: dashboard() },
            { title: 'Data Master', href: '/master-data' },
            { title: 'Tipe Sparepart', href: '/master-data/sparepart-types' },
        ]}
    >
        {page}
    </AppLayout>
);

export default SparepartTypesIndex;
