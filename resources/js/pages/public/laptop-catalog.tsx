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

    filters.brands?.forEach((b) => {
        params.append('brands[]', b);
    });

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
                                        onChange={() => {
                                            toggleBrand(brand);
                                        }}
                                        className="h-4 w-4 rounded border-bone accent-apple-blue"
                                    />
                                    <span
                                        className={`apple-body-sm transition ${
                                            active
                                                ? 'text-graphite'
                                                : 'text-slate-2'
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
                    onChange={(e) => {
                        handleMaxPriceChange(Number(e.target.value));
                    }}
                    className="h-1 w-full cursor-pointer accent-apple-blue"
                />
                <div className="mt-3 flex items-center justify-between apple-caption">
                    <span className="text-fog">Rp 0</span>
                    <span className="text-graphite">
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
                                onClick={() => {
                                    handleRamToggle(option);
                                }}
                                className={`rounded-pill border px-3 py-1 apple-caption transition ${
                                    ram === option
                                        ? 'border-button-blue bg-button-blue text-paper'
                                        : 'border-bone bg-paper text-slate-2 hover:border-apple-blue hover:text-graphite'
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
                                onClick={() => {
                                    handleStorageToggle(option);
                                }}
                                className={`rounded-pill border px-3 py-1 apple-caption transition ${
                                    storage === option
                                        ? 'border-button-blue bg-button-blue text-paper'
                                        : 'border-bone bg-paper text-slate-2 hover:border-apple-blue hover:text-graphite'
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
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-pill border border-bone bg-paper px-3 apple-caption text-slate-2 transition hover:border-graphite hover:text-graphite"
                >
                    <X className="h-3.5 w-3.5" />
                    Reset
                </button>
                <button
                    type="submit"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-pill bg-button-blue px-3 apple-caption text-paper transition hover:bg-deep-link-blue"
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
            <section className="bg-cloud py-16 md:py-20">
                <div className="mx-auto max-w-[980px] px-4 text-center">
                    <h1 className="apple-heading-lg text-graphite">
                        Katalog laptop bersih,
                        <br />
                        jelas, dan terkurasi.
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl apple-body-lg text-slate-2">
                        Pilih stok refurbished dari inventaris kami. Filter
                        merek, RAM, storage, dan harga untuk menemukan unit yang
                        paling cocok.
                    </p>

                    <form onSubmit={submit} className="mx-auto mt-8 max-w-xl">
                        <label className="flex h-11 items-center gap-3 rounded-pill border border-bone bg-paper px-4 transition focus-within:border-apple-blue focus-within:ring-4 focus-within:ring-apple-blue/20">
                            <MagnifyingGlass
                                className="h-4 w-4 shrink-0 text-fog"
                                weight="duotone"
                            />
                            <input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                }}
                                placeholder="Cari MacBook, ThinkPad, ROG..."
                                className="min-w-0 flex-1 border-none bg-transparent apple-body text-graphite outline-none placeholder:text-fog"
                            />
                            <button
                                type="submit"
                                className="inline-flex h-8 items-center justify-center rounded-pill bg-button-blue px-4 apple-caption text-paper transition hover:bg-deep-link-blue"
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
                        <div className="mb-5 flex items-baseline justify-between">
                            <h2 className="apple-body font-semibold text-graphite">
                                Filter
                            </h2>
                            {activeFilterCount > 0 ? (
                                <span className="apple-caption text-fog">
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
                        onClick={() => {
                            setShowMobileFilters(true);
                        }}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-pill border border-bone bg-paper px-4 apple-body-sm font-semibold text-graphite"
                    >
                        <Funnel
                            className="h-4 w-4 text-apple-blue"
                            weight="duotone"
                        />
                        Filter
                        {activeFilterCount > 0 ? (
                            <span className="ml-1 rounded-pill bg-button-blue px-2 py-0.5 text-[10px] font-bold text-paper">
                                {activeFilterCount}
                            </span>
                        ) : null}
                    </button>

                    {showMobileFilters ? (
                        <div className="fixed inset-0 z-50 flex flex-col bg-paper lg:hidden">
                            <div className="flex items-center justify-between border-b border-bone px-4 py-3">
                                <h2 className="apple-body font-semibold text-graphite">
                                    Filter
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowMobileFilters(false);
                                    }}
                                    className="rounded-pill p-1.5 text-slate-2 hover:bg-cloud"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-5 py-5">
                                {filterContent}
                            </div>
                        </div>
                    ) : null}
                </div>

                <div>
                    <div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="apple-body text-slate-2">
                            <span className="font-semibold text-graphite">
                                {laptops.total}
                            </span>{' '}
                            laptop refurbished
                        </p>
                        <label className="flex items-center gap-2 apple-body-sm text-slate-2">
                            Urutkan
                            <div className="relative">
                                <select
                                    value={sort}
                                    onChange={(e) => {
                                        handleSortChange(e.target.value);
                                    }}
                                    className="appearance-none rounded-pill border border-bone bg-paper py-1.5 pr-8 pl-3 apple-body-sm text-graphite transition outline-none focus:border-apple-blue"
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
                                    className="pointer-events-none absolute top-1/2 right-2.5 h-3 w-3 -translate-y-1/2 text-fog"
                                    weight="bold"
                                />
                            </div>
                        </label>
                    </div>

                    {laptops.data.length === 0 ? (
                        <div className="rounded-card border border-bone bg-paper p-12 text-center">
                            <LaptopIcon
                                className="mx-auto h-10 w-10 text-fog"
                                weight="duotone"
                            />
                            <p className="mt-4 apple-body text-slate-2">
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
                                        <div className="overflow-hidden rounded-card bg-paper">
                                            <div className="aspect-[4/3] overflow-hidden bg-bone/40">
                                                {image ? (
                                                    <img
                                                        alt={
                                                            laptop.name ??
                                                            laptop.sku
                                                        }
                                                        src={image}
                                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-fog">
                                                        <LaptopIcon
                                                            className="h-10 w-10"
                                                            weight="duotone"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <p className="apple-caption text-fog">
                                                {brandName(laptop.brand, '')}
                                            </p>
                                            <h3 className="mt-1 apple-body font-semibold text-graphite">
                                                {laptop.model}
                                                {laptop.name
                                                    ? ` - ${laptop.name}`
                                                    : ''}
                                            </h3>
                                            <p className="mt-1.5 apple-body text-apple-blue">
                                                {formatCurrency(
                                                    laptop.selling_price,
                                                )}
                                            </p>
                                            <span className="mt-3 inline-flex h-7 items-center gap-1.5 rounded-pill bg-button-blue px-3.5 apple-caption text-paper transition group-hover:bg-deep-link-blue">
                                                Lihat detail
                                                <ArrowRight
                                                    className="h-3 w-3"
                                                    weight="bold"
                                                />
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
                                href={buildCatalogUrl(
                                    Math.max(laptops.current_page - 1, 1),
                                    filters,
                                )}
                                aria-label="Halaman sebelumnya"
                                className="flex h-9 w-9 items-center justify-center rounded-pill text-graphite transition hover:bg-bone/40"
                            >
                                <ArrowLeft
                                    className="h-3.5 w-3.5"
                                    weight="bold"
                                />
                            </a>
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
                                                    className="px-2 apple-caption text-fog"
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
                                            href={buildCatalogUrl(
                                                page,
                                                filters,
                                            )}
                                            className={`flex h-9 w-9 items-center justify-center rounded-pill apple-caption transition ${
                                                page === laptops.current_page
                                                    ? 'bg-graphite text-paper'
                                                    : 'text-graphite hover:bg-bone/40'
                                            }`}
                                        >
                                            {page}
                                        </a>
                                    );
                                },
                            )}
                            <a
                                href={buildCatalogUrl(
                                    Math.min(
                                        laptops.current_page + 1,
                                        laptops.last_page,
                                    ),
                                    filters,
                                )}
                                aria-label="Halaman berikutnya"
                                className="flex h-9 w-9 items-center justify-center rounded-pill text-graphite transition hover:bg-bone/40"
                            >
                                <ArrowRight
                                    className="h-3.5 w-3.5"
                                    weight="bold"
                                />
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
            <h3 className="apple-caption text-graphite">{title}</h3>
            <div className="mt-3">{children}</div>
        </div>
    );
}
