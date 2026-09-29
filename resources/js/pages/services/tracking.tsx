/* TechCycle · lacak servis · locked system: design.md
 * Form kapsul + stepper progres + kartu info 24px + ringkasan biaya.
 */

import { router, useForm } from '@inertiajs/react';
import {
    ChatCircle,
    Check,
    MagnifyingGlass,
    Question,
} from '@phosphor-icons/react';

import { PublicPage } from '@/components/public-layout';
import { formatCurrency } from '@/lib/format';
import type { Service, ServiceUpdate, WebsiteSetting } from '@/types';

type StepKey = 'received' | 'diagnosis' | 'repairing' | 'testing' | 'ready';

type TrackedService = Service & { updates?: ServiceUpdate[] };

const stepLabels: { key: StepKey; label: string }[] = [
    { key: 'received', label: 'Diterima' },
    { key: 'diagnosis', label: 'Diagnosis' },
    { key: 'repairing', label: 'Pengerjaan' },
    { key: 'testing', label: 'Quality Control' },
    { key: 'ready', label: 'Siap diambil' },
];

function getStepIndex(service: Service): number {
    const slug = service.status?.slug?.toLowerCase() ?? '';
    const name = service.status?.name?.toLowerCase() ?? '';

    if (
        slug.includes('selesai') ||
        slug.includes('diambil') ||
        slug.includes('siap') ||
        name.includes('selesai') ||
        name.includes('siap') ||
        name.includes('diambil')
    ) {
        return 4;
    }

    if (
        slug.includes('pergantian') ||
        slug.includes('menunggu') ||
        name.includes('pergantian') ||
        name.includes('menunggu')
    ) {
        return 2;
    }

    if (slug.includes('pengerjaan') || name.includes('pengerjaan')) {
        return 2;
    }

    if (
        slug.includes('diagnos') ||
        slug.includes('dicek') ||
        name.includes('diagnos') ||
        name.includes('dicek')
    ) {
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

export default function ServiceTracking({
    service,
    website,
    error,
    tracking_code,
}: {
    service?: TrackedService;
    website: WebsiteSetting;
    error?: string;
    tracking_code?: string;
}) {
    const form = useForm({ code: '' });
    const pageTitle = service
        ? `Tiket ${service.service_code} - ${website.website_name}`
        : `Cek Status Servis - ${website.website_name}`;

    function submitSearch(event: { preventDefault: () => void }) {
        event.preventDefault();
        const code = form.data.code.trim();

        if (code) {
            router.get(`/services/track/${code}`);
        }
    }

    if (!service) {
        return (
            <PublicPage
                website={website}
                title={pageTitle}
                currentPath="/services/track"
            >
                <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-6 md:py-14">
                    <div className="mx-auto max-w-2xl">
                        <p className="tc-eyebrow">Lacak servis</p>
                        <h1 className="mt-3 tc-h1">
                            Cek progres servis laptop Anda.
                        </h1>
                        <p
                            className="mt-4 tc-body"
                            style={{ fontSize: '1rem' }}
                        >
                            Masukkan kode tiket untuk melihat status pengerjaan,
                            estimasi selesai, dan ringkasan biaya terbaru.
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
                                    style={{
                                        color: 'var(--color-tc-secondary)',
                                    }}
                                />
                                <input
                                    type="text"
                                    value={form.data.code}
                                    onChange={(e) => {
                                        form.setData('code', e.target.value);
                                    }}
                                    placeholder="Kode servis (contoh: SRV-...)"
                                    aria-label="Kode servis"
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

    const stepIdx = getStepIndex(service);
    const waText = encodeURIComponent(
        `Halo, saya ingin menanyakan status servis ${service.service_code}.`,
    );
    const waLink = `https://wa.me/${(website.whatsapp_number ?? '6281234567890').replace(/[^0-9]/g, '')}?text=${waText}`;
    const parts = service.parts ?? [];
    const updates = service.updates ?? [];
    const partTotal = parts.reduce(
        (sum, part) =>
            sum +
            (Number(part.selling_price ?? 0) +
                Number(part.installation_fee ?? 0)) *
                part.quantity,
        0,
    );
    const diagnosisCost = 50_000;
    const estimatedTotal = Number(
        service.estimated_cost ?? diagnosisCost + partTotal,
    );

    return (
        <PublicPage
            website={website}
            title={pageTitle}
            currentPath="/services/track"
        >
            <section className="border-b border-tc-rule bg-tc-paper">
                <div className="mx-auto max-w-[880px] px-4 py-10 text-center md:px-6 md:py-14">
                    <p className="tc-eyebrow">Tiket servis</p>
                    <h1 className="mt-3 tc-h1">#{service.service_code}</h1>
                    <p className="mt-3 tc-body">
                        Diterima{' '}
                        <span
                            className="font-semibold"
                            style={{ color: 'var(--color-tc-ink)' }}
                        >
                            {formatDate(service.received_at)}
                        </span>
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                        <span className="tc-badge tc-badge--neutral">
                            {service.status?.name ?? 'Aktif'}
                        </span>
                        {service.payment_status === 'paid' ? (
                            <span className="tc-badge tc-badge--neutral">
                                Lunas
                            </span>
                        ) : null}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[880px] px-4 py-10 md:px-6 md:py-14">
                <h2 className="text-center tc-h2">Progres servis</h2>
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
                            {stepLabels.map((step, index) => {
                                const done = index <= stepIdx;

                                return (
                                    <div
                                        key={step.key}
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
                                            {step.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <ol className="space-y-2 sm:hidden">
                        {stepLabels.map((step, index) => {
                            const done = index <= stepIdx;

                            return (
                                <li
                                    key={step.key}
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
                                        {step.label}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                <div className="mt-10 space-y-4">
                    <div className="tc-card p-6 md:p-7">
                        <h2 className="tc-h3">Informasi perangkat</h2>
                        <dl className="mt-5">
                            <InfoRow
                                label="Model"
                                value={`${service.brand ?? '-'} ${
                                    service.model ?? '-'
                                }`}
                            />
                            {service.device_name ? (
                                <InfoRow
                                    label="Perangkat"
                                    value={service.device_name}
                                />
                            ) : null}
                            {service.serial_number ? (
                                <InfoRow
                                    label="Serial number"
                                    value={service.serial_number}
                                    mono
                                />
                            ) : null}
                            {service.kelengkapan ? (
                                <InfoRow
                                    label="Kelengkapan"
                                    value={service.kelengkapan}
                                />
                            ) : null}
                            <InfoRow
                                label="Keluhan"
                                value={service.complaint ?? '-'}
                            />
                            {service.initial_condition ? (
                                <InfoRow
                                    label="Kondisi awal"
                                    value={service.initial_condition}
                                />
                            ) : null}
                        </dl>
                    </div>

                    {parts.length > 0 ? (
                        <div className="tc-card p-6 md:p-7">
                            <h2 className="tc-h3">Sparepart digunakan</h2>
                            <ul className="mt-5">
                                {parts.map((part) => (
                                    <li
                                        key={part.id}
                                        className="flex items-center justify-between gap-4 border-b border-tc-rule py-3 first:pt-0 last:border-0 last:pt-3 last:pb-0"
                                    >
                                        <span className="tc-body">
                                            {part.part_name ?? part.name ?? '-'}{' '}
                                            <span>×{part.quantity}</span>
                                        </span>
                                        <span
                                            className="tc-body font-semibold tabular-nums"
                                            style={{
                                                color: 'var(--color-tc-ink)',
                                            }}
                                        >
                                            {formatCurrency(
                                                part.selling_price ??
                                                    part.price ??
                                                    0,
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    {updates.length > 0 ? (
                        <div className="tc-card p-6 md:p-7">
                            <h2 className="tc-h3">Update servis</h2>
                            <ol className="mt-6 space-y-5">
                                {updates.map((update) => (
                                    <li key={update.id} className="flex gap-4">
                                        <span
                                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tc-ink"
                                            aria-hidden="true"
                                        />
                                        <div>
                                            <p
                                                className="tc-body font-semibold"
                                                style={{
                                                    color: 'var(--color-tc-ink)',
                                                }}
                                            >
                                                {update.note ||
                                                    update.description ||
                                                    update.title ||
                                                    `Status: ${
                                                        update.new_status ??
                                                        update.status_to ??
                                                        '-'
                                                    }`}
                                            </p>
                                            <p className="mt-1 tc-caption">
                                                {new Date(
                                                    update.created_at,
                                                ).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ) : null}

                    <div className="tc-card p-6 md:p-7">
                        <h2 className="tc-h3">Ringkasan</h2>

                        {service.estimated_completion_date ? (
                            <div className="mt-4 flex items-baseline justify-between border-b border-tc-rule pb-3">
                                <span className="tc-body">
                                    Estimasi selesai
                                </span>
                                <span
                                    className="tc-body font-medium"
                                    style={{ color: 'var(--color-tc-ink)' }}
                                >
                                    {formatDate(
                                        service.estimated_completion_date,
                                        {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        },
                                    )}
                                </span>
                            </div>
                        ) : null}

                        <div className="mt-4 space-y-2.5">
                            <div className="flex items-baseline justify-between">
                                <span className="tc-body">Biaya diagnosa</span>
                                <span
                                    className="tc-body tabular-nums"
                                    style={{ color: 'var(--color-tc-ink)' }}
                                >
                                    {formatCurrency(diagnosisCost)}
                                </span>
                            </div>
                            {parts.length > 0 ? (
                                <div className="flex items-baseline justify-between">
                                    <span className="tc-body">
                                        Sparepart + pasang
                                    </span>
                                    <span
                                        className="tc-body tabular-nums"
                                        style={{
                                            color: 'var(--color-tc-ink)',
                                        }}
                                    >
                                        {formatCurrency(partTotal)}
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        <div className="mt-5 flex items-baseline justify-between border-t border-tc-rule pt-4">
                            <span
                                className="text-[0.9375rem] font-semibold"
                                style={{
                                    fontFamily: 'var(--font-tc-body)',
                                    color: 'var(--color-tc-ink)',
                                }}
                            >
                                Total estimasi
                            </span>
                            <span
                                className="tc-price"
                                style={{ fontSize: '1.25rem' }}
                            >
                                {formatCurrency(estimatedTotal)}
                            </span>
                        </div>
                        <p className="mt-2 tc-caption">
                            Harga transparan berdasarkan diagnosa terkini. Anda
                            akan diberi tahu jika ada perubahan.
                        </p>

                        <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="tc-btn tc-btn--primary tc-btn--block mt-6"
                        >
                            <ChatCircle className="h-4 w-4" weight="bold" />
                            Hubungi teknisi
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
                                Punya pertanyaan tentang status perbaikan atau
                                rincian biaya? Tim support kami siap membantu
                                via WhatsApp.
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
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex items-baseline justify-between gap-4 border-b border-tc-rule py-3 first:pt-0 last:border-0 last:pb-0">
            <dt className="shrink-0 tc-body">{label}</dt>
            <dd
                className="text-right tc-body font-medium tabular-nums"
                style={{
                    color: 'var(--color-tc-ink)',
                    fontFamily: mono ? 'ui-monospace, monospace' : undefined,
                }}
            >
                {value}
            </dd>
        </div>
    );
}
