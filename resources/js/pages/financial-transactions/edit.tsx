import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type {
    FinancialTransaction,
    PaymentMethod,
    TransactionCategory,
} from '@/types';
import FinancialTransactionForm from './form-fields';

interface Props {
    transaction: FinancialTransaction;
    categories: {
        income: TransactionCategory[];
        expense: TransactionCategory[];
    };
    payment_methods: PaymentMethod[];
}

type HalamanComponent = ((props: Props) => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

function EditFinancialTransaction({
    transaction,
    categories,
    payment_methods,
}: Props) {
    return (
        <>
            <Head title={`Edit ${transaction.transaction_code}`} />

            <div className="flex flex-col gap-6 p-8">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        Edit {transaction.transaction_code}
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-500">
                        Perbarui data transaksi {transaction.transaction_code}.
                    </p>
                </div>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <FinancialTransactionForm
                        categories={categories}
                        paymentMethods={payment_methods}
                        transaction={transaction}
                        submitLabel="Perbarui Transaksi"
                    />
                </section>
            </div>
        </>
    );
}

const Page = EditFinancialTransaction as HalamanComponent;
Page.layout = (page) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: dashboard() },
            { title: 'Keuangan', href: '/financial-transactions' },
            { title: 'Edit Transaksi', href: window.location.pathname },
        ]}
    >
        {page}
    </AppLayout>
);

export default Page;
