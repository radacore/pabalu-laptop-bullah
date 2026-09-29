/* TechCycle · lacak sewa · locked system: design.md */

import { router, useForm } from '@inertiajs/react';
import {
    ChatCircle,
    Check,
    MagnifyingGlass,
    Question,
} from '@phosphor-icons/react';
import { PublicPage } from '@/components/public-layout';
import { formatCurrency } from '@/lib/format';
import type { WebsiteSetting } from '@/types';

type TrackedRental = {
    rental_code: string;
    daily_rate?: number | string | null;
    deposit?: number | string | null;
    total_cost?: number | string | null;
    payment_status?: string;
    rented_at?: string | null;
    due_at?: string | null;
    returned_at?: string | null;
    laptop?: {
        brand?: string | null;
        model?: string | null;
        name?: string | null;
    } | null;
    status?: { name?: string; slug?: string } | null;
};

const stepLabels = ['Dipesan', 'Aktif Disewa', 'Selesai', 'Sudah Kembali'];

function getStepIndex(rental: TrackedRental): number {
    const slug = rental.status?.slug?.toLowerCase() ?? '';

    if (slug.includes('kembali')) {
        return 3;
    }

    if (slug.includes('selesai')) {
        return 2;
    }

    if (slug.includes('aktif') || slug.includes('sewa')) {
        return 1;
    }

    return 0;
}

function formatDate(
    value: string | null | undefined,
    options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    },
) {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleDateString('id-ID', options);
}

export default function RentalTracking({
    rental,
    website,
    error,
    tracking_code,
}: {
    rental?: TrackedRental;
    website: WebsiteSetting;
    error?: string;
    tracking_code?: string;
}) {
    const form = useForm({ code: '' });
    const pageTitle = rental
        ? `Sewa ${rental.rental_code} - ${website.website_name}`
        : `Lacak Sewa - ${website.website_name}`;

    function submitSearch(event: { preventDefault: () => void }) {
        event.preventDefault();
        const code = form.data.code.trim();

        if (code) {
            router.get(`/rentals/track/${code}`);
        }
    }

    if (!rental) {
        return (
            <PublicPage
                website={website}
                title={pageTitle}
                currentPath="/rentals/track"
            >
                <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-6 md:py-14">
                    <div className="mx-auto max-w-2xl">
                        <p className="tc-eyebrow">Lacak sewa</p>
                        <h1 className="mt-3 tc-h1">
                            Cek status penyewaan Anda.
                        </h1>
                        <p
                            className="mt-4 tc-body"
                            style={{ fontSize: '1rem' }}
                        >
                            Masukkan kode sewa untuk melihat status unit, jatuh
                            tempo, dan ringkasan biaya.
                        </p>

                        {error ? (
                            <p
                                className="mt-5 rounded-[10px] border border-tc-rule bg-tc-surface p-4 tc-body"
                                role="alert"
                            >
                                {error}
                                {tracking_code ? (
                                    <>
                                        {' '}
                                        Kode yang dicari:{' '}
                                        <span
                                            className="font-semibold"
                                            style={{
                                                color: 'var(--color-tc-ink)',
                                            }}
                                        >
                                            {tracking_code}
                                        </span>
                                    </>
                                ) : null}
                            </p>
                        ) : null}

                        <form onSubmit={submitSearch} className="mt-7">
                            <label
                                className="tc-search h-14"
                                style={{ padding: 8, paddingLeft: 20 }}
                            >
                                <MagnifyingGlass
                                    className="h-5 w-5 shrink-0"
                                    weight="bold"
                                    aria-hidden="true"
                                    style={{ color: '#A1A1AA' }}
                                />
                                <input
                                    type="text"
                                    value={form.data.code}
                                    onChange={(e) => {
                                        form.setData('code', e.target.value);
                                    }}
                                    placeholder="Kode sewa (contoh: RNT-...)"
                                    aria-label="Kode sewa"
                                />
                                <button
                                    type="submit"
                                    className="tc-btn tc-btn--primary"
                                >
                                    Lacak
                                </button>
                            </label>
                        </form>
                    </div>
                </section>
            </PublicPage>
        );
    }

    const stepIdx = getStepIndex(rental);
    const waText = encodeURIComponent(
        `Halo, saya ingin menanyakan status sewa ${rental.rental_code}.`,
    );
    const waLink = `https://wa.me/${(website.whatsapp_number ?? '6281234567890').replace(/[^0-9]/g, '')}?text=${waText}`;
    const laptopName = [
        rental.laptop?.brand,
        rental.laptop?.model ?? rental.laptop?.name,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <PublicPage
            website={website}
            title={pageTitle}
            currentPath="/rentals/track"
        >
            <section className="border-b border-tc-rule bg-tc-paper">
                <div className="mx-auto max-w-[880px] px-4 py-10 text-center md:px-6 md:py-14">
                    <p className="tc-eyebrow">Tiket sewa</p>
                    <h1 className="mt-3 tc-h1">#{rental.rental_code}</h1>
                    <p className="mt-3 tc-body">
                        {laptopName || 'Unit sewa'} · Mulai{' '}
                        <span
                            className="font-semibold"
                            style={{ color: 'var(--color-tc-ink)' }}
                        >
                            {formatDate(rental.rented_at)}
                        </span>
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                        <span className="tc-badge tc-badge--neutral">
                            {rental.status?.name ?? 'Aktif'}
                        </span>
                        {rental.payment_status === 'paid' ? (
                            <span className="tc-badge tc-badge--neutral">
                                Lunas
                            </span>
                        ) : null}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[880px] px-4 py-10 md:px-6 md:py-14">
                <h2 className="text-center tc-h2">Progres sewa</h2>
                <p className="mt-2 text-center tc-caption">
                    Tahap {stepIdx + 1} dari {stepLabels.length}
                </p>

                <div className="mt-10">
                    <div className="hidden sm:block">
                        <div className="relative flex items-start justify-between">
                            <div className="absolute top-2 right-2 left-2 h-px bg-tc-rule" />
                            <div
                                className="absolute top-2 left-2 h-px bg-tc-ink transition-all duration-500"
                                style={{
                                    width: `calc(${
                                        (stepIdx / (stepLabels.length - 1)) *
                                        100
                                    }%)`,
                                }}
                                aria-hidden="true"
                            />
                            {stepLabels.map((label, index) => {
                                const done = index <= stepIdx;

                                return (
                                    <div
                                        key={label}
                                        className="relative flex w-20 flex-col items-center"
                                    >
                                        <span
                                            className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full"
                                            style={{
                                                background: done
                                                    ? 'var(--color-tc-ink)'
                                                    : 'var(--color-tc-surface)',
                                                border: done
                                                    ? 'none'
                                                    : '2px solid var(--color-tc-rule)',
                                            }}
                                            aria-hidden="true"
                                        />
                                        <p
                                            className="mt-3 text-center tc-caption"
                                            style={
                                                done
                                                    ? {
                                                          color: 'var(--color-tc-ink)',
                                                          fontWeight: 600,
                                                      }
                                                    : undefined
                                            }
                                        >
                                            {String(index + 1).padStart(2, '0')}
                                            <br />
                                            {label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <ol className="space-y-2 sm:hidden">
                        {stepLabels.map((label, index) => {
                            const done = index <= stepIdx;

                            return (
                                <li
                                    key={label}
                                    className="flex items-center gap-3 rounded-[10px] border border-tc-rule bg-tc-surface px-4 py-3"
                                >
                                    <span
                                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                                        style={{
                                            background: done
                                                ? 'var(--color-tc-ink)'
                                                : 'var(--color-tc-media)',
                                            color: done
                                                ? '#fff'
                                                : 'var(--color-tc-secondary)',
                                        }}
                                        aria-hidden="true"
                                    >
                                        {done ? (
                                            <Check
                                                className="h-3.5 w-3.5"
                                                weight="bold"
                                            />
                                        ) : (
                                            <span className="tc-caption">
                                                {index + 1}
                                            </span>
                                        )}
                                    </span>
                                    <span
                                        className="tc-body"
                                        style={
                                            done
                                                ? {
                                                      color: 'var(--color-tc-ink)',
                                                      fontWeight: 600,
                                                  }
                                                : undefined
                                        }
                                    >
                                        {label}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                <div className="mt-10 space-y-4">
                    <div className="tc-card p-6 md:p-7">
                        <h2 className="tc-h3">Ringkasan sewa</h2>
                        <dl className="mt-5">
                            <InfoRow
                                label="Tarif harian"
                                value={formatCurrency(rental.daily_rate)}
                            />
                            <InfoRow
                                label="Deposit"
                                value={formatCurrency(rental.deposit)}
                            />
                            <InfoRow
                                label="Jatuh tempo"
                                value={formatDate(rental.due_at, {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            />
                            {rental.returned_at ? (
                                <InfoRow
                                    label="Dikembalikan"
                                    value={formatDate(rental.returned_at, {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                />
                            ) : null}
                            {rental.total_cost != null ? (
                                <InfoRow
                                    label="Total biaya"
                                    value={formatCurrency(rental.total_cost)}
                                    strong
                                />
                            ) : null}
                        </dl>

                        <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="tc-btn tc-btn--primary tc-btn--block mt-6"
                        >
                            <ChatCircle className="h-4 w-4" weight="bold" />
                            Hubungi kami
                        </a>
                    </div>

                    <div className="tc-card flex items-start gap-3 p-6">
                        <Question
                            className="mt-0.5 h-5 w-5 shrink-0"
                            weight="bold"
                            aria-hidden="true"
                            style={{ color: 'var(--color-tc-ink)' }}
                        />
                        <div>
                            <h2
                                className="text-[0.9375rem] font-semibold"
                                style={{
                                    fontFamily: 'var(--font-tc-body)',
                                    color: 'var(--color-tc-ink)',
                                }}
                            >
                                Butuh bantuan?
                            </h2>
                            <p className="mt-1 tc-body">
                                Punya pertanyaan tentang status sewa atau
                                perpanjangan durasi? Tim support kami siap
                                membantu via WhatsApp.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </PublicPage>
    );
}

function InfoRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="flex items-baseline justify-between gap-4 border-b border-tc-rule py-3 first:pt-0 last:border-0 last:pb-0">
            <dt className="shrink-0 tc-body">{label}</dt>
            <dd
                className="text-right tc-body tabular-nums"
                style={{
                    color: 'var(--color-tc-ink)',
                    fontWeight: strong ? 700 : 500,
                }}
            >
                {value}
            </dd>
        </div>
    );
}
