import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { PaymentMethod, TransactionCategory } from '@/types';
import FinancialTransactionForm from './form-fields';

interface Props {
    categories: {
        income: TransactionCategory[];
        expense: TransactionCategory[];
    };
    payment_methods: PaymentMethod[];
}

type HalamanComponent = ((props: Props) => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

function BuatFinancialTransaction({ categories, payment_methods }: Props) {
    return (
        <>
            <Head title="Tambah Transaksi" />

            <div className="flex flex-col gap-6 p-8">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        Tambah Transaksi
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-500">
                        Catat pemasukan atau pengeluaran baru untuk Pabalu
                        Laptop.
                    </p>
                </div>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <FinancialTransactionForm
                        categories={categories}
                        paymentMethods={payment_methods}
                        submitLabel="Simpan Transaksi"
                    />
                </section>
            </div>
        </>
    );
}

const Page = BuatFinancialTransaction as HalamanComponent;
Page.layout = (page) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: dashboard() },
            { title: 'Keuangan', href: '/financial-transactions' },
            {
                title: 'Tambah Transaksi',
                href: '/financial-transactions/create',
            },
        ]}
    >
        {page}
    </AppLayout>
);

export default Page;
