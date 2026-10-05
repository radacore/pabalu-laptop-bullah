/* TechCycle · katalog sparepart · locked system: design.md */

import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CaretDown,
    Cpu,
    Funnel,
    MagnifyingGlass,
    X,
} from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PublicPage } from '@/components/public-layout';
import Reveal from '@/components/shared/reveal';
import { formatShortPrice } from '@/lib/format';
import type { PaginatedResponse, Sparepart, WebsiteSetting } from '@/types';

type SparepartFilters = {
    search?: string;
    types: string[];
    condition?: string;
    max_price?: number | null;
    sort?: string;
};

type FilterOptions = {
    types: Array<{ id: number; name: string; slug: string }>;
    conditions: string[];
    max_price: number;
};

interface Props {
    spareparts: PaginatedResponse<Sparepart>;
    filters: SparepartFilters;
    filter_options: FilterOptions;
    website: WebsiteSetting;
}

function photoUrl(sparepart: Sparepart) {
    const photo = sparepart.photos?.[0];

    if (!photo?.file_path) {
        return null;
    }

    return `/storage/${photo.file_path}`;
}

function buildUrl(page: number, filters: SparepartFilters) {
    const params = new URLSearchParams();

    if (filters.search) {
        params.set('search', filters.search);
    }

    if (filters.types) {
        for (const t of filters.types) {
            params.append('types[]', t);
        }
    }

    if (filters.condition) {
        params.set('condition', filters.condition);
    }

    if (filters.max_price) {
        params.set('max_price', String(filters.max_price));
    }

    if (filters.sort && filters.sort !== 'newest') {
        params.set('sort', filters.sort);
    }

    if (page > 1) {
        params.set('page', String(page));
    }

    const query = params.toString();

    return query ? `/sparepart?${query}` : '/sparepart';
}

export default function SparepartCatalog({
    spareparts,
    filters,
    filter_options,
    website,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [types, setTypes] = useState<string[]>(filters.types ?? []);
    const [condition, setCondition] = useState(filters.condition ?? '');
    const [maxPrice, setMaxPrice] = useState(
        filters.max_price ?? filter_options.max_price,
    );
    const [sort, setSort] = useState(filters.sort ?? 'newest');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    // Animasi Reveal hanya untuk kunjungan pertama. Kunjungan berikutnya
    // (filter/paginasi) mematikan animasi agar tidak terasa refresh.
    const [animationsOn, setAnimationsOn] = useState(true);

    useEffect(() => {
        return router.on('start', () => setAnimationsOn(false));
    }, []);

    const activeFilterCount = useMemo(
        () =>
            types.length +
            (condition ? 1 : 0) +
            (search ? 1 : 0) +
            (maxPrice < filter_options.max_price ? 1 : 0),
        [types.length, condition, filter_options.max_price, maxPrice, search],
    );

    function applyFilters(overrides?: Partial<SparepartFilters>) {
        const next = {
            search: overrides?.search ?? search,
            types: overrides?.types ?? types,
            condition: overrides?.condition ?? condition,
            max_price: overrides?.max_price ?? maxPrice,
            sort: overrides?.sort ?? sort,
        };
        router.get(
            '/sparepart',
            {
                search: next.search || undefined,
                types: next.types.length > 0 ? next.types : undefined,
                condition: next.condition || undefined,
                max_price:
                    next.max_price < filter_options.max_price
                        ? next.max_price
                        : undefined,
                sort: next.sort === 'newest' ? undefined : next.sort,
            },
            // preserveScroll: posisi diam di grid (tidak lompat ke atas).
            // only: cukup data grid yang di-fetch ulang (payload kecil).
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['spareparts'],
            },
        );
    }

    function submit(event: { preventDefault: () => void }) {
        event.preventDefault();
        applyFilters();
    }

    function toggleType(slug: string) {
        const next = types.includes(slug)
            ? types.filter((t) => t !== slug)
            : [...types, slug];
        setTypes(next);
        applyFilters({ types: next });
    }

    function resetFilters() {
        setSearch('');
        setTypes([]);
        setCondition('');
        setMaxPrice(filter_options.max_price);
        setSort('newest');
        router.get(
            '/sparepart',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['spareparts'],
            },
        );
    }

    // Slider harga: debounce 400ms agar drag tidak menembak puluhan
    // request. Nilai lokal update instan, request menyusul.
    const maxPriceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function scheduleMaxPriceApply(value: number) {
        if (maxPriceTimer.current) {
            clearTimeout(maxPriceTimer.current);
        }

        maxPriceTimer.current = setTimeout(() => {
            applyFilters({ max_price: value });
        }, 400);
    }

    useEffect(() => {
        return () => {
            if (maxPriceTimer.current) {
                clearTimeout(maxPriceTimer.current);
            }
        };
    }, []);

    const filterContent = (
        <form onSubmit={submit} className="space-y-7">
            {filter_options.types.length > 0 ? (
                <FilterGroup title="Tipe">
                    <div className="space-y-1">
                        {filter_options.types.map((type) => {
                            const active = types.includes(type.slug);

                            return (
                                <label
                                    key={type.slug}
                                    className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-[10px] px-2 transition hover:bg-tc-media"
                                >
                                    <input
                                        type="checkbox"
                                        checked={active}
                                        onChange={() => toggleType(type.slug)}
                                        className="h-4 w-4 shrink-0 accent-black"
                                    />
                                    <span
                                        className="tc-body"
                                        style={
                                            active
                                                ? {
                                                      color: 'var(--color-tc-ink)',
                                                      fontWeight: 600,
                                                  }
                                                : undefined
                                        }
                                    >
                                        {type.name}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </FilterGroup>
            ) : null}

            <FilterGroup title="Kondisi">
                <div className="flex flex-wrap gap-2">
                    {filter_options.conditions.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => {
                                const next = condition === c ? '' : c;
                                setCondition(next);
                                applyFilters({ condition: next });
                            }}
                            data-active={condition === c}
                            className="tc-chip"
                        >
                            {c === 'baru' ? 'Baru' : 'Bekas'}
                        </button>
                    ))}
                </div>
            </FilterGroup>

            <FilterGroup title="Harga maksimal">
                <input
                    type="range"
                    min="0"
                    max={filter_options.max_price}
                    step="25000"
                    value={maxPrice}
                    onChange={(e) => {
                        const value = Number(e.target.value);
                        setMaxPrice(value);
                        scheduleMaxPriceApply(value);
                    }}
                    className="h-1 w-full cursor-pointer accent-black"
                    aria-label="Harga maksimal"
                />
                <div className="mt-3 flex items-center justify-between">
                    <span className="tc-caption">Rp 0</span>
                    <span
                        className="tc-caption font-semibold"
                        style={{ color: 'var(--color-tc-ink)' }}
                    >
                        {formatShortPrice(maxPrice)}
                    </span>
                </div>
            </FilterGroup>

            <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                    type="button"
                    onClick={resetFilters}
                    className="tc-btn tc-btn--secondary tc-btn--sm"
                >
                    <X className="h-3.5 w-3.5" weight="bold" />
                    Reset
                </button>
                <button
                    type="submit"
                    className="tc-btn tc-btn--primary tc-btn--sm"
                >
                    Terapkan
                </button>
            </div>
        </form>
    );

    return (
        <PublicPage
            website={website}
            title={`Sparepart - ${website.website_name}`}
            currentPath="/sparepart"
        >
            <section className="border-b border-tc-rule bg-tc-paper">
                <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-6 md:py-14">
                    <p className="tc-eyebrow">Sparepart</p>
                    <h1 className="mt-3 max-w-3xl tc-h1">
                        Sparepart baru &amp; bekas, siap pasang.
                    </h1>
                    <p
                        className="mt-4 max-w-2xl tc-body"
                        style={{ fontSize: '1rem' }}
                    >
                        Komponen original dan alternatif berkualitas, filter
                        berdasarkan kondisi dan tipe.
                    </p>

                    <form onSubmit={submit} className="mt-7 max-w-xl">
                        <label className="tc-search">
                            <MagnifyingGlass
                                className="h-4 w-4 shrink-0"
                                weight="bold"
                                aria-hidden="true"
                                style={{ color: 'var(--color-tc-secondary)' }}
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari baterai, layar, keyboard..."
                                aria-label="Cari sparepart"
                            />
                            <button
                                type="submit"
                                className="tc-btn tc-btn--primary tc-btn--sm"
                            >
                                Cari
                            </button>
                        </label>
                    </form>
                </div>
            </section>

            <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-6 md:py-14 lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
                <aside className="hidden lg:block">
                    <Reveal className="sticky top-32">
                        <div className="mb-5 flex items-baseline justify-between border-b border-tc-rule pb-4">
                            <h2
                                className="text-[0.9375rem] font-semibold"
                                style={{
                                    fontFamily: 'var(--font-tc-body)',
                                    color: 'var(--color-tc-ink)',
                                }}
                            >
                                Filter
                            </h2>
                            {activeFilterCount > 0 ? (
                                <span className="tc-caption">
                                    {activeFilterCount} aktif
                                </span>
                            ) : null}
                        </div>
                        {filterContent}
                    </Reveal>
                </aside>

                <div className="mb-6 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setShowMobileFilters(true)}
                        className="tc-btn tc-btn--secondary w-full"
                    >
                        <Funnel className="h-4 w-4" weight="bold" />
                        Filter
                        {activeFilterCount > 0 ? (
                            <span
                                className="tc-badge tc-badge--neutral"
                                style={{ padding: '2px 8px' }}
                            >
                                {activeFilterCount}
                            </span>
                        ) : null}
                    </button>

                    {showMobileFilters ? (
                        <div
                            className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Filter katalog sparepart"
                        >
                            <div className="flex items-center justify-between border-b border-tc-rule px-4 py-3">
                                <h2
                                    className="text-[0.9375rem] font-semibold"
                                    style={{
                                        fontFamily: 'var(--font-tc-body)',
                                        color: 'var(--color-tc-ink)',
                                    }}
                                >
                                    Filter
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowMobileFilters(false)}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-tc-media"
                                    style={{ color: 'var(--color-tc-ink)' }}
                                    aria-label="Tutup filter"
                                >
                                    <X className="h-5 w-5" weight="bold" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-5 py-5">
                                {filterContent}
                            </div>
                        </div>
                    ) : null}
                </div>

                <div>
                    <div className="mb-6 flex flex-col items-start gap-3 border-b border-tc-rule pb-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="tc-body">
                            <span
                                className="font-semibold"
                                style={{ color: 'var(--color-tc-ink)' }}
                            >
                                {spareparts.total}
                            </span>{' '}
                            sparepart tersedia
                        </p>
                        <label className="flex items-center gap-2 tc-caption">
                            Urutkan
                            <span className="relative">
                                <select
                                    value={sort}
                                    onChange={(e) => {
                                        const next = e.target.value;
                                        setSort(next);
                                        applyFilters({ sort: next });
                                    }}
                                    className="appearance-none rounded-full border border-tc-rule bg-white py-2 pr-9 pl-4 text-[0.8125rem] font-semibold transition outline-none focus:border-black"
                                    style={{ color: 'var(--color-tc-ink)' }}
                                >
                                    <option value="newest">Terbaru</option>
                                    <option value="price_asc">
                                        Harga: rendah ke tinggi
                                    </option>
                                    <option value="price_desc">
                                        Harga: tinggi ke rendah
                                    </option>
                                </select>
                                <CaretDown
                                    className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2"
                                    weight="bold"
                                    aria-hidden="true"
                                    style={{
                                        color: 'var(--color-tc-secondary)',
                                    }}
                                />
                            </span>
                        </label>
                    </div>

                    {spareparts.data.length === 0 ? (
                        <div className="tc-card p-12 text-center">
                            <Cpu
                                className="mx-auto h-10 w-10"
                                weight="duotone"
                                aria-hidden="true"
                                style={{
                                    color: 'var(--color-tc-secondary)',
                                    opacity: 0.5,
                                }}
                            />
                            <p className="mx-auto mt-4 max-w-md tc-body">
                                Sparepart tidak ditemukan. Coba ubah kata kunci,
                                tipe, kondisi, atau harga maksimal.
                            </p>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="tc-btn tc-btn--secondary tc-btn--sm mt-5"
                            >
                                Reset semua filter
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                            {spareparts.data.map((sparepart, i) => (
                                <Reveal
                                    key={sparepart.id}
                                    delay={(i % 9) * 60}
                                    instant={!animationsOn}
                                >
                                    <SparepartCard sparepart={sparepart} />
                                </Reveal>
                            ))}
                        </div>
                    )}

                    {spareparts.last_page > 1 ? (
                        <nav
                            className="mt-12 flex flex-wrap items-center justify-center gap-2"
                            aria-label="Navigasi halaman"
                        >
                            <Link
                                href={buildUrl(
                                    Math.max(spareparts.current_page - 1, 1),
                                    filters,
                                )}
                                preserveScroll
                                only={['spareparts']}
                                aria-label="Halaman sebelumnya"
                                className="tc-btn tc-btn--secondary tc-btn--sm"
                                style={{ paddingLeft: 12, paddingRight: 12 }}
                            >
                                <ArrowLeft
                                    className="h-3.5 w-3.5"
                                    weight="bold"
                                />
                            </Link>
                            {Array.from({ length: spareparts.last_page }).map(
                                (_, i) => {
                                    const page = i + 1;

                                    if (
                                        page > 4 &&
                                        page < spareparts.last_page &&
                                        Math.abs(
                                            page - spareparts.current_page,
                                        ) > 1
                                    ) {
                                        if (page === 5) {
                                            return (
                                                <span
                                                    key={`ellipsis-${page}`}
                                                    className="px-2 tc-caption"
                                                    aria-hidden="true"
                                                >
                                                    ...
                                                </span>
                                            );
                                        }

                                        return null;
                                    }

                                    return (
                                        <Link
                                            key={page}
                                            href={buildUrl(page, filters)}
                                            preserveScroll
                                            only={['spareparts']}
                                            aria-label={`Halaman ${page}`}
                                            aria-current={
                                                page === spareparts.current_page
                                                    ? 'page'
                                                    : undefined
                                            }
                                            data-active={
                                                page === spareparts.current_page
                                            }
                                            className="tc-chip"
                                            style={{
                                                paddingLeft: 16,
                                                paddingRight: 16,
                                            }}
                                        >
                                            {page}
                                        </Link>
                                    );
                                },
                            )}
                            <Link
                                href={buildUrl(
                                    Math.min(
                                        spareparts.current_page + 1,
                                        spareparts.last_page,
                                    ),
                                    filters,
                                )}
                                preserveScroll
                                only={['spareparts']}
                                aria-label="Halaman berikutnya"
                                className="tc-btn tc-btn--secondary tc-btn--sm"
                                style={{ paddingLeft: 12, paddingRight: 12 }}
                            >
                                <ArrowRight
                                    className="h-3.5 w-3.5"
                                    weight="bold"
                                />
                            </Link>
                        </nav>
                    ) : null}
                </div>
            </section>
        </PublicPage>
    );
}

function SparepartCard({ sparepart }: { sparepart: Sparepart }) {
    const image = photoUrl(sparepart);

    return (
        <Link
            href={`/sparepart/${sparepart.slug ?? sparepart.id}`}
            className="tc-card group flex flex-col p-3 transition-shadow duration-200 hover:shadow-[0_8px_24px_-8px_rgb(0_0_0/0.12)] md:p-4"
        >
            <div className="tc-media relative aspect-square">
                {image ? (
                    <img
                        alt={sparepart.name}
                        src={image}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Cpu
                            className="h-12 w-12"
                            weight="duotone"
                            aria-hidden="true"
                            style={{
                                color: 'var(--color-tc-secondary)',
                                opacity: 0.5,
                            }}
                        />
                    </div>
                )}
                <span
                    className={`tc-badge absolute top-3 left-3 ${
                        sparepart.condition === 'baru'
                            ? 'tc-badge--neutral'
                            : 'tc-badge--promo'
                    }`}
                >
                    {sparepart.condition === 'baru' ? 'Baru' : 'Bekas'}
                </span>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 pt-4">
                {sparepart.type?.name && (
                    <p className="tc-caption">{sparepart.type.name}</p>
                )}
                <h3 className="line-clamp-2 min-h-[2.7em] tc-product-title">
                    {sparepart.name}
                </h3>
                <p className="mt-1 tc-price text-lg">
                    {formatShortPrice(sparepart.selling_price)}
                </p>
                <span className="tc-btn tc-btn--primary tc-btn--sm mt-3 w-full">
                    Lihat detail
                    <ArrowRight className="h-3.5 w-3.5" weight="bold" />
                </span>
            </div>
        </Link>
    );
}

function FilterGroup({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <h3 className="tc-eyebrow" style={{ fontSize: '0.6875rem' }}>
                {title}
            </h3>
            <div className="mt-3">{children}</div>
        </div>
    );
}
