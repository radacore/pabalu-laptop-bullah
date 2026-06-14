import { Form, Head } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Home,
    Laptop,
    Mail,
    ShieldCheck,
    Wrench,
} from 'lucide-react';
import InputError from '@/components/shared/input-error';
import PasswordInput from '@/components/shared/password-input';
import { Button } from '@/components/ui/button';
import { request } from '@/routes/password';
import { store } from '@/routes/login';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk" />

            <div className="flex min-h-screen bg-[#eff4ff]">
                <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0b1c30] p-10 text-white md:flex md:w-1/2 lg:p-14">
                    <div
                        aria-hidden
                        className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:32px_32px]"
                    />
                    <div
                        aria-hidden
                        className="absolute -top-32 -right-32 size-96 rounded-full bg-[#0058be]/30 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="absolute -bottom-32 -left-32 size-96 rounded-full bg-[#2170e4]/20 blur-3xl"
                    />

                    <div className="relative flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-[#0058be] shadow-lg shadow-[#0058be]/40">
                            <Laptop className="size-6 text-white" strokeWidth={2.25} />
                        </div>
                        <div>
                            <p className="text-lg font-bold tracking-tight">Pabalu Admin</p>
                            <p className="text-xs text-white/60">Portal Manajemen Internal</p>
                        </div>
                    </div>

                    <div className="relative space-y-10">
                        <div>
                            <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
                                Kelola bisnis laptop Anda dengan{' '}
                                <span className="text-[#5e9bff]">percaya diri</span>.
                            </h1>
                            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 lg:text-base">
                                Pantau inventaris, lacak servis, dan kelola transaksi
                                keuangan — semuanya dalam satu tempat.
                            </p>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-4">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                                    <Laptop className="size-5 text-[#5e9bff]" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">
                                        Manajemen Inventaris
                                    </p>
                                    <p className="mt-0.5 text-sm text-white/60">
                                        Stok laptop baru dan bekas dengan foto,
                                        spesifikasi, dan status real-time.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                                    <Wrench className="size-5 text-[#5e9bff]" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Layanan Servis</p>
                                    <p className="mt-0.5 text-sm text-white/60">
                                        Tiket servis, sparepart, dan timeline update
                                        untuk setiap pelanggan.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                                    <BarChart3 className="size-5 text-[#5e9bff]" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">
                                        Pencatatan Keuangan
                                    </p>
                                    <p className="mt-0.5 text-sm text-white/60">
                                        Pemasukan, pengeluaran, dan laporan laba-rugi
                                        otomatis.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                        <ShieldCheck className="size-5 shrink-0 text-emerald-400" />
                        <p className="text-xs leading-relaxed text-white/70">
                            Akses aman untuk personel yang berwenang. Semua aktivitas
                            dipantau dan dienkripsi.
                        </p>
                    </div>
                </aside>

                <main className="flex w-full flex-col p-6 md:w-1/2 md:p-10 lg:p-12">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 md:hidden">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-[#0058be]">
                                <Laptop className="size-5 text-white" strokeWidth={2.25} />
                            </div>
                            <span className="text-sm font-bold tracking-tight text-[#0b1c30]">
                                Pabalu Admin
                            </span>
                        </div>
                        <a
                            href="/"
                            className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-[#0058be] transition-colors hover:text-[#2170e4]"
                        >
                            <Home className="size-4" />
                            Beranda
                        </a>
                    </div>

                    <div className="flex flex-1 items-center justify-center py-10">
                        <div className="w-full max-w-sm">
                            <header className="mb-8">
                                <h2 className="text-3xl font-bold tracking-tight text-[#0b1c30]">
                                    Selamat datang kembali
                                </h2>
                                <p className="mt-2 text-sm text-[#45464d]">
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

                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="email"
                                                className="text-xs font-semibold uppercase tracking-wider text-[#0b1c30]"
                                            >
                                                Alamat Email
                                            </label>
                                            <div className="relative">
                                                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#76777d]" />
                                                <input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder="admin@pabalu.com"
                                                    className="h-11 w-full rounded-lg border border-[#c6c6cd] bg-white pl-10 pr-3 text-sm text-[#0b1c30] placeholder-[#c6c6cd] shadow-low transition-all focus:border-[#0058be] focus:outline-none focus:ring-2 focus:ring-[#d8e2ff]"
                                                />
                                            </div>
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <label
                                                    htmlFor="password"
                                                    className="text-xs font-semibold uppercase tracking-wider text-[#0b1c30]"
                                                >
                                                    Kata Sandi
                                                </label>
                                                {canResetPassword && (
                                                    <a
                                                        href={request().url}
                                                        tabIndex={5}
                                                        className="text-xs font-semibold tracking-wider text-[#0058be] hover:underline"
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
                                                className="h-11 rounded-lg border border-[#c6c6cd] bg-white pl-3 pr-10 text-sm text-[#0b1c30] placeholder-[#c6c6cd] shadow-low transition-all focus:border-[#0058be] focus:outline-none focus:ring-2 focus:ring-[#d8e2ff]"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <label className="flex cursor-pointer items-center gap-2.5 select-none">
                                            <input
                                                id="remember"
                                                name="remember"
                                                type="checkbox"
                                                tabIndex={3}
                                                className="size-4 rounded border-[#c6c6cd] text-[#0058be] focus:ring-2 focus:ring-[#0058be] focus:ring-offset-1"
                                            />
                                            <span className="text-sm text-[#45464d]">
                                                Ingat saya di perangkat ini
                                            </span>
                                        </label>

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            tabIndex={4}
                                            className="h-11 w-full rounded-lg bg-[#0058be] text-sm font-semibold uppercase tracking-wider text-white shadow-low transition-all hover:bg-[#2170e4] disabled:opacity-60"
                                        >
                                            {processing ? (
                                                <span>Memproses...</span>
                                            ) : (
                                                <>
                                                    <span>Masuk</span>
                                                    <ArrowRight className="size-4" />
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
