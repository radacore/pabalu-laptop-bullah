/* Hallmark · genre: modern-minimal · macrostructure: stat-led · theme: hum */

import { router, useForm } from '@inertiajs/react';
import {
    ChatCircle,
    Download,
    MagnifyingGlass,
    Question,
} from '@phosphor-icons/react';

import { PublicPage, formatCurrency } from '@/components/public-layout';
import type { Service, ServiceUpdate, WebsiteSetting } from '@/types';

type StepKey =
    | 'received'
    | 'diagnosis'
    | 'repairing'
    | 'testing'
    | 'ready';

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
                currentPath="/#status"
            >
                <section className="bg-paper py-20 md:py-28">
                    <div className="mx-auto max-w-[640px] px-4 text-center">
                        <h1 className="hum-heading-lg text-ink">
                            Lacak progres
                            <br />
                            servis laptop Anda.
                        </h1>
                        <p className="mx-auto mt-4 max-w-lg hum-body-lg text-ink-2">
                            Masukkan kode tiket untuk melihat status
                            pengerjaan, estimasi selesai, dan ringkasan biaya
                            terbaru.
                        </p>

                        {error ? (
                            <p className="mx-auto mt-6 max-w-md hum-body-sm text-ink">
                                {error}
                                {tracking_code ? (
                                    <>
                                        {' '}
                                        Kode yang dicari:{' '}
                                        <span className="hum-caption">
                                            {tracking_code}
                                        </span>
                                    </>
                                ) : null}
                            </p>
                        ) : null}

                        <form
                            onSubmit={submitSearch}
                            className="mx-auto mt-10 max-w-md"
                        >
                            <label className="flex h-11 items-center gap-3 rounded-pill border border-rule bg-paper px-4 transition focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20">
                                <MagnifyingGlass
                                    className="h-4 w-4 shrink-0 text-ink-2/60"
                                    weight="duotone"
                                />
                                <input
                                    type="text"
                                    value={form.data.code}
                                    onChange={(e) => {
                                        form.setData('code', e.target.value);
                                    }}
                                    placeholder="Kode servis (contoh: SRV-20240613-XXXXX)"
                                    className="min-w-0 flex-1 border-none bg-transparent hum-body text-ink outline-none placeholder:text-ink-2/60"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex h-8 items-center justify-center rounded-full hum-btn hum-btn--pear px-4 hum-caption text-accent-ink transition hover:brightness-110"
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
        `Halo, saya ingin menanyakan status servis ${service.service_code} atas nama ${service.customer?.name ?? '-'}.`,
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
            currentPath="/#status"
        >
            <section className="bg-paper-2 border-b border-rule/60 py-14 md:py-20">
                <div className="mx-auto max-w-[640px] px-4 text-center">
                    <p className="hum-caption uppercase tracking-widest text-ink-2/60">
                        Tiket servis
                    </p>
                    <h1 className="mt-3 hum-heading-lg text-ink">
                        #{service.service_code}
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl hum-body text-ink-2">
                        Pelanggan{' '}
                        <span className="text-ink">
                            {service.customer?.name ?? '-'}
                        </span>{' '}
                        · Diterima{' '}
                        <span className="text-ink">
                            {formatDate(service.received_at)}
                        </span>
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-rule bg-paper px-3.5 hum-caption uppercase text-ink">
                            {service.status?.name ?? 'Aktif'}
                        </span>
                        {service.payment_status === 'paid' ? (
                            <span className="inline-flex h-7 items-center rounded-full border border-rule bg-paper px-3.5 hum-caption uppercase text-ink">
                                Lunas
                            </span>
                        ) : null}
                    </div>
                </div>
            </section>

            <section className="bg-paper border-b border-rule/60 py-16 md:py-20">
                <div className="mx-auto max-w-[640px] px-4">
                    <div>
                        <h2 className="hum-subheading text-center text-ink">
                            Progres servis
                        </h2>
                        <p className="mt-2 text-center hum-caption uppercase text-ink-2/60">
                            Tahap {stepIdx + 1} dari {stepLabels.length}
                        </p>

                        <div className="mt-12">
                            <div className="hidden sm:block">
                                <div className="relative flex items-start justify-between">
                                    <div className="absolute top-2 right-2 left-2 h-px bg-rule" />
                                    <div
                                        className="absolute top-2 left-2 h-px bg-accent transition-all duration-500"
                                        style={{
                                            width: `calc(${
                                                (stepIdx /
                                                    (stepLabels.length - 1)) *
                                                100
                                            }%)`,
                                        }}
                                    />
                                    {stepLabels.map((step, index) => {
                                        const isDone = index < stepIdx;
                                        const isCurrent = index === stepIdx;
                                        return (
                                            <div
                                                key={step.key}
                                                className="relative flex flex-col items-center"
                                            >
                                                <span
                                                    className={`relative z-10 flex h-3 w-3 items-center justify-center rounded-full ${
                                                        isDone || isCurrent
                                                            ? 'bg-accent'
                                                            : 'bg-paper-3'
                                                    }`}
                                                    aria-hidden="true"
                                                />
                                                <p
                                                    className={`mt-3 text-center hum-caption uppercase ${
                                                        isCurrent || isDone
                                                            ? 'text-ink'
                                                            : 'text-ink-2/60'
                                                    }`}
                                                >
                                                    {String(index + 1).padStart(
                                                        2,
                                                        '0',
                                                    )}
                                                    <br />
                                                    {step.label}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <ol className="space-y-4 sm:hidden">
                                {stepLabels.map((step, index) => {
                                    const isDone = index < stepIdx;
                                    const isCurrent = index === stepIdx;
                                    return (
                                        <li
                                            key={step.key}
                                            className="flex items-center gap-3"
                                        >
                                            <span
                                                className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full ${
                                                    isDone || isCurrent
                                                        ? 'bg-accent'
                                                        : 'bg-paper-3'
                                                }`}
                                                aria-hidden="true"
                                            />
                                            <span
                                                className={`hum-body-sm ${
                                                    isCurrent || isDone
                                                        ? 'text-ink'
                                                        : 'text-ink-2/60'
                                                }`}
                                            >
                                                {step.label}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-paper-2 py-16 md:py-20">
                <div className="mx-auto max-w-[640px] px-4">
                    <div className="space-y-8">
                        <div className="shadow-card bg-paper p-7 rounded-[20px]">
                            <h2 className="hum-subheading text-ink">
                                Informasi perangkat
                            </h2>
                            <dl className="mt-6 space-y-4">
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
                            <div className="shadow-card bg-paper p-7 rounded-[20px]">
                                <h2 className="hum-subheading text-ink">
                                    Sparepart digunakan
                                </h2>
                                <ul className="mt-5 space-y-3">
                                    {parts.map((part) => (
                                        <li
                                            key={part.id}
                                            className="flex items-center justify-between gap-4 border-b border-rule/60 pb-3 last:border-0 last:pb-0"
                                        >
                                            <span className="hum-body-sm text-ink-2">
                                                {part.part_name ??
                                                    part.name ??
                                                    '-'}{' '}
                                                <span className="text-ink-2/60">
                                                    ×{part.quantity}
                                                </span>
                                            </span>
                                            <span className="hum-body-sm font-semibold text-ink">
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
                            <div className="shadow-card bg-paper p-7 rounded-[20px]">
                                <h2 className="hum-subheading text-ink">
                                    Update servis
                                </h2>
                                <ol className="mt-6 space-y-5">
                                    {updates.map((update) => (
                                        <li
                                            key={update.id}
                                            className="flex gap-4"
                                        >
                                            <span
                                                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                                                aria-hidden="true"
                                            />
                                            <div>
                                                <p className="hum-body font-semibold text-ink">
                                                    {update.note ||
                                                        update.description ||
                                                        update.title ||
                                                        `Status: ${
                                                            update.new_status ??
                                                            update.status_to ??
                                                            '-'
                                                        }`}
                                                </p>
                                                <p className="mt-1 hum-caption text-ink-2/60">
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

                        <div className="shadow-card bg-paper p-7 rounded-[20px]">
                            <h3 className="hum-subheading text-ink">
                                Ringkasan
                            </h3>

                            {service.estimated_completion_date ? (
                                <div className="mt-4 flex items-baseline justify-between border-b border-rule/60 pb-3">
                                    <span className="hum-body-sm text-ink-2">
                                        Estimasi selesai
                                    </span>
                                    <span className="hum-body-sm text-ink">
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
                                    <span className="hum-body-sm text-ink-2">
                                        Biaya diagnosa
                                    </span>
                                    <span className="hum-body-sm text-ink">
                                        {formatCurrency(diagnosisCost)}
                                    </span>
                                </div>
                                {parts.length > 0 ? (
                                    <div className="flex items-baseline justify-between">
                                        <span className="hum-body-sm text-ink-2">
                                            Sparepart + pasang
                                        </span>
                                        <span className="hum-body-sm text-ink">
                                            {formatCurrency(partTotal)}
                                        </span>
                                    </div>
                                ) : null}
                            </div>

                            <div className="mt-5 flex items-baseline justify-between pt-4">
                                <span className="hum-body font-semibold text-ink">
                                    Total estimasi
                                </span>
                                <span className="hum-body font-semibold text-ink">
                                    {formatCurrency(estimatedTotal)}
                                </span>
                            </div>
                            <p className="mt-2 hum-caption text-ink-2/60">
                                Harga transparan berdasarkan diagnosa terkini.
                                Anda akan diberi tahu jika ada perubahan.
                            </p>

                            <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-full hum-btn hum-btn--pear px-5 hum-body text-accent-ink transition hover:brightness-110"
                            >
                                <ChatCircle
                                    className="mr-1.5 h-3.5 w-3.5"
                                    weight="duotone"
                                />
                                Hubungi teknisi
                            </a>

                            <button
                                type="button"
                                className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full hum-btn hum-btn--outline px-5 hum-body text-ink transition hover:text-accent-2"
                            >
                                <Download
                                    className="mr-1.5 h-3.5 w-3.5"
                                    weight="duotone"
                                />
                                Unduh laporan servis
                            </button>
                        </div>

                        <div className="shadow-card bg-paper p-7 rounded-[20px]">
                            <h4 className="flex items-center gap-2 hum-body font-semibold text-ink">
                                <Question
                                    className="h-4 w-4 text-ink"
                                    weight="duotone"
                                />
                                Butuh bantuan?
                            </h4>
                            <p className="mt-2 hum-body-sm text-ink-2">
                                Punya pertanyaan tentang status perbaikan atau
                                rincian biaya? Tim support kami siap membantu.
                            </p>
                            <a
                                href="/"
                                className="mt-3 inline-block hum-body-sm text-accent transition hover:underline"
                            >
                                Pusat bantuan →
                            </a>
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
        <div className="flex items-baseline justify-between gap-4 border-b border-rule/60 pb-3 last:border-0 last:pb-0">
            <dt className="hum-body-sm text-ink-2">{label}</dt>
            <dd
                className={`text-right hum-body-sm text-ink ${
                    mono ? 'hum-caption' : ''
                }`}
            >
                {value}
            </dd>
        </div>
    );
}
