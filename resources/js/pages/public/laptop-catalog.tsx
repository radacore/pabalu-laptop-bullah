/* Hallmark · genre: modern-minimal · macrostructure: catalogue · theme: hum */

import { router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CaretDown,
    Funnel,
    Laptop as LaptopIcon,
    MagnifyingGlass,
    X,
} from '@phosphor-icons/react';
import { useMemo, useState } from 'react';

import { PublicPage, formatCurrency } from '@/components/public-layout';
import type {
    Laptop,
    MasterData,
    PaginatedResponse,
    WebsiteSetting,
} from '@/types';

type CatalogFilters = {
    search?: string;
    brands: string[];
    ram?: string;
    storage?: string;
    max_price?: number | null;
    sort?: string;
};

type FilterOptions = {
    brands: string[];
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

function formatShortPrice(value: number) {
    if (value >= 1_000_000) {
        return `Rp ${Math.round(value / 1_000_000)}jt`;
    }

    return formatCurrency(value);
}

function brandName(brand: MasterData | null | undefined, fallback: string) {
    return brand?.name ?? fallback;
}

function photoUrl(laptop: Laptop) {
    const photo = laptop.photos?.[0];

    if (!photo?.file_path) {
return null;
}

    return `/storage/${photo.file_path}`;
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

    const activeFilterCount = useMemo(
        () =>
            brands.length +
            (ram ? 1 : 0) +
            (storage ? 1 : 0) +
            (search ? 1 : 0) +
            (maxPrice < filter_options.max_price ? 1 : 0),
        [brands.length, filter_options.max_price, maxPrice, ram, search, storage],
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
        applyFilters({ max_price: value });
    }

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
                    <div className="space-y-2.5">
                        {filter_options.brands.map((brand) => {
                            const active = brands.includes(brand);

                            return (
                                <label
                                    key={brand}
                                    className="flex cursor-pointer items-center gap-3"
                                >
                                    <input
                                        type="checkbox"
                                        checked={active}
                                        onChange={() => toggleBrand(brand)}
                                        className="h-4 w-4 rounded-sm border border-rule accent-accent"
                                    />
                                    <span
                                        className={`hum-body-sm transition ${
                                            active ? 'text-ink' : 'text-ink-2'
                                        }`}
                                    >
                                        {brand}
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
                    onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                    className="h-1 w-full cursor-pointer accent-accent"
                />
                <div className="mt-3 flex items-center justify-between hum-caption">
                    <span className="text-ink-2/60">Rp 0</span>
                    <span className="text-ink">{formatShortPrice(maxPrice)}</span>
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
                                className={`rounded-full border px-3 py-1 hum-caption transition ${
                                    ram === option
                                        ? 'hum-btn hum-btn--pear'
                                        : 'border-rule bg-paper text-ink-2 hover:border-accent'
                                }`}
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
                                className={`rounded-full border px-3 py-1 hum-caption transition ${
                                    storage === option
                                        ? 'hum-btn hum-btn--pear'
                                        : 'border-rule bg-paper text-ink-2 hover:border-accent'
                                }`}
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
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-rule bg-paper px-3 hum-caption text-ink-2 transition hover:border-ink hover:text-ink"
                >
                    <X className="h-3.5 w-3.5" weight="duotone" />
                    Reset
                </button>
                <button
                    type="submit"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 hum-caption hum-btn hum-btn--pear transition opacity-90 hover:opacity-100"
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
            <section className="bg-paper-2 py-16 md:py-20">
                <div className="mx-auto max-w-[980px] px-4 text-center">
                    <h1 className="hum-heading-lg text-ink">
                        Katalog laptop bersih,
                        <br />
                        jelas, dan terkurasi.
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl hum-body-lg text-ink-2">
                        Pilih stok refurbished dari inventaris kami. Filter
                        merek, RAM, storage, dan harga untuk menemukan unit yang
                        paling cocok.
                    </p>

                    <form onSubmit={submit} className="mx-auto mt-8 max-w-xl">
                        <label className="flex h-11 items-center gap-3 rounded-pill border border-rule bg-paper px-4 transition focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20">
                            <MagnifyingGlass
                                className="h-4 w-4 shrink-0 text-ink-2/60"
                                weight="duotone"
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari MacBook, ThinkPad, ROG..."
                                className="min-w-0 flex-1 border-none bg-transparent hum-body text-ink outline-none placeholder:text-ink-2/60"
                            />
                            <button
                                type="submit"
                                className="inline-flex h-8 items-center justify-center rounded-full px-4 hum-caption hum-btn hum-btn--pear transition opacity-90 hover:opacity-100"
                            >
                                Cari
                            </button>
                        </label>
                    </form>
                </div>
            </section>

            <section className="mx-auto max-w-[980px] px-4 py-10 sm:px-6 md:py-14 lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
                <aside className="hidden lg:block">
                    <div className="sticky top-16">
                        <div className="mb-5 flex items-baseline justify-between border-b border-rule pb-4">
                            <h2 className="hum-body font-semibold text-ink">
                                Filter
                            </h2>
                            {activeFilterCount > 0 ? (
                                <span className="hum-caption text-ink-2/60">
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
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-rule bg-paper px-4 hum-body-sm font-semibold text-ink"
                    >
                        <Funnel
                            className="h-4 w-4 text-accent"
                            weight="duotone"
                        />
                        Filter
                        {activeFilterCount > 0 ? (
                            <span className="ml-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-ink">
                                {activeFilterCount}
                            </span>
                        ) : null}
                    </button>

                    {showMobileFilters ? (
                        <div className="fixed inset-0 z-50 flex flex-col bg-paper lg:hidden">
                            <div className="flex items-center justify-between border-b border-rule px-4 py-3">
                                <h2 className="hum-body font-semibold text-ink">
                                    Filter
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowMobileFilters(false)}
                                    className="rounded-full p-1.5 text-ink-2 hover:bg-paper-2"
                                >
                                    <X className="h-4 w-4" weight="duotone" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-5 py-5">
                                {filterContent}
                            </div>
                        </div>
                    ) : null}
                </div>

                <div>
                    <div className="mb-8 flex flex-col items-start gap-3 border-b border-rule pb-6 sm:flex-row sm:items-center sm:justify-between">
                        <p className="hum-body text-ink-2">
                            <span className="font-semibold text-ink">
                                {laptops.total}
                            </span>{' '}
                            laptop refurbished
                        </p>
                        <label className="flex items-center gap-2 hum-body-sm text-ink-2">
                            Urutkan
                            <div className="relative">
                                <select
                                    value={sort}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="appearance-none rounded-full border border-rule bg-paper py-1.5 pr-8 pl-3 hum-body-sm text-ink transition outline-none focus:border-accent"
                                >
                                    <option value="newest">Terbaru</option>
                                    <option value="price_asc">Harga: rendah ke tinggi</option>
                                    <option value="price_desc">Harga: tinggi ke rendah</option>
                                    <option value="name_asc">Nama A-Z</option>
                                </select>
                                <CaretDown
                                    className="pointer-events-none absolute top-1/2 right-2.5 h-3 w-3 -translate-y-1/2 text-ink-2/60"
                                    weight="bold"
                                />
                            </div>
                        </label>
                    </div>

                    {laptops.data.length === 0 ? (
                        <div className="rounded-[20px] bg-paper p-12 text-center shadow-card">
                            <LaptopIcon
                                className="mx-auto h-10 w-10 text-ink-2/60"
                                weight="duotone"
                            />
                            <p className="mt-4 hum-body text-ink-2">
                                Laptop tidak ditemukan. Coba ubah kata kunci,
                                merek, RAM, storage, atau harga maksimal.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {laptops.data.map((laptop) => {
                                const image = photoUrl(laptop);

                                return (
                                    <a
                                        key={laptop.id}
                                        href={`/laptops/${laptop.id}`}
                                        className="group block"
                                    >
                                        <div className="rounded-[20px] bg-paper transition shadow-card group-hover:shadow-card-hover">
                                            <div className="aspect-[4/3] overflow-hidden rounded-t-[20px]">
                                                {image ? (
                                                    <img
                                                        alt={laptop.name ?? laptop.sku}
                                                        src={image}
                                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-paper-2 text-ink-2/60">
                                                        <LaptopIcon
                                                            className="h-10 w-10"
                                                            weight="duotone"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <p className="hum-caption text-ink-2/60">
                                                {brandName(laptop.brand, '')}
                                            </p>
                                            <div className="mt-1 min-h-[3rem]">
                                                <h3 className="line-clamp-2 hum-body font-semibold text-ink">
                                                    {laptop.model}
                                                    {laptop.name ? ` - ${laptop.name}` : ''}
                                                </h3>
                                            </div>
                                            <p className="mt-1.5 hum-body text-accent">
                                                {formatCurrency(laptop.selling_price)}
                                            </p>
                                            <span className="mt-3 inline-flex h-7 items-center gap-1.5 rounded-full px-3.5 hum-caption hum-btn hum-btn--pear transition opacity-90 group-hover:opacity-100">
                                                Lihat detail
                                                <ArrowRight className="h-3 w-3" weight="bold" />
                                            </span>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    {laptops.last_page > 1 ? (
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                            <a
                                href={buildCatalogUrl(Math.max(laptops.current_page - 1, 1), filters)}
                                aria-label="Halaman sebelumnya"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-rule text-ink transition hover:text-accent-2"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" weight="bold" />
                            </a>
                            {Array.from({ length: laptops.last_page }).map((_, i) => {
                                const page = i + 1;

                                if (
                                    page > 4 &&
                                    page < laptops.last_page &&
                                    Math.abs(page - laptops.current_page) > 1
                                ) {
                                    if (page === 5) {
                                        return (
                                            <span
                                                key={`ellipsis-${page}`}
                                                className="px-2 hum-caption text-ink-2/60"
                                            >
                                                ...
                                            </span>
                                        );
                                    }

                                    return null;
                                }

                                return (
                                    <a
                                        key={page}
                                        href={buildCatalogUrl(page, filters)}
                                        className={`flex h-9 w-9 items-center justify-center rounded-full hum-caption transition ${
                                            page === laptops.current_page
                                                ? 'bg-ink text-paper'
                                                : 'border border-rule text-ink hover:text-accent-2'
                                        }`}
                                    >
                                        {page}
                                    </a>
                                );
                            })}
                            <a
                                href={buildCatalogUrl(
                                    Math.min(laptops.current_page + 1, laptops.last_page),
                                    filters,
                                )}
                                aria-label="Halaman berikutnya"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-rule text-ink transition hover:text-accent-2"
                            >
                                <ArrowRight className="h-3.5 w-3.5" weight="bold" />
                            </a>
                        </div>
                    ) : null}
                </div>
            </section>
        </PublicPage>
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
            <h3 className="hum-caption text-ink">{title}</h3>
            <div className="mt-3">{children}</div>
        </div>
    );
}
