/* TechCycle · katalog sewa · locked system: design.md */

import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CaretDown,
    Funnel,
    Laptop as LaptopIcon,
    MagnifyingGlass,
    X,
} from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PublicPage } from '@/components/public-layout';
import Reveal from '@/components/shared/reveal';
import { formatShortPrice } from '@/lib/format';
import type { Laptop, PaginatedResponse, WebsiteSetting } from '@/types';

type RentalFilters = {
    search?: string;
    brands: string[];
    max_rate?: number | null;
    sort?: string;
};

type FilterOptions = {
    brands: Array<{ id: number; name: string; slug: string }>;
    max_rate: number;
};

interface Props {
    laptops: PaginatedResponse<Laptop>;
    filters: RentalFilters;
    filter_options: FilterOptions;
    website: WebsiteSetting;
}

function photoUrl(laptop: Laptop) {
    const photo = laptop.photos?.[0];

    if (!photo?.file_path) {
        return null;
    }

    return `/storage/${photo.file_path}`;
}

function laptopTitle(laptop: Laptop): string {
    if (laptop.name && laptop.name.trim().length > 0) {
        return laptop.name;
    }

    const parts: string[] = [];

    if (laptop.brand?.name) {
        parts.push(laptop.brand.name);
    }

    if (laptop.model) {
        parts.push(laptop.model);
    }

    return parts.join(' ') || laptop.sku || 'Laptop';
}

function buildUrl(page: number, filters: RentalFilters) {
    const params = new URLSearchParams();

    if (filters.search) {
        params.set('search', filters.search);
    }

    if (filters.brands) {
        for (const b of filters.brands) {
            params.append('brands[]', b);
        }
    }

    if (filters.max_rate) {
        params.set('max_rate', String(filters.max_rate));
    }

    if (filters.sort && filters.sort !== 'newest') {
        params.set('sort', filters.sort);
    }

    if (page > 1) {
        params.set('page', String(page));
    }

    const query = params.toString();

    return query ? `/sewa?${query}` : '/sewa';
}

export default function RentalCatalog({
    laptops,
    filters,
    filter_options,
    website,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [brands, setBrands] = useState<string[]>(filters.brands ?? []);
    const [maxRate, setMaxRate] = useState(
        filters.max_rate ?? filter_options.max_rate,
    );
    const [sort, setSort] = useState(filters.sort ?? 'newest');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const activeFilterCount = useMemo(
        () =>
            brands.length +
            (search ? 1 : 0) +
            (maxRate < filter_options.max_rate ? 1 : 0),
        [brands.length, filter_options.max_rate, maxRate, search],
    );

    function applyFilters(overrides?: Partial<RentalFilters>) {
        const next = {
            search: overrides?.search ?? search,
            brands: overrides?.brands ?? brands,
            max_rate: overrides?.max_rate ?? maxRate,
            sort: overrides?.sort ?? sort,
        };
        router.get(
            '/sewa',
            {
                search: next.search || undefined,
                brands: next.brands.length > 0 ? next.brands : undefined,
                max_rate:
                    next.max_rate < filter_options.max_rate
                        ? next.max_rate
                        : undefined,
                sort: next.sort === 'newest' ? undefined : next.sort,
            },
            { preserveState: true, replace: true },
        );
    }

    function submit(event: { preventDefault: () => void }) {
        event.preventDefault();
        applyFilters();
    }

    function toggleBrand(brand: string) {
        const next = brands.includes(brand)
            ? brands.filter((b) => b !== brand)
            : [...brands, brand];
        setBrands(next);
        applyFilters({ brands: next });
    }

    function resetFilters() {
        setSearch('');
        setBrands([]);
        setMaxRate(filter_options.max_rate);
        setSort('newest');
        router.get('/sewa', {}, { preserveState: true, replace: true });
    }

    // Slider tarif: debounce 400ms agar drag tidak menembak puluhan
    // request. Nilai lokal update instan, request menyusul.
    const maxRateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function scheduleMaxRateApply(value: number) {
        if (maxRateTimer.current) {
            clearTimeout(maxRateTimer.current);
        }

        maxRateTimer.current = setTimeout(() => {
            applyFilters({ max_rate: value });
        }, 400);
    }

    useEffect(() => {
        return () => {
            if (maxRateTimer.current) {
                clearTimeout(maxRateTimer.current);
            }
        };
    }, []);

    const filterContent = (
        <form onSubmit={submit} className="space-y-7">
            {filter_options.brands.length > 0 ? (
                <FilterGroup title="Merek">
                    <div className="space-y-1">
                        {filter_options.brands.map((brand) => {
                            const active = brands.includes(brand.slug);

                            return (
                                <label
                                    key={brand.slug}
                                    className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-[10px] px-2 transition hover:bg-tc-media"
                                >
                                    <input
                                        type="checkbox"
                                        checked={active}
                                        onChange={() => toggleBrand(brand.slug)}
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
                                        {brand.name}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </FilterGroup>
            ) : null}

            <FilterGroup title="Tarif maksimal / hari">
                <input
                    type="range"
                    min="0"
                    max={filter_options.max_rate}
                    step="25000"
                    value={maxRate}
                    onChange={(e) => {
                        const value = Number(e.target.value);
                        setMaxRate(value);
                        scheduleMaxRateApply(value);
                    }}
                    className="h-1 w-full cursor-pointer accent-black"
                    aria-label="Tarif maksimal per hari"
                />
                <div className="mt-3 flex items-center justify-between">
                    <span className="tc-caption">Rp 0</span>
                    <span
                        className="tc-caption font-semibold"
                        style={{ color: 'var(--color-tc-ink)' }}
                    >
                        {formatShortPrice(maxRate)}
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
            title={`Sewa Laptop - ${website.website_name}`}
            currentPath="/sewa"
        >
            <section className="border-b border-tc-rule bg-tc-paper">
                <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-6 md:py-14">
                    <p className="tc-eyebrow">Sewa laptop</p>
                    <h1 className="mt-3 max-w-3xl tc-h1">
                        Sewa harian, tanpa komitmen beli.
                    </h1>
                    <p
                        className="mt-4 max-w-2xl tc-body"
                        style={{ fontSize: '1rem' }}
                    >
                        Unit terkurasi untuk kebutuhan sementara: event, proyek,
                        atau pengganti saat servis.
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
                                placeholder="Cari unit sewa..."
                                aria-label="Cari unit sewa"
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
                            aria-label="Filter katalog sewa"
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
                                {laptops.total}
                            </span>{' '}
                            unit siap disewa
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
                                    <option value="rate_asc">
                                        Tarif: rendah ke tinggi
                                    </option>
                                    <option value="rate_desc">
                                        Tarif: tinggi ke rendah
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

                    {laptops.data.length === 0 ? (
                        <div className="tc-card p-12 text-center">
                            <LaptopIcon
                                className="mx-auto h-10 w-10"
                                weight="duotone"
                                aria-hidden="true"
                                style={{
                                    color: 'var(--color-tc-secondary)',
                                    opacity: 0.5,
                                }}
                            />
                            <p className="mx-auto mt-4 max-w-md tc-body">
                                Tidak ada unit sewa yang cocok. Coba ubah kata
                                kunci atau tarif maksimal.
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
                            {laptops.data.map((laptop, i) => (
                                <Reveal key={laptop.id} delay={(i % 9) * 60}>
                                    <RentalCard laptop={laptop} />
                                </Reveal>
                            ))}
                        </div>
                    )}

                    {laptops.last_page > 1 ? (
                        <Pager
                            current={laptops.current_page}
                            last={laptops.last_page}
                            filters={filters}
                        />
                    ) : null}
                </div>
            </section>
        </PublicPage>
    );
}

function RentalCard({ laptop }: { laptop: Laptop }) {
    const image = photoUrl(laptop);

    return (
        <Link
            href={`/sewa/${laptop.slug ?? laptop.id}`}
            className="tc-card group flex flex-col p-3 transition-shadow duration-200 hover:shadow-[0_8px_24px_-8px_rgb(0_0_0/0.12)] md:p-4"
        >
            <div className="tc-media relative aspect-square">
                {image ? (
                    <img
                        alt={laptopTitle(laptop)}
                        src={image}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <LaptopIcon
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
            </div>
            <div className="flex flex-1 flex-col gap-1.5 pt-4">
                {laptop.brand?.name && (
                    <p className="tc-caption">{laptop.brand.name}</p>
                )}
                <h3 className="line-clamp-2 min-h-[2.7em] tc-product-title">
                    {laptopTitle(laptop)}
                </h3>
                <p className="mt-1 tc-price text-lg">
                    {formatShortPrice(laptop.daily_rate)}
                    <span
                        className="tc-caption font-normal"
                        style={{ color: 'var(--color-tc-secondary)' }}
                    >
                        /hari
                    </span>
                </p>
                <span className="tc-btn tc-btn--primary tc-btn--sm mt-3 w-full">
                    Lihat detail
                    <ArrowRight className="h-3.5 w-3.5" weight="bold" />
                </span>
            </div>
        </Link>
    );
}

function Pager({
    current,
    last,
    filters,
}: {
    current: number;
    last: number;
    filters: RentalFilters;
}) {
    return (
        <nav
            className="mt-12 flex flex-wrap items-center justify-center gap-2"
            aria-label="Navigasi halaman"
        >
            <Link
                href={buildUrl(Math.max(current - 1, 1), filters)}
                preserveScroll
                aria-label="Halaman sebelumnya"
                className="tc-btn tc-btn--secondary tc-btn--sm"
                style={{ paddingLeft: 12, paddingRight: 12 }}
            >
                <ArrowLeft className="h-3.5 w-3.5" weight="bold" />
            </Link>
            {Array.from({ length: last }).map((_, i) => {
                const page = i + 1;

                if (page > 4 && page < last && Math.abs(page - current) > 1) {
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
                        aria-label={`Halaman ${page}`}
                        aria-current={page === current ? 'page' : undefined}
                        data-active={page === current}
                        className="tc-chip"
                        style={{ paddingLeft: 16, paddingRight: 16 }}
                    >
                        {page}
                    </Link>
                );
            })}
            <Link
                href={buildUrl(Math.min(current + 1, last), filters)}
                preserveScroll
                aria-label="Halaman berikutnya"
                className="tc-btn tc-btn--secondary tc-btn--sm"
                style={{ paddingLeft: 12, paddingRight: 12 }}
            >
                <ArrowRight className="h-3.5 w-3.5" weight="bold" />
            </Link>
        </nav>
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
