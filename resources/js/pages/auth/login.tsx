import { Form, Head } from '@inertiajs/react';
import {
    ArrowRight,
    ChartLineUp,
    House,
    Laptop,
    EnvelopeSimple,
    ShieldCheck,
    Wrench,
} from '@phosphor-icons/react';
import InputError from '@/components/shared/input-error';
import PasswordInput from '@/components/shared/password-input';
import { Button } from '@/components/ui/button';
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

            <div className="flex min-h-screen bg-slate-50">
                {/* Left Panel - Brand & Features */}
                <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white lg:flex lg:w-1/2 lg:p-14">
                    {/* Subtle gradient background */}
                    <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-slate-900"
                    />

                    {/* Logo */}
                    <div className="relative flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
                            <Laptop
                                className="h-6 w-6 text-white"
                                weight="fill"
                            />
                        </div>
                        <div>
                            <p className="text-lg font-bold tracking-tight">
                                Pabalu Admin
                            </p>
                            <p className="text-xs text-slate-400">
                                Portal Manajemen Internal
                            </p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="relative space-y-10">
                        <div>
                            <h1 className="text-3xl leading-tight font-bold tracking-tight text-balance lg:text-4xl">
                                Kelola bisnis laptop Anda dengan{' '}
                                <span className="text-blue-400">
                                    percaya diri
                                </span>
                                .
                            </h1>
                            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400 lg:text-base">
                                Pantau inventaris, lacak servis, dan kelola
                                transaksi keuangan dalam satu platform terpadu.
                            </p>
                        </div>

                        {/* Feature List */}
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 ring-1 ring-slate-700">
                                    <Laptop
                                        className="h-5 w-5 text-blue-400"
                                        weight="duotone"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">
                                        Manajemen Inventaris
                                    </p>
                                    <p className="mt-0.5 text-sm text-slate-400">
                                        Stok laptop baru dan bekas dengan foto,
                                        spesifikasi, dan status real-time.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 ring-1 ring-slate-700">
                                    <Wrench
                                        className="h-5 w-5 text-blue-400"
                                        weight="duotone"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">
                                        Layanan Servis
                                    </p>
                                    <p className="mt-0.5 text-sm text-slate-400">
                                        Tiket servis, sparepart, dan timeline
                                        update untuk setiap pelanggan.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 ring-1 ring-slate-700">
                                    <ChartLineUp
                                        className="h-5 w-5 text-blue-400"
                                        weight="duotone"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">
                                        Pencatatan Keuangan
                                    </p>
                                    <p className="mt-0.5 text-sm text-slate-400">
                                        Pemasukan, pengeluaran, dan laporan
                                        laba-rugi otomatis.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Security Badge */}
                    <div className="relative flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4 backdrop-blur-sm">
                        <ShieldCheck
                            className="h-5 w-5 shrink-0 text-emerald-400"
                            weight="duotone"
                        />
                        <p className="text-xs leading-relaxed text-slate-400">
                            Akses aman untuk personel yang berwenang. Semua
                            aktivitas dipantau dan dienkripsi.
                        </p>
                    </div>
                </aside>

                {/* Right Panel - Login Form */}
                <main className="flex w-full flex-col p-6 lg:w-1/2 lg:p-10 xl:p-12">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 lg:hidden">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                                <Laptop
                                    className="h-5 w-5 text-white"
                                    weight="fill"
                                />
                            </div>
                            <span className="text-sm font-bold tracking-tight text-slate-900">
                                Pabalu Admin
                            </span>
                        </div>
                        <a
                            href="/"
                            className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                        >
                            <House className="h-4 w-4" weight="duotone" />
                            Beranda
                        </a>
                    </div>

                    {/* Login Form */}
                    <div className="flex flex-1 items-center justify-center py-10">
                        <div className="w-full max-w-sm">
                            <header className="mb-8">
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                                    Selamat datang kembali
                                </h2>
                                <p className="mt-2 text-sm text-slate-600">
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
                                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                                {status}
                                            </div>
                                        )}

                                        {/* Email Field */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="email"
                                                className="text-xs font-semibold tracking-wider text-slate-700 uppercase"
                                            >
                                                Alamat Email
                                            </label>
                                            <div className="relative">
                                                <EnvelopeSimple
                                                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
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
                                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pr-3 pl-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
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
                                                    className="text-xs font-semibold tracking-wider text-slate-700 uppercase"
                                                >
                                                    Kata Sandi
                                                </label>
                                                {canResetPassword && (
                                                    <a
                                                        href={request().url}
                                                        tabIndex={5}
                                                        className="text-xs font-semibold tracking-wider text-blue-600 hover:text-blue-700 hover:underline"
                                                    >
                                                        Lupa?
                                                    </a>
                                                )}
                                            </div>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="h-11 rounded-lg border border-slate-300 bg-white pr-10 pl-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
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
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
                                            />
                                            <span className="text-sm text-slate-600">
                                                Ingat saya di perangkat ini
                                            </span>
                                        </label>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            tabIndex={4}
                                            className="h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold tracking-wider text-white uppercase shadow-sm transition-all hover:bg-blue-700 hover:shadow-md disabled:opacity-60"
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
                                        </Button>
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
