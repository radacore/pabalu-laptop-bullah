import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CaretDown,
    Funnel,
    Laptop as LaptopIcon,
    MagnifyingGlass,
    Sliders,
    X,
} from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import {
    PublicPage,
    formatCurrency,
} from '@/components/public-layout';
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
    if (value >= 1_000_000) return `Rp ${Math.round(value / 1_000_000)}jt`;
    return formatCurrency(value);
}

function photoUrl(laptop: Laptop) {
    const photo = laptop.photos?.[0];
    if (!photo?.file_path) return null;
    return `/storage/${photo.file_path}`;
}

function specTags(laptop: Laptop) {
    return [
        laptop.specification?.processor,
        laptop.specification?.ram,
        laptop.specification?.storage,
    ]
        .filter((t): t is string => Boolean(t))
        .slice(0, 3);
}

function buildCatalogUrl(page: number, filters: CatalogFilters) {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    filters.brands?.forEach((b) => params.append('brands[]', b));
    if (filters.ram) params.set('ram', filters.ram);
    if (filters.storage) params.set('storage', filters.storage);
    if (filters.max_price) params.set('max_price', String(filters.max_price));
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
    if (page > 1) params.set('page', String(page));
    const query = params.toString();
    return query ? `/shop?${query}` : '/shop';
}

function FilterSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
            <h3 className="mb-3 text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                {title}
            </h3>
            {children}
        </div>
    );
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

    function submit(event: { preventDefault: () => void }) {
        event.preventDefault();
        router.get(
            '/shop',
            {
                search: search || undefined,
                brands: brands.length > 0 ? brands : undefined,
                ram: ram || undefined,
                storage: storage || undefined,
                max_price:
                    maxPrice < filter_options.max_price ? maxPrice : undefined,
                sort: sort === 'newest' ? undefined : sort,
            },
            { preserveState: true, replace: true },
        );
    }

    function toggleBrand(brand: string) {
        setBrands((current) =>
            current.includes(brand)
                ? current.filter((b) => b !== brand)
                : [...current, brand],
        );
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
        router.get(
            '/shop',
            {
                search: search || undefined,
                brands: brands.length > 0 ? brands : undefined,
                ram: ram || undefined,
                storage: storage || undefined,
                max_price:
                    maxPrice < filter_options.max_price ? maxPrice : undefined,
                sort: nextSort === 'newest' ? undefined : nextSort,
            },
            { preserveState: true, replace: true },
        );
    }

    const filterContent = (
        <form onSubmit={submit} className="space-y-5">
            {filter_options.brands.length > 0 && (
                <FilterSection title="Merek">
                    <div className="space-y-2.5">
                        {filter_options.brands.map((brand) => (
                            <label
                                key={brand}
                                className="flex cursor-pointer items-center gap-3 group"
                            >
                                <input
                                    type="checkbox"
                                    checked={brands.includes(brand)}
                                    onChange={() => toggleBrand(brand)}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                                />
                                <span
                                    className={`text-sm font-medium transition ${
                                        brands.includes(brand)
                                            ? 'text-blue-600'
                                            : 'text-slate-700 group-hover:text-slate-950'
                                    }`}
                                >
                                    {brand}
                                </span>
                            </label>
                        ))}
                    </div>
                </FilterSection>
            )}

            <FilterSection title="Harga maksimal">
                <input
                    type="range"
                    min="0"
                    max={filter_options.max_price}
                    step="500000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer accent-blue-600"
                />
                <div className="mt-2 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">Rp 0</span>
                    <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-600">
                        {formatShortPrice(maxPrice)}
                    </span>
                </div>
            </FilterSection>

            {filter_options.ram.length > 0 && (
                <FilterSection title="RAM">
                    <div className="flex flex-wrap gap-2">
                        {filter_options.ram.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setRam(ram === option ? '' : option)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                    ram === option
                                        ? 'bg-blue-600 text-white'
                                        : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </FilterSection>
            )}

            {filter_options.storage.length > 0 && (
                <FilterSection title="Storage">
                    <div className="flex flex-wrap gap-2">
                        {filter_options.storage.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() =>
                                    setStorage(storage === option ? '' : option)
                                }
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                    storage === option
                                        ? 'bg-blue-600 text-white'
                                        : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </FilterSection>
            )}

            <div className="grid grid-cols-2 gap-2">
                <button
                    type="submit"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
                >
                    <Funnel className="h-4 w-4" weight="duotone" />
                    Terapkan
                </button>
                <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    <X className="h-4 w-4" />
                    Reset
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
            {/* ─── Page Header ─── */}
            <section className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                            Katalog laptop bersih, jelas, dan terkurasi
                        </h1>
                        <p className="mt-4 text-lg leading-8 text-slate-600">
                            Pilih stok refurbished dari inventaris asli. Filter merek,
                            RAM, storage, dan harga untuk menemukan unit yang paling
                            cocok.
                        </p>

                        <form onSubmit={submit} className="mt-8">
                            <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 shadow-sm transition focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100">
                                <MagnifyingGlass
                                    className="h-5 w-5 shrink-0 text-slate-400"
                                    weight="duotone"
                                />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari MacBook, ThinkPad, ROG..."
                                    className="min-w-0 flex-1 border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                                />
                                <button
                                    type="submit"
                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
                                >
                                    Cari
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* ─── Filter + Grid ─── */}
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[260px_1fr] lg:gap-8 lg:px-8 lg:py-12">
                {/* Desktop sidebar */}
                <aside className="hidden lg:block">
                    <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-slate-950">
                                    Filter
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {activeFilterCount} filter aktif
                                </p>
                            </div>
                            <Sliders
                                className="h-5 w-5 text-blue-600"
                                weight="duotone"
                            />
                        </div>
                        {filterContent}
                    </div>
                </aside>

                {/* Mobile filter trigger */}
                <div className="mb-5 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setShowMobileFilters(true)}
                        className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm"
                    >
                        <Funnel className="h-4 w-4 text-blue-600" weight="duotone" />
                        Filter
                        {activeFilterCount > 0 && (
                            <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {showMobileFilters && (
                        <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
                            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                                <h2 className="text-base font-bold text-slate-950">
                                    Filter
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowMobileFilters(false)}
                                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-5 py-5">
                                {filterContent}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main grid */}
                <div>
                    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-600">
                            <span className="font-bold text-slate-950">
                                {laptops.total}
                            </span>{' '}
                            laptop refurbished
                        </p>
                        <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
                            Urutkan
                            <div className="relative">
                                <select
                                    value={sort}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pr-9 pl-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price_asc">Harga: Rendah ke Tinggi</option>
                                    <option value="price_desc">Harga: Tinggi ke Rendah</option>
                                    <option value="name_asc">Nama A-Z</option>
                                </select>
                                <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" weight="bold" />
                            </div>
                        </label>
                    </div>

                    {laptops.data.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                            <LaptopIcon
                                className="mx-auto h-12 w-12 text-slate-300"
                                weight="duotone"
                            />
                            <h3 className="mt-4 text-lg font-bold text-slate-950">
                                Laptop tidak ditemukan
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Coba ubah kata kunci, merek, RAM, storage, atau harga maksimal.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {laptops.data.map((laptop) => {
                                const image = photoUrl(laptop);
                                const tags = specTags(laptop);
                                return (
                                    <a
                                        key={laptop.id}
                                        href={`/laptops/${laptop.id}`}
                                        className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="relative aspect-[4/3] bg-slate-100">
                                            {image ? (
                                                <img
                                                    alt={laptop.name ?? laptop.sku}
                                                    src={image}
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                    <LaptopIcon
                                                        className="h-12 w-12"
                                                        weight="duotone"
                                                    />
                                                </div>
                                            )}
                                            <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm ring-1 ring-slate-200 backdrop-blur">
                                                Ready Stock
                                            </span>
                                        </div>
                                        <div className="flex flex-1 flex-col p-5">
                                            <p className="text-xs font-semibold tracking-[0.12em] text-blue-600 uppercase">
                                                {laptop.brand}
                                            </p>
                                            <h3 className="mt-1.5 line-clamp-2 text-lg font-bold tracking-tight text-slate-950 transition group-hover:text-blue-600">
                                                {laptop.model}
                                                {laptop.name ? ` - ${laptop.name}` : ''}
                                            </h3>
                                            {tags.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-1.5">
                                                    {tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="mt-auto pt-5">
                                                {Number(laptop.cost_price ?? 0) >
                                                    Number(laptop.selling_price ?? 0) && (
                                                    <p className="text-xs font-medium text-slate-400 line-through">
                                                        {formatCurrency(laptop.cost_price)}
                                                    </p>
                                                )}
                                                <p className="text-xl font-bold text-blue-600">
                                                    {formatCurrency(laptop.selling_price)}
                                                </p>
                                                <div className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-blue-600">
                                                    Lihat detail
                                                    <ArrowRight className="h-4 w-4" weight="bold" />
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    {laptops.last_page > 1 && (
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                            <a
                                href={buildCatalogUrl(
                                    Math.max(laptops.current_page - 1, 1),
                                    filters,
                                )}
                                aria-label="Halaman sebelumnya"
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-blue-600"
                            >
                                <ArrowLeft className="h-4 w-4" weight="bold" />
                            </a>
                            {Array.from({ length: laptops.last_page }).map((_, i) => {
                                const page = i + 1;
                                if (
                                    page > 4 &&
                                    page < laptops.last_page &&
                                    Math.abs(page - laptops.current_page) > 1
                                ) {
                                    if (page === 5)
                                        return (
                                            <span
                                                key={page}
                                                className="px-2 text-slate-400"
                                            >
                                                ...
                                            </span>
                                        );
                                    return null;
                                }
                                return (
                                    <a
                                        key={page}
                                        href={buildCatalogUrl(page, filters)}
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition ${
                                            page === laptops.current_page
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600'
                                        }`}
                                    >
                                        {page}
                                    </a>
                                );
                            })}
                            <a
                                href={buildCatalogUrl(
                                    Math.min(
                                        laptops.current_page + 1,
                                        laptops.last_page,
                                    ),
                                    filters,
                                )}
                                aria-label="Halaman berikutnya"
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-blue-600"
                            >
                                <ArrowRight className="h-4 w-4" weight="bold" />
                            </a>
                        </div>
                    )}
                </div>
            </section>
        </PublicPage>
    );
}
