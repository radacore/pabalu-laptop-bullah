import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ChartLineUp,
    Laptop,
    EnvelopeSimple,
    Wrench,
} from '@phosphor-icons/react';

import InputError from '@/components/shared/input-error';
import PasswordInput from '@/components/shared/password-input';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk" />

            <div className="flex min-h-screen bg-paper">
                {/* Left Panel - Brand & Features */}
                <aside className="relative hidden flex-col overflow-hidden bg-paper-2 lg:flex lg:w-1/2 lg:px-14 lg:py-14">
                    {/* Subtle accent gradient */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-paper-2"
                    />

                    {/* Logo — fixed at top-left */}
                    <Link href="/" className="relative flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-ink shadow-[0_4px_0_0_var(--color-accent-deep),0_6px_12px_-3px_oklch(76%_0.20_95/0.35)]">
                            <Laptop className="h-6 w-6" weight="fill" />
                        </div>
                        <div>
                            <p className="hum-body-sm font-bold text-ink">
                                Pabalu Laptop
                            </p>
                            <p className="hum-caption text-ink-2/60">
                                Portal Manajemen Internal
                            </p>
                        </div>
                    </Link>

                    {/* Content — centered vertically */}
                    <div className="flex flex-1 flex-col justify-center">
                        <div className="space-y-10">
                            <div>
                                <h1 className="hum-display text-ink">
                                    Kelola bisnis laptop Anda dengan{' '}
                                    <span className="text-accent-deep">
                                        percaya diri
                                    </span>
                                    .
                                </h1>
                                <p className="mt-4 max-w-md hum-body text-ink-2">
                                    Pantau inventaris, lacak servis, dan kelola
                                    transaksi keuangan dalam satu platform terpadu.
                                </p>
                            </div>

                            {/* Feature List */}
                            <ul className="space-y-4">
                            <li className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-2 ring-1 ring-rule">
                                                <Laptop
                                        className="h-5 w-5 text-accent-deep"
                                        weight="duotone"
                                    />
                                </div>
                                <div>
                                    <p className="hum-body-sm font-semibold text-ink">
                                        Manajemen Inventaris
                                    </p>
                                    <p className="mt-0.5 hum-body-sm text-ink-2">
                                        Stok laptop baru dan bekas dengan foto,
                                        spesifikasi, dan status real-time.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-2 ring-1 ring-rule">
                                    <Wrench
                                        className="h-5 w-5 text-accent-deep"
                                        weight="duotone"
                                    />
                                </div>
                                <div>
                                    <p className="hum-body-sm font-semibold text-ink">
                                        Layanan Servis
                                    </p>
                                    <p className="mt-0.5 hum-body-sm text-ink-2">
                                        Tiket servis, sparepart, dan timeline
                                        update untuk setiap pelanggan.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-2 ring-1 ring-rule">
                                    <ChartLineUp
                                        className="h-5 w-5 text-accent-deep"
                                        weight="duotone"
                                    />
                                </div>
                                <div>
                                    <p className="hum-body-sm font-semibold text-ink">
                                        Pencatatan Keuangan
                                    </p>
                                    <p className="mt-0.5 hum-body-sm text-ink-2">
                                        Pemasukan, pengeluaran, dan laporan
                                        laba-rugi otomatis.
                                    </p>
                                </div>
                            </li>
                        </ul>
                        </div>
                    </div>
                </aside>

                {/* Right Panel - Login Form */}
                <main className="flex w-full flex-col p-6 lg:w-1/2 lg:p-10 xl:p-12">
                    {/* Login Form */}
                    <div className="flex flex-1 items-center justify-center py-10">
                        <div className="w-full max-w-sm">
                            <header className="mb-8">
                                <h2 className="hum-heading text-ink">
                                    Selamat datang kembali
                                </h2>
                                <p className="mt-2 hum-body text-ink-2">
                                    Masuk untuk mengakses dashboard admin Anda.
                                </p>
                            </header>

                            <Form
                                {...store.form()}
                                resetOnSuccess={['password']}
                                className="flex flex-col gap-5"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        {status && (
                                            <div className="rounded-xl border border-mint/50 bg-mint/15 px-4 py-3 hum-body-sm font-medium text-ink">
                                                {status}
                                            </div>
                                        )}

                                        {/* Email Field */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="email"
                                                className="hum-caption text-ink-2"
                                            >
                                                Alamat Email
                                            </label>
                                            <div className="relative">
                                                <EnvelopeSimple
                                                    className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-2/50"
                                                    weight="duotone"
                                                />
                                                <input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder="admin@pabalu.com"
                                                    className="h-11 w-full rounded-full border border-rule bg-paper pl-10 pr-3 hum-body-sm text-ink outline-none transition-shadow placeholder:text-ink-2/30 focus:border-accent focus:shadow-[0_0_0_3px_oklch(86%_0.18_95/0.2)]"
                                                />
                                            </div>
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        {/* Password Field */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <label
                                                    htmlFor="password"
                                                    className="hum-caption text-ink-2"
                                                >
                                                    Kata Sandi
                                                </label>
                                                {canResetPassword && (
                                                    <Link
                                                        href={request().url}
                                                        tabIndex={5}
                                                        className="hum-caption text-accent-2 hover:text-accent-2-deep hover:underline"
                                                    >
                                                        Lupa?
                                                    </Link>
                                                )}
                                            </div>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="h-11 rounded-full border border-rule bg-paper pl-3 pr-10 hum-body-sm text-ink outline-none transition-shadow placeholder:text-ink-2/30 focus:border-accent focus:shadow-[0_0_0_3px_oklch(86%_0.18_95/0.2)]"
                                            />
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        {/* Remember Me */}
                                        <label className="flex cursor-pointer items-center gap-2.5 select-none">
                                            <input
                                                id="remember"
                                                name="remember"
                                                type="checkbox"
                                                tabIndex={3}
                                                className="h-4 w-4 rounded border-rule text-accent-deep transition-colors focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper"
                                            />
                                            <span className="hum-body-sm text-ink-2">
                                                Ingat saya di perangkat ini
                                            </span>
                                        </label>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            tabIndex={4}
                                            className="hum-btn hum-btn--yellow !h-11 w-full"
                                        >
                                            {processing ? (
                                                <span>Memproses...</span>
                                            ) : (
                                                <>
                                                    <span>Masuk</span>
                                                    <ArrowRight
                                                        className="h-4 w-4"
                                                        weight="bold"
                                                    />
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            </Form>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
