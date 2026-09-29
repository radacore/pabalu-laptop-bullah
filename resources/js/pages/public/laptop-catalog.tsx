/* TechCycle · katalog · locked system: design.md
 * Filter kiri + grid kartu 24px + media abu #F1F3F5 + tombol pill hitam.
 */

import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CaretDown,
    Funnel,
    Laptop as LaptopIcon,
    MagnifyingGlass,
    MapPin,
    X,
} from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { PublicPage } from '@/components/public-layout';
import { formatShortPrice, formatSoldCount } from '@/lib/format';
import { mockCommerce, originalPrice } from '@/lib/mock-commerce';
import type { Laptop, PaginatedResponse, WebsiteSetting } from '@/types';

type CatalogFilters = {
    search?: string;
    brands: string[];
    ram?: string;
    storage?: string;
    max_price?: number | null;
    sort?: string;
};

type FilterOptions = {
    brands: Array<{ id: number; name: string; slug: string }>;
    ram: string[];
    storage: string[];
    max_price: number;
};

interface Props {
    laptops: PaginatedResponse<Laptop>;
    filters: CatalogFilters;
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

function buildCatalogUrl(page: number, filters: CatalogFilters) {
    const params = new URLSearchParams();

    if (filters.search) {
        params.set('search', filters.search);
    }

    if (filters.brands) {
        for (const b of filters.brands) {
            params.append('brands[]', b);
        }
    }

    if (filters.ram) {
        params.set('ram', filters.ram);
    }

    if (filters.storage) {
        params.set('storage', filters.storage);
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

    return query ? `/shop?${query}` : '/shop';
}

export default function LaptopCatalog({
    laptops,
    filters,
    filter_options,
    website,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [brands, setBrands] = useState<string[]>(filters.brands ?? []);
    const [ram, setRam] = useState(filters.ram ?? '');
    const [storage, setStorage] = useState(filters.storage ?? '');
    const [maxPrice, setMaxPrice] = useState(
        filters.max_price ?? filter_options.max_price,
    );
    const [sort, setSort] = useState(filters.sort ?? 'newest');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    useEffect(() => {
        if (!showMobileFilters) {
            return;
        }

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowMobileFilters(false);
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [showMobileFilters]);

    const activeFilterCount = useMemo(
        () =>
            brands.length +
            (ram ? 1 : 0) +
            (storage ? 1 : 0) +
            (search ? 1 : 0) +
            (maxPrice < filter_options.max_price ? 1 : 0),
        [
            brands.length,
            filter_options.max_price,
            maxPrice,
            ram,
            search,
            storage,
        ],
    );

    function applyFilters(overrides?: Partial<CatalogFilters>) {
        const next = {
            search: overrides?.search ?? search,
            brands: overrides?.brands ?? brands,
            ram: overrides?.ram ?? ram,
            storage: overrides?.storage ?? storage,
            max_price: overrides?.max_price ?? maxPrice,
            sort: overrides?.sort ?? sort,
        };
        router.get(
            '/shop',
            {
                search: next.search || undefined,
                brands: next.brands.length > 0 ? next.brands : undefined,
                ram: next.ram || undefined,
                storage: next.storage || undefined,
                max_price:
                    next.max_price < filter_options.max_price
                        ? next.max_price
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
        setRam('');
        setStorage('');
        setMaxPrice(filter_options.max_price);
        setSort('newest');
        router.get('/shop', {}, { preserveState: true, replace: true });
    }

    function handleSortChange(nextSort: string) {
        setSort(nextSort);
        applyFilters({ sort: nextSort });
    }

    function handleMaxPriceChange(value: number) {
        setMaxPrice(value);
        scheduleMaxPriceApply(value);
    }

    // Slider harga: debounce 400ms agar drag tidak menembak puluhan
    // request (tiap request = 4-5 query backend). Nilai lokal update
    // instan, request_modify menyusul setelah user berhenti geser.
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

    function handleRamToggle(option: string) {
        const next = ram === option ? '' : option;
        setRam(next);
        applyFilters({ ram: next });
    }

    function handleStorageToggle(option: string) {
        const next = storage === option ? '' : option;
        setStorage(next);
        applyFilters({ storage: next });
    }

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

            <FilterGroup title="Harga maksimal">
                <input
                    type="range"
                    min="0"
                    max={filter_options.max_price}
                    step="500000"
                    value={maxPrice}
                    onChange={(e) =>
                        handleMaxPriceChange(Number(e.target.value))
                    }
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

            {filter_options.ram.length > 0 ? (
                <FilterGroup title="RAM">
                    <div className="flex flex-wrap gap-2">
                        {filter_options.ram.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleRamToggle(option)}
                                data-active={ram === option}
                                className="tc-chip"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </FilterGroup>
            ) : null}

            {filter_options.storage.length > 0 ? (
                <FilterGroup title="Storage">
                    <div className="flex flex-wrap gap-2">
                        {filter_options.storage.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleStorageToggle(option)}
                                data-active={storage === option}
                                className="tc-chip"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </FilterGroup>
            ) : null}

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
            title={`Katalog Laptop - ${website.website_name}`}
            currentPath="/shop"
        >
            <section className="border-b border-tc-rule bg-tc-paper">
                <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-6 md:py-14">
                    <p className="tc-eyebrow">Katalog</p>
                    <h1 className="mt-3 max-w-3xl tc-h1">
                        Laptop bekas pilihan, jelas kondisinya.
                    </h1>
                    <p className="mt-4 max-w-2xl tc-body !text-base">
                        Filter merek, RAM, storage, dan harga untuk menemukan
                        unit yang paling cocok.
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
                                placeholder="Cari MacBook, ThinkPad, ROG..."
                                aria-label="Cari laptop"
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
                    <div className="sticky top-32">
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
                    </div>
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
                            aria-label="Filter katalog"
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
                            laptop refurbished
                        </p>
                        <label className="flex items-center gap-2 tc-caption">
                            Urutkan
                            <span className="relative">
                                <select
                                    value={sort}
                                    onChange={(e) =>
                                        handleSortChange(e.target.value)
                                    }
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
                                    <option value="name_asc">Nama A-Z</option>
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
                                Laptop tidak ditemukan. Coba ubah kata kunci,
                                merek, RAM, storage, atau harga maksimal.
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
                            {laptops.data.map((laptop) => (
                                <CatalogCard key={laptop.id} laptop={laptop} />
                            ))}
                        </div>
                    )}

                    {laptops.last_page > 1 ? (
                        <nav
                            className="mt-12 flex flex-wrap items-center justify-center gap-2"
                            aria-label="Navigasi halaman"
                        >
                            <Link
                                href={buildCatalogUrl(
                                    Math.max(laptops.current_page - 1, 1),
                                    filters,
                                )}
                                preserveScroll
                                aria-label="Halaman sebelumnya"
                                className="tc-btn tc-btn--secondary tc-btn--sm"
                                style={{ paddingLeft: 12, paddingRight: 12 }}
                            >
                                <ArrowLeft
                                    className="h-3.5 w-3.5"
                                    weight="bold"
                                />
                            </Link>
                            {Array.from({ length: laptops.last_page }).map(
                                (_, i) => {
                                    const page = i + 1;

                                    if (
                                        page > 4 &&
                                        page < laptops.last_page &&
                                        Math.abs(page - laptops.current_page) >
                                            1
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

                                    const active =
                                        page === laptops.current_page;

                                    return (
                                        <Link
                                            key={page}
                                            href={buildCatalogUrl(
                                                page,
                                                filters,
                                            )}
                                            preserveScroll
                                            aria-label={`Halaman ${page}`}
                                            aria-current={
                                                active ? 'page' : undefined
                                            }
                                            data-active={active}
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
                                href={buildCatalogUrl(
                                    Math.min(
                                        laptops.current_page + 1,
                                        laptops.last_page,
                                    ),
                                    filters,
                                )}
                                preserveScroll
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

function CatalogCard({ laptop }: { laptop: Laptop }) {
    const image = photoUrl(laptop);
    const commerce = mockCommerce(laptop.id);
    const orig = originalPrice(laptop.selling_price, commerce.discountPct);

    return (
        <Link
            href={`/shop/${laptop.slug ?? laptop.id}`}
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
                {commerce.discountPct > 0 && (
                    <span className="tc-badge tc-badge--promo absolute top-3 left-3">
                        Hemat {commerce.discountPct}%
                    </span>
                )}
            </div>
            <div className="flex flex-1 flex-col gap-1.5 pt-4">
                {laptop.brand?.name && (
                    <p className="tc-caption">{laptop.brand.name}</p>
                )}
                <h3 className="line-clamp-2 min-h-[2.7em] tc-product-title">
                    {laptopTitle(laptop)}
                </h3>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                    <p className="tc-price text-lg">
                        {formatShortPrice(laptop.selling_price)}
                    </p>
                    {orig && (
                        <p
                            className="tc-caption"
                            style={{ textDecoration: 'line-through' }}
                        >
                            {formatShortPrice(orig)}
                        </p>
                    )}
                </div>
                <p className="mt-1 flex items-center gap-1.5 tc-caption">
                    <span
                        className="tc-stars"
                        role="img"
                        aria-label={`${commerce.rating.toFixed(1)} dari 5 bintang`}
                    >
                        <StarGlyph />
                    </span>
                    <span
                        className="font-semibold"
                        style={{ color: 'var(--color-tc-ink)' }}
                    >
                        {commerce.rating.toFixed(1)}
                    </span>
                    <span>· Terjual {formatSoldCount(commerce.soldCount)}</span>
                </p>
                <p className="flex items-center gap-1 tc-caption">
                    <MapPin
                        className="h-3 w-3 shrink-0"
                        weight="fill"
                        aria-hidden="true"
                    />
                    <span className="truncate">{commerce.location}</span>
                </p>
                <span className="tc-btn tc-btn--primary tc-btn--sm mt-3 w-full">
                    Lihat detail
                    <ArrowRight className="h-3.5 w-3.5" weight="bold" />
                </span>
            </div>
        </Link>
    );
}

export function StarGlyph({
    className = 'h-3.5 w-3.5',
}: {
    className?: string;
}) {
    return (
        <svg
            viewBox="0 0 16 16"
            className={className}
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M8 1.5l2.1 4.4 4.8.7-3.5 3.4.8 4.8L8 12.6l-4.2 2.2.8-4.8L1.1 6.6l4.8-.7z" />
        </svg>
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
