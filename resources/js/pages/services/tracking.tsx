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
                <section className="bg-cloud py-20 md:py-28">
                    <div className="mx-auto max-w-[640px] px-4 text-center">
                        <h1 className="apple-heading-lg text-graphite">
                            Lacak progres
                            <br />
                            servis laptop Anda.
                        </h1>
                        <p className="mx-auto mt-4 max-w-lg apple-body-lg text-slate-2">
                            Masukkan kode tiket untuk melihat status
                            pengerjaan, estimasi selesai, dan ringkasan biaya
                            terbaru.
                        </p>

                        {error ? (
                            <p className="mx-auto mt-6 max-w-md apple-body-sm text-graphite">
                                {error}
                                {tracking_code ? (
                                    <>
                                        {' '}
                                        Kode yang dicari:{' '}
                                        <span className="font-mono">
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
                            <label className="flex h-11 items-center gap-3 rounded-pill border border-bone bg-paper px-4 transition focus-within:border-apple-blue focus-within:ring-4 focus-within:ring-apple-blue/20">
                                <MagnifyingGlass
                                    className="h-4 w-4 shrink-0 text-fog"
                                    weight="duotone"
                                />
                                <input
                                    type="text"
                                    value={form.data.code}
                                    onChange={(e) => {
                                        form.setData('code', e.target.value);
                                    }}
                                    placeholder="Kode servis (contoh: SRV-20240613-XXXXX)"
                                    className="min-w-0 flex-1 border-none bg-transparent apple-body text-graphite outline-none placeholder:text-fog"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex h-8 items-center justify-center rounded-pill bg-button-blue px-4 apple-caption text-paper transition hover:bg-deep-link-blue"
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
            <section className="bg-cloud py-14 md:py-20">
                <div className="mx-auto max-w-[980px] px-4 text-center">
                    <p className="apple-caption text-fog">Tiket servis</p>
                    <h1 className="mt-3 apple-display text-graphite">
                        #{service.service_code}
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl apple-body text-slate-2">
                        Pelanggan{' '}
                        <span className="text-graphite">
                            {service.customer?.name ?? '-'}
                        </span>{' '}
                        · Diterima{' '}
                        <span className="text-graphite">
                            {formatDate(service.received_at)}
                        </span>
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        <span className="inline-flex h-7 items-center gap-1.5 rounded-pill bg-paper px-3.5 apple-caption text-graphite">
                            {service.status?.name ?? 'Aktif'}
                        </span>
                        {service.payment_status === 'paid' ? (
                            <span className="inline-flex h-7 items-center rounded-pill bg-paper px-3.5 apple-caption text-graphite">
                                Lunas
                            </span>
                        ) : null}
                    </div>
                </div>
            </section>

            <section className="bg-paper py-16 md:py-20">
                <div className="mx-auto max-w-[980px] px-4">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="apple-heading text-center text-graphite">
                            Progres servis
                        </h2>
                        <p className="mt-2 text-center apple-caption text-fog">
                            Tahap {stepIdx + 1} dari {stepLabels.length}
                        </p>

                        <div className="mt-12">
                            <div className="hidden sm:block">
                                <div className="relative flex items-start justify-between">
                                    <div className="absolute top-2 right-2 left-2 h-px bg-bone" />
                                    <div
                                        className="absolute top-2 left-2 h-px bg-graphite transition-all duration-500"
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
                                                    className={`relative z-10 flex h-4 w-4 items-center justify-center rounded-pill ${
                                                        isDone || isCurrent
                                                            ? 'bg-graphite'
                                                            : 'bg-bone'
                                                    }`}
                                                    aria-hidden="true"
                                                />
                                                <p
                                                    className={`mt-3 text-center apple-caption ${
                                                        isCurrent || isDone
                                                            ? 'text-graphite'
                                                            : 'text-fog'
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
                                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-pill ${
                                                    isDone || isCurrent
                                                        ? 'bg-graphite'
                                                        : 'bg-bone'
                                                }`}
                                                aria-hidden="true"
                                            />
                                            <span
                                                className={`apple-body-sm ${
                                                    isCurrent || isDone
                                                        ? 'text-graphite'
                                                        : 'text-fog'
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

            <section className="bg-cloud py-16 md:py-20">
                <div className="mx-auto max-w-[980px] px-4">
                    <div className="grid gap-10 md:grid-cols-[1fr_340px]">
                        <div>
                            <div className="rounded-card border border-bone bg-paper p-7 md:p-9">
                                <h2 className="apple-heading text-graphite">
                                    Informasi perangkat
                                </h2>
                                <dl className="mt-7 space-y-4">
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
                                <div className="mt-8 rounded-card border border-bone bg-paper p-7 md:p-9">
                                    <h2 className="apple-heading text-graphite">
                                        Sparepart digunakan
                                    </h2>
                                    <ul className="mt-5 space-y-3">
                                        {parts.map((part) => (
                                            <li
                                                key={part.id}
                                                className="flex items-center justify-between gap-4 border-b border-bone pb-3 last:border-0 last:pb-0"
                                            >
                                                <span className="apple-body-sm text-slate-2">
                                                    {part.part_name ??
                                                        part.name ??
                                                        '-'}{' '}
                                                    <span className="text-fog">
                                                        ×{part.quantity}
                                                    </span>
                                                </span>
                                                <span className="apple-body-sm font-semibold text-graphite">
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
                                <div className="mt-8 rounded-card border border-bone bg-paper p-7 md:p-9">
                                    <h2 className="apple-heading text-graphite">
                                        Update servis
                                    </h2>
                                    <ol className="mt-6 space-y-5">
                                        {updates.map((update) => (
                                            <li
                                                key={update.id}
                                                className="flex gap-4"
                                            >
                                                <span
                                                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-pill bg-graphite"
                                                    aria-hidden="true"
                                                />
                                                <div>
                                                    <p className="apple-body font-semibold text-graphite">
                                                        {update.note ||
                                                            update.description ||
                                                            update.title ||
                                                            `Status: ${
                                                                update.new_status ??
                                                                update.status_to ??
                                                                '-'
                                                            }`}
                                                    </p>
                                                    <p className="mt-1 apple-caption text-fog">
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
                        </div>

                        <aside className="md:sticky md:top-16 md:self-start">
                            <div className="rounded-card border border-bone bg-paper p-7">
                                <h3 className="apple-body font-semibold text-graphite">
                                    Ringkasan
                                </h3>

                                {service.estimated_completion_date ? (
                                    <div className="mt-4 flex items-baseline justify-between border-b border-bone pb-3">
                                        <span className="apple-body-sm text-slate-2">
                                            Estimasi selesai
                                        </span>
                                        <span className="apple-body-sm text-graphite">
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
                                        <span className="apple-body-sm text-slate-2">
                                            Biaya diagnosa
                                        </span>
                                        <span className="apple-body-sm text-graphite">
                                            {formatCurrency(diagnosisCost)}
                                        </span>
                                    </div>
                                    {parts.length > 0 ? (
                                        <div className="flex items-baseline justify-between">
                                            <span className="apple-body-sm text-slate-2">
                                                Sparepart + pasang
                                            </span>
                                            <span className="apple-body-sm text-graphite">
                                                {formatCurrency(partTotal)}
                                            </span>
                                        </div>
                                    ) : null}
                                </div>

                                <div className="mt-5 flex items-baseline justify-between border-t border-bone pt-4">
                                    <span className="apple-body font-semibold text-graphite">
                                        Total estimasi
                                    </span>
                                    <span className="apple-body font-semibold text-graphite">
                                        {formatCurrency(estimatedTotal)}
                                    </span>
                                </div>
                                <p className="mt-2 apple-caption text-fog">
                                    Harga transparan berdasarkan diagnosa
                                    terkini. Anda akan diberi tahu jika ada
                                    perubahan.
                                </p>

                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-pill bg-button-blue px-5 apple-body text-paper transition hover:bg-deep-link-blue"
                                >
                                    <ChatCircle
                                        className="mr-1.5 h-3.5 w-3.5"
                                        weight="fill"
                                    />
                                    Hubungi teknisi
                                </a>

                                <button
                                    type="button"
                                    className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-pill border border-apple-blue bg-transparent px-5 apple-body text-apple-blue transition hover:border-deep-link-blue hover:text-deep-link-blue"
                                >
                                    <Download
                                        className="mr-1.5 h-3.5 w-3.5"
                                        weight="duotone"
                                    />
                                    Unduh laporan servis
                                </button>
                            </div>

                            <div className="mt-4 rounded-card border border-bone bg-paper p-7">
                                <h4 className="flex items-center gap-2 apple-body font-semibold text-graphite">
                                    <Question
                                        className="h-4 w-4 text-graphite"
                                        weight="duotone"
                                    />
                                    Butuh bantuan?
                                </h4>
                                <p className="mt-2 apple-body-sm text-slate-2">
                                    Punya pertanyaan tentang status perbaikan
                                    atau rincian biaya? Tim support kami siap
                                    membantu.
                                </p>
                                <a
                                    href="/"
                                    className="mt-3 inline-block apple-body-sm text-apple-blue transition hover:text-deep-link-blue"
                                >
                                    Pusat bantuan →
                                </a>
                            </div>
                        </aside>
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
        <div className="flex items-baseline justify-between gap-4 border-b border-bone pb-3 last:border-0 last:pb-0">
            <dt className="apple-body-sm text-slate-2">{label}</dt>
            <dd
                className={`text-right apple-body-sm text-graphite ${
                    mono ? 'font-mono' : ''
                }`}
            >
                {value}
            </dd>
        </div>
    );
}
