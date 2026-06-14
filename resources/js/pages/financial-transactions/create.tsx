import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import FinancialTransactionForm from './form-fields';
import { dashboard } from '@/routes';
import AppLayout from '@/layouts/app-layout';
import type { PaymentMethod, TransactionCategory } from '@/types';

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
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Tambah Transaksi
                    </h2>
                    <p className="text-slate-500 mt-1.5 text-sm">
                        Catat pemasukan atau pengeluaran baru untuk Pabalu Laptop.
                    </p>
                </div>

                <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
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
            { title: 'Tambah Transaksi', href: '/financial-transactions/create' },
        ]}
    >
        {page}
    </AppLayout>
);

export default Page;
