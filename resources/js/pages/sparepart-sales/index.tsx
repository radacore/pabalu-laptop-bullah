import { Head, Link, router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import DeleteDialog from '@/components/shared/delete-dialog';
import Reveal from '@/components/shared/reveal';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatTanggal } from '@/lib/format';
import type { PaginatedResponse, SparepartSale } from '@/types';

interface Props {
    sales: PaginatedResponse<
        SparepartSale & {
            sparepart?: { name: string } | null;
            customer?: { name: string } | null;
        }
    >;
    filters: {
        search?: string;
    };
}

type HalamanComponent = ((props: Props) => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

const PenjualanSparepartIndex: HalamanComponent = ({ sales, filters }) => {
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteSale, setDeleteSale] = useState<SparepartSale | null>(null);

    const applyFilters = () => {
        router.get(
            '/sparepart-sales',
            { search: search || undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Penjualan Sparepart" />
            <div className="flex flex-col gap-6 p-8">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Penjualan Sparepart
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Ledger penjualan — menghapus mengembalikan stok
                        </p>
                    </div>
                    <Link
                        href="/spareparts"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                    >
                        Kembali ke Stok
                    </Link>
                </div>

                <Reveal tone="admin">
                    <section className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="min-w-[240px] flex-1">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        applyFilters();
                                    }
                                }}
                                placeholder="Cari kode, produk, atau pelanggan..."
                                className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 leading-5 placeholder-slate-400 transition-colors focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand focus:outline-none sm:text-sm"
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
                    </section>
                </Reveal>

                <Reveal tone="admin" delay={80}>
                    <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        {sales.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <h3 className="text-base font-semibold text-slate-900">
                                    Belum ada penjualan
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Penjualan dicatat dari halaman detail
                                    sparepart.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase"
                                            >
                                                Kode
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase"
                                            >
                                                Produk
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase"
                                            >
                                                Pelanggan
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase"
                                            >
                                                Qty × Harga
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase"
                                            >
                                                Total
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase"
                                            >
                                                Tanggal
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase"
                                            >
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {sales.data.map((s) => (
                                            <tr
                                                key={s.id}
                                                className="transition-colors hover:bg-slate-50"
                                            >
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                    {s.sale_code}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {s.sparepart?.name ?? '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
                                                    {s.customer?.name ??
                                                        'Walk-in'}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
                                                    {s.quantity} ×{' '}
                                                    {formatCurrency(
                                                        s.unit_price,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap">
                                                    {formatCurrency(
                                                        s.total_amount,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
                                                    {formatTanggal(s.sold_at)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            setDeleteSale(s)
                                                        }
                                                    >
                                                        <Trash2 className="mr-1 size-4" />
                                                        Hapus
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </Reveal>

                {deleteSale && (
                    <DeleteDialog
                        open
                        onOpenChange={(open) => {
                            if (!open) {
                                setDeleteSale(null);
                            }
                        }}
                        onKonfirmasi={() => {
                            router.delete(`/sparepart-sales/${deleteSale.id}`, {
                                preserveState: true,
                                onFinish: () => setDeleteSale(null),
                            });
                        }}
                        title="Hapus penjualan?"
                        description={`Menghapus ${deleteSale.sale_code} akan mengembalikan ${deleteSale.quantity} pcs ke stok dan menghapus jurnalnya.`}
                    />
                )}
            </div>
        </>
    );
};

PenjualanSparepartIndex.layout = (page) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Sparepart', href: '/spareparts' },
            { title: 'Penjualan', href: '/sparepart-sales' },
        ]}
    >
        {page}
    </AppLayout>
);

export default PenjualanSparepartIndex;
