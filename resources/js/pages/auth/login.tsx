import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ChartLineUp,
    EnvelopeSimple,
    Laptop,
    Storefront,
    Wrench,
} from '@phosphor-icons/react';

import InputError from '@/components/shared/input-error';
import PasswordInput from '@/components/shared/password-input';
import { store } from '@/routes/login';
import type { WebsiteSetting } from '@/types';

type Props = {
    status?: string;
    website: WebsiteSetting;
};

export default function Login({ status, website }: Props) {
    return (
        <>
            <Head title="Masuk" />

            <div
                className="flex min-h-screen"
                style={{ background: 'var(--color-tc-paper)' }}
            >
                {/* Left Panel - Brand & Features */}
                <aside
                    className="relative hidden flex-col overflow-hidden lg:flex lg:w-1/2 lg:px-14 lg:py-14"
                    style={{ background: 'var(--color-tc-ink)' }}
                >
                    {/* Logo — fixed at top-left */}
                    <Link
                        href="/"
                        className="relative flex items-center gap-3 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        aria-label={`${website.website_name} - beranda`}
                    >
                        {website.logo ? (
                            <img
                                src={`/storage/${website.logo}`}
                                alt={website.website_name}
                                className="h-11 w-11 rounded-full object-cover"
                            />
                        ) : (
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black">
                                <Storefront
                                    className="h-5 w-5"
                                    weight="fill"
                                    aria-hidden="true"
                                />
                            </span>
                        )}
                        <span>
                            <span
                                className="block text-[0.9375rem] font-bold text-white"
                                style={{
                                    fontFamily: 'var(--font-tc-display)',
                                }}
                            >
                                {website.website_name}
                            </span>
                            <span className="block text-xs text-white/60">
                                Portal Manajemen Internal
                            </span>
                        </span>
                    </Link>

                    {/* Content — centered vertically */}
                    <div className="flex flex-1 flex-col justify-center">
                        <div className="space-y-10">
                            <div>
                                <h1
                                    className="text-4xl font-bold text-white xl:text-5xl"
                                    style={{
                                        fontFamily: 'var(--font-tc-display)',
                                        letterSpacing: '-0.02em',
                                        lineHeight: 1.1,
                                    }}
                                >
                                    Kelola bisnis laptop Anda dengan percaya
                                    diri.
                                </h1>
                                <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-white/70">
                                    Pantau inventaris, lacak servis, dan kelola
                                    transaksi keuangan dalam satu platform
                                    terpadu.
                                </p>
                            </div>

                            {/* Feature List */}
                            <ul className="space-y-5">
                                <li className="flex items-start gap-4">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-white/10">
                                        <Laptop
                                            className="h-5 w-5 text-white"
                                            weight="duotone"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold text-white">
                                            Manajemen Inventaris
                                        </span>
                                        <span className="mt-0.5 block text-sm text-white/60">
                                            Stok laptop baru dan bekas dengan
                                            foto, spesifikasi, dan status
                                            real-time.
                                        </span>
                                    </span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-white/10">
                                        <Wrench
                                            className="h-5 w-5 text-white"
                                            weight="duotone"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold text-white">
                                            Layanan Servis
                                        </span>
                                        <span className="mt-0.5 block text-sm text-white/60">
                                            Tiket servis, sparepart, dan
                                            timeline update untuk setiap
                                            pelanggan.
                                        </span>
                                    </span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-white/10">
                                        <ChartLineUp
                                            className="h-5 w-5 text-white"
                                            weight="duotone"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold text-white">
                                            Pencatatan Keuangan
                                        </span>
                                        <span className="mt-0.5 block text-sm text-white/60">
                                            Pemasukan, pengeluaran, dan laporan
                                            laba-rugi otomatis.
                                        </span>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </aside>

                {/* Right Panel - Login Form */}
                <main className="flex w-full flex-col p-6 lg:w-1/2 lg:p-10 xl:p-12">
                    <div className="flex flex-1 items-center justify-center py-10">
                        <div className="w-full max-w-sm">
                            <header className="mb-8">
                                <h2 className="tc-h2">
                                    Selamat datang kembali
                                </h2>
                                <p className="mt-2 tc-body">
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
                                            <div
                                                role="status"
                                                className="rounded-[16px] border border-tc-rule bg-white px-4 py-3 tc-body font-medium"
                                                style={{
                                                    color: 'var(--color-tc-ink)',
                                                }}
                                            >
                                                {status}
                                            </div>
                                        )}

                                        {/* Email Field */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="email"
                                                className="tc-caption"
                                            >
                                                Alamat Email
                                            </label>
                                            <div className="relative">
                                                <EnvelopeSimple
                                                    className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
                                                    style={{
                                                        color: 'var(--color-tc-secondary)',
                                                    }}
                                                    weight="duotone"
                                                    aria-hidden="true"
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
                                                    className="h-11 w-full rounded-full border border-tc-rule bg-white pr-4 pl-11 tc-body transition-colors outline-none placeholder:text-tc-secondary/60 focus:border-tc-ink"
                                                />
                                            </div>
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        {/* Password Field */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="password"
                                                className="tc-caption"
                                            >
                                                Kata Sandi
                                            </label>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="h-11 rounded-full border border-tc-rule bg-white pr-10 pl-4 tc-body transition-colors outline-none placeholder:text-tc-secondary/60 focus:border-tc-ink"
                                            />
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        {/* Remember Me */}
                                        <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 select-none">
                                            <input
                                                id="remember"
                                                name="remember"
                                                type="checkbox"
                                                tabIndex={3}
                                                className="h-4 w-4 shrink-0 cursor-pointer rounded accent-[#111111]"
                                            />
                                            <span className="tc-body">
                                                Ingat saya di perangkat ini
                                            </span>
                                        </label>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            tabIndex={4}
                                            className="tc-btn tc-btn--primary tc-btn--block"
                                        >
                                            {processing ? (
                                                <span>Memproses...</span>
                                            ) : (
                                                <>
                                                    <span>Masuk</span>
                                                    <ArrowRight
                                                        className="h-4 w-4"
                                                        weight="bold"
                                                        aria-hidden="true"
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
