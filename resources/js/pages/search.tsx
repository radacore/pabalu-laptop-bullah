import { Head, Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { Customer, Laptop, Service } from '@/types';

interface SearchResults {
    q: string;
    laptops: Laptop[];
    services: Service[];
    customers: Customer[];
    total: number;
}

function SearchIndex() {
    const { q, laptops, services, customers, total } = usePage<{ props: SearchResults }>().props as unknown as SearchResults;

    return (
        <>
            <Head title={`Pencarian: ${q || 'Semua'}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-on-surface">Pencarian</h1>
                    <p className="mt-1 text-sm text-on-surface-variant">
                        {q
                            ? total > 0
                                ? `Menampilkan ${total} hasil untuk `
                                : `Tidak ada hasil untuk `
                            : 'Ketik kata kunci di pencarian navbar untuk mulai mencari.'}
                        {q && (
                            <span className="font-semibold text-on-surface">"{q}"</span>
                        )}
                    </p>
                </div>

                {q === '' && (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <span className="material-symbols-outlined mx-auto text-[64px] text-outline">search</span>
                            <h2 className="mt-4 text-base font-medium text-on-surface">Belum ada kata kunci</h2>
                            <p className="mt-1 text-sm text-on-surface-variant">
                                Gunakan kotak pencarian di navbar atas untuk mencari laptop, servis, atau pelanggan.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {q !== '' && total === 0 && (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <span className="material-symbols-outlined mx-auto text-[64px] text-outline">search_off</span>
                            <h2 className="mt-4 text-base font-medium text-on-surface">Tidak ada hasil</h2>
                            <p className="mt-1 text-sm text-on-surface-variant">
                                Coba kata kunci lain seperti nama pelanggan, nomor telepon, SKU, atau kode servis.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {laptops.length > 0 && <ResultSection title="Laptop" count={laptops.length} icon="laptop_mac">
                    {laptops.map((laptop) => (
                        <Link
                            key={`laptop-${laptop.id}`}
                            href={`/laptops/${laptop.id}`}
                            className="hover:bg-surface-container-low flex items-center gap-4 border-b border-outline-variant px-5 py-4 transition-colors last:border-b-0"
                        >
                            <div className="bg-primary-container text-on-primary-container flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                                <span className="material-symbols-outlined">laptop_mac</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[15px] font-semibold text-on-surface">
                                    {laptop.name || laptop.sku}
                                </p>
                                <p className="mt-0.5 text-xs text-on-surface-variant">
                                    {laptop.brand} {laptop.model} {laptop.sku && `· ${laptop.sku}`}
                                </p>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-2">
                                {laptop.status?.name && (
                                    <span className="rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-semibold uppercase text-on-surface-variant">
                                        {laptop.status.name}
                                    </span>
                                )}
                                <span className="material-symbols-outlined text-outline">chevron_right</span>
                            </div>
                        </Link>
                    ))}
                </ResultSection>}

                {services.length > 0 && <ResultSection title="Servis" count={services.length} icon="build">
                    {services.map((service) => (
                        <Link
                            key={`service-${service.id}`}
                            href={`/services/${service.id}`}
                            className="hover:bg-surface-container-low flex items-center gap-4 border-b border-outline-variant px-5 py-4 transition-colors last:border-b-0"
                        >
                            <div className="bg-secondary-container text-on-secondary-container flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                                <span className="material-symbols-outlined">build</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[15px] font-semibold text-on-surface">
                                    {service.service_code}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-on-surface-variant">
                                    {service.customer?.name ?? '-'}
                                    {service.brand && ` · ${service.brand}`}
                                    {service.complaint && ` · ${service.complaint.slice(0, 60)}${service.complaint.length > 60 ? '...' : ''}`}
                                </p>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-2">
                                {service.status?.name && (
                                    <span className="rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-semibold uppercase text-on-surface-variant">
                                        {service.status.name}
                                    </span>
                                )}
                                <span className="material-symbols-outlined text-outline">chevron_right</span>
                            </div>
                        </Link>
                    ))}
                </ResultSection>}

                {customers.length > 0 && <ResultSection title="Pelanggan" count={customers.length} icon="group">
                    {customers.map((customer) => (
                        <Link
                            key={`customer-${customer.id}`}
                            href={`/customers/${customer.id}`}
                            className="hover:bg-surface-container-low flex items-center gap-4 border-b border-outline-variant px-5 py-4 transition-colors last:border-b-0"
                        >
                            <div className="bg-tertiary-container text-on-tertiary-container flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold">
                                {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[15px] font-semibold text-on-surface">
                                    {customer.name}
                                </p>
                                <p className="mt-0.5 text-xs text-on-surface-variant">
                                    {customer.phone}
                                </p>
                            </div>
                            <span className="material-symbols-outlined flex-shrink-0 text-outline">chevron_right</span>
                        </Link>
                    ))}
                </ResultSection>}
            </div>
        </>
    );
}

function ResultSection({
    title,
    count,
    icon,
    children,
}: {
    title: string;
    count: number;
    icon: string;
    children: ReactNode;
}) {
    return (
        <Card className="overflow-hidden py-0">
            <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container-low px-5 py-3">
                <span className="material-symbols-outlined text-on-surface-variant">{icon}</span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface">{title}</h2>
                <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[11px] font-bold text-on-secondary-container">
                    {count}
                </span>
            </div>
            <CardContent className="p-0">{children}</CardContent>
        </Card>
    );
}

SearchIndex.layout = (page: ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Pencarian', href: '/search' }]}>
        {page}
    </AppLayout>
);

export default SearchIndex;
