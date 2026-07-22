import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
    FinancialTransaction,
    PaymentMethod,
    TransactionCategory,
} from '@/types';

type TransactionTipe = 'income' | 'expense';

type FinancialTransactionFormData = {
    type: TransactionTipe;
    transaction_category_id: string;
    amount: string;
    payment_method_id: string;
    transaction_date: string;
    description: string;
};

interface FinancialTransactionFormProps {
    categories: {
        income: TransactionCategory[];
        expense: TransactionCategory[];
    };
    paymentMethods: PaymentMethod[];
    transaction?: FinancialTransaction;
    submitLabel: string;
}

const selectClassNama =
    'border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50';

const textareaClassNama =
    'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50';

function toTanggalInputValue(value?: string) {
    if (!value) {
        return new Date().toISOString().slice(0, 10);
    }

    return value.slice(0, 10);
}

export default function FinancialTransactionForm({
    categories,
    paymentMethods,
    transaction,
    submitLabel,
}: FinancialTransactionFormProps) {
    const form = useForm<FinancialTransactionFormData>({
        type: transaction?.type ?? 'income',
        transaction_category_id: transaction?.transaction_category_id
            ? String(transaction.transaction_category_id)
            : '',
        amount: transaction ? String(transaction.amount) : '',
        payment_method_id: transaction?.payment_method_id
            ? String(transaction.payment_method_id)
            : '',
        transaction_date: toTanggalInputValue(transaction?.transaction_date),
        description: transaction?.description ?? '',
    });

    const currentKategoriList = categories[form.data.type] ?? [];

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (transaction) {
            form.put(`/financial-transactions/${transaction.id}`);

            return;
        }

        form.post('/financial-transactions');
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="type">Tipe</Label>
                    <select
                        id="type"
                        required
                        value={form.data.type}
                        onChange={(event) =>
                            form.setData({
                                ...form.data,
                                type: event.target.value as TransactionTipe,
                                transaction_category_id: '',
                            })
                        }
                        className={selectClassNama}
                    >
                        <option value="income">Pemasukan</option>
                        <option value="expense">Pengeluaran</option>
                    </select>
                    <InputError message={form.errors.type} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="transaction_category_id">
                        Kategori Transaksi
                    </Label>
                    <select
                        id="transaction_category_id"
                        required
                        value={form.data.transaction_category_id}
                        onChange={(event) =>
                            form.setData(
                                'transaction_category_id',
                                event.target.value,
                            )
                        }
                        className={selectClassNama}
                    >
                        <option value="">Pilih kategori</option>
                        {currentKategoriList.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <InputError message={form.errors.transaction_category_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="amount">Jumlah</Label>
                    <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="1000"
                        required
                        inputMode="numeric"
                        value={form.data.amount}
                        onChange={(event) =>
                            form.setData('amount', event.target.value)
                        }
                        placeholder="0"
                    />
                    <InputError message={form.errors.amount} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="payment_method_id">Metode Pembayaran</Label>
                    <select
                        id="payment_method_id"
                        required
                        value={form.data.payment_method_id}
                        onChange={(event) =>
                            form.setData(
                                'payment_method_id',
                                event.target.value,
                            )
                        }
                        className={selectClassNama}
                    >
                        <option value="">Pilih metode pembayaran</option>
                        {paymentMethods.map((paymentMethod) => (
                            <option
                                key={paymentMethod.id}
                                value={paymentMethod.id}
                            >
                                {paymentMethod.name}
                            </option>
                        ))}
                    </select>
                    <InputError message={form.errors.payment_method_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="transaction_date">Tanggal Transaksi</Label>
                    <Input
                        id="transaction_date"
                        type="date"
                        required
                        value={form.data.transaction_date}
                        onChange={(event) =>
                            form.setData('transaction_date', event.target.value)
                        }
                    />
                    <InputError message={form.errors.transaction_date} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                    id="description"
                    value={form.data.description}
                    onChange={(event) =>
                        form.setData('description', event.target.value)
                    }
                    placeholder="Catatan transaksi"
                    className={textareaClassNama}
                />
                <InputError message={form.errors.description} />
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={form.processing}>
                    {submitLabel}
                </Button>
                <Button type="button" variant="outline" asChild>
                    <Link href="/financial-transactions">Batal</Link>
                </Button>
            </div>
        </form>
    );
}
