import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import DeleteDialog from '@/components/shared/delete-dialog';
import Reveal from '@/components/shared/reveal';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { dashboard } from '@/routes';
import type { MasterData, PaginatedResponse, Sparepart } from '@/types';

interface Props {
    spareparts: PaginatedResponse<Sparepart>;
    filters: {
        search?: string;
        sparepart_type_id?: string;
        condition?: string;
    };
    types: MasterData[];
    conditions: string[];
}

type HalamanComponent = ((props: Props) => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

function HapusSparepartDialog({
    sparepart,
    onClose,
}: {
    sparepart: Sparepart;
    onClose: () => void;
}) {
    const [, setDeleting] = useState(false);

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/spareparts/${sparepart.id}`, {
            preserveState: true,
            replace: true,
            onFinish: () => {
                setDeleting(false);
                onClose();
            },
        });
    };

    return (
        <DeleteDialog
            open
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            onKonfirmasi={handleDelete}
            title="Hapus sparepart?"
            description={`Menghapus ${sparepart.name} dari inventori. Data yang sudah dihapus tidak dapat dikembalikan.`}
        />
    );
}

const SparepartsIndex: HalamanComponent = ({
    spareparts,
    filters,
    types,
    conditions,
}) => {
    const [search, setSearch] = useState(filters.search ?? '');
    const [typeId, setTypeId] = useState(filters.sparepart_type_id ?? 'all');
    const [condition, setCondition] = useState(filters.condition ?? 'all');
    const [deleteSparepart, setDeleteSparepart] = useState<Sparepart | null>(
        null,
    );

    const applyFilters = () => {
        router.get(
            '/spareparts',
            {
                search: search || undefined,
                sparepart_type_id: typeId === 'all' ? undefined : typeId,
                condition: condition === 'all' ? undefined : condition,
            },
            { preserveState: true, replace: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setTypeId('all');
        setCondition('all');
        router.get('/spareparts', {}, { preserveState: true, replace: true });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    return (
        <>
            <Head title="Sparepart" />
            <div className="flex flex-col gap-6 p-8">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Sparepart
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Kelola stok sparepart baru &amp; bekas untuk dijual
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/sparepart-sales"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                        >
                            Riwayat Penjualan
                        </Link>
                        <Button variant="primary" size="lg" asChild>
                            <Link href="/spareparts/create">
                                Sparepart Baru
                            </Link>
                        </Button>
                    </div>
                </div>

                <Reveal tone="admin">
                    <section className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="min-w-[240px] flex-1">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Cari nama, SKU, atau tipe..."
                                className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 leading-5 placeholder-slate-400 transition-colors focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand focus:outline-none sm:text-sm"
                            />
                        </div>
                        <div className="relative w-52">
                            <select
                                value={typeId}
                                onChange={(e) => setTypeId(e.target.value)}
                                className="block w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pr-10 pl-4 text-base text-slate-700 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none sm:text-sm"
                            >
                                <option value="all">Semua tipe</option>
                                {types.map((t) => (
                                    <option key={t.id} value={String(t.id)}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="relative w-44">
                            <select
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                className="block w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pr-10 pl-4 text-base text-slate-700 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none sm:text-sm"
                            >
                                <option value="all">Baru &amp; bekas</option>
                                {conditions.map((c) => (
                                    <option key={c} value={c}>
                                        {c === 'baru' ? 'Baru' : 'Bekas'}
                                    </option>
                                ))}
                            </select>
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
                            Reset
                        </Button>
                    </section>
                </Reveal>

                <Reveal tone="admin" delay={80}>
                    <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        {spareparts.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <h3 className="text-base font-semibold text-slate-900">
                                    Tidak ada sparepart
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Sesuaikan filter atau tambah sparepart baru.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <Th>Nama</Th>
                                                <Th>Tipe</Th>
                                                <Th>Kondisi</Th>
                                                <Th>Stok</Th>
                                                <Th>Harga Jual</Th>
                                                <Th>Status</Th>
                                                <Th align="right">Aksi</Th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {spareparts.data.map((sp) => (
                                                <tr
                                                    key={sp.id}
                                                    className="transition-colors hover:bg-slate-50"
                                                >
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="font-medium text-slate-900">
                                                            {sp.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {sp.sku}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
                                                        {sp.type?.name ?? '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                                sp.condition ===
                                                                'baru'
                                                                    ? 'bg-brand-soft text-brand-dark'
                                                                    : 'bg-amber-100 text-amber-800'
                                                            }`}
                                                        >
                                                            {sp.condition ===
                                                            'baru'
                                                                ? 'Baru'
                                                                : 'Bekas'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
                                                        {sp.stock}
                                                        {sp.stock <= 0 && (
                                                            <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                                                                Habis
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
                                                        {formatCurrency(
                                                            sp.selling_price,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                                sp.is_active
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-slate-100 text-slate-600'
                                                            }`}
                                                        >
                                                            {sp.is_active
                                                                ? 'Aktif'
                                                                : 'Nonaktif'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                asChild
                                                                variant="default"
                                                                size="sm"
                                                            >
                                                                <Link
                                                                    href={`/spareparts/${sp.id}`}
                                                                >
                                                                    <Eye className="mr-1 size-4" />
                                                                    Lihat
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                asChild
                                                                variant="success"
                                                                size="sm"
                                                            >
                                                                <Link
                                                                    href={`/spareparts/${sp.id}/edit`}
                                                                >
                                                                    <Edit className="mr-1 size-4" />
                                                                    Edit
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setDeleteSparepart(
                                                                        sp,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="mr-1 size-4" />
                                                                Hapus
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
                                    <div className="text-sm text-slate-700">
                                        Menampilkan{' '}
                                        <span className="font-medium">
                                            {spareparts.from ?? 0}
                                        </span>{' '}
                                        -{' '}
                                        <span className="font-medium">
                                            {spareparts.to ?? 0}
                                        </span>{' '}
                                        dari{' '}
                                        <span className="font-medium">
                                            {spareparts.total}
                                        </span>{' '}
                                        sparepart
                                    </div>
                                    <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                                        <Link
                                            href={
                                                spareparts.current_page <= 1
                                                    ? '#'
                                                    : `/spareparts?page=${Math.max(1, spareparts.current_page - 1)}${search ? `&search=${encodeURIComponent(search)}` : ''}${typeId !== 'all' ? `&sparepart_type_id=${typeId}` : ''}${condition !== 'all' ? `&condition=${condition}` : ''}`
                                            }
                                            className={`relative inline-flex items-center rounded-l-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium ${
                                                spareparts.current_page <= 1
                                                    ? 'cursor-not-allowed text-slate-300'
                                                    : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                            preserveState
                                        >
                                            Sebelumnya
                                        </Link>
                                        <span className="relative inline-flex items-center border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                                            {spareparts.current_page} /{' '}
                                            {spareparts.last_page}
                                        </span>
                                        <Link
                                            href={
                                                spareparts.current_page >=
                                                spareparts.last_page
                                                    ? '#'
                                                    : `/spareparts?page=${Math.min(spareparts.last_page, spareparts.current_page + 1)}${search ? `&search=${encodeURIComponent(search)}` : ''}${typeId !== 'all' ? `&sparepart_type_id=${typeId}` : ''}${condition !== 'all' ? `&condition=${condition}` : ''}`
                                            }
                                            className={`relative inline-flex items-center rounded-r-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium ${
                                                spareparts.current_page >=
                                                spareparts.last_page
                                                    ? 'cursor-not-allowed text-slate-300'
                                                    : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                            preserveState
                                        >
                                            Selanjutnya
                                        </Link>
                                    </nav>
                                </div>
                            </>
                        )}
                    </section>
                </Reveal>

                {deleteSparepart && (
                    <HapusSparepartDialog
                        sparepart={deleteSparepart}
                        onClose={() => setDeleteSparepart(null)}
                    />
                )}
            </div>
        </>
    );
};

function Th({
    children,
    align = 'left',
}: {
    children: React.ReactNode;
    align?: 'left' | 'right';
}) {
    return (
        <th
            scope="col"
            className={`px-6 py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase ${
                align === 'right' ? 'text-right' : 'text-left'
            }`}
        >
            {children}
        </th>
    );
}

SparepartsIndex.layout = (page) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: dashboard() },
            { title: 'Sparepart', href: '/spareparts' },
        ]}
    >
        {page}
    </AppLayout>
);

export default SparepartsIndex;
