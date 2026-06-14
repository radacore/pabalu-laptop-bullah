import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import FinancialTransactionForm from './form-fields';
import { dashboard } from '@/routes';
import AppLayout from '@/layouts/app-layout';
import type {
    FinancialTransaction,
    PaymentMethod,
    TransactionCategory,
} from '@/types';

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
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Edit {transaction.transaction_code}
                    </h2>
                    <p className="text-slate-500 mt-1.5 text-sm">
                        Perbarui data transaksi {transaction.transaction_code}.
                    </p>
                </div>

                <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
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
