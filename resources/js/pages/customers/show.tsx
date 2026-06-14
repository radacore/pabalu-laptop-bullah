import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ServiceStatus = {
    id: number | string;
    name: string;
    slug?: string;
};

type Service = {
    id: number | string;
    service_code?: string | null;
    code?: string | null;
    device_name?: string | null;
    status?: ServiceStatus | null;
    received_date?: string | null;
    created_at?: string | null;
    estimated_cost?: number | string | null;
    final_cost?: number | string | null;
};

type Pelanggan = {
    id: number | string;
    name: string;
    phone: string;
    address?: string | null;
    note?: string | null;
    created_at?: string | null;
    services?: Service[];
};

interface Props {
    pelanggan: Pelanggan;
}

type HalamanComponent = ((props: Props) => ReactNode) & {
    layout?: (page: ReactNode) => ReactNode;
};

const statusTone: Record<string, string> = {
    diterima: 'border-status-pending/30 bg-status-pending/10 text-amber-700 dark:text-amber-300',
    'dicek-teknisi': 'border-status-progress/30 bg-status-progress/10 text-blue-700 dark:text-blue-300',
    'dalam-pengerjaan': 'border-status-progress/30 bg-status-progress/10 text-blue-700 dark:text-blue-300',
    selesai: 'border-status-completed/30 bg-status-completed/10 text-violet-700 dark:text-violet-300',
    diambil: 'border-status-available/30 bg-status-available/10 text-emerald-700 dark:text-emerald-300',
    dibatalkan: 'border-status-error/30 bg-status-error/10 text-red-700 dark:text-red-300',
};

function StatusBadge({ status }: { status?: ServiceStatus | null }) {
    if (!status) {
        return <Badge variant="outline">Tidak ada status</Badge>;
    }

    const key = status.slug ?? status.name.toLowerCase().replaceAll(' ', '-');

    return <Badge variant="outline" className={statusTone[key] ?? 'border-muted bg-muted text-muted-foreground'}>{status.name}</Badge>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value?: ReactNode }) {
    return (
        <div className="grid gap-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="text-sm text-foreground">{value || '-'}</dd>
        </div>
    );
}

function formatTanggal(value?: string | null) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value));
}

function formatCurrency(value?: number | string | null) {
    const amount = Number(value ?? 0);
    if (!amount) {
        return '-';
    }

    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function serviceCode(service: Service) {
    return service.service_code ?? service.code ?? `SRV-${service.id}`;
}

const PelanggansShow: HalamanComponent = ({ pelanggan }) => {
    const services = pelanggan.services ?? [];

    return (
        <>
            <Head title={pelanggan.name} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{pelanggan.name}</h1>
                        <p className="text-sm text-muted-foreground">{pelanggan.phone} · Bergabung sejak {formatTanggal(pelanggan.created_at)}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline"><Link href="/customers">Kembali</Link></Button>
                        <Button asChild><Link href={`/customers/${pelanggan.id}/edit`}>Edit Pelanggan</Link></Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail</CardTitle>
                        <CardDescription>Kontak and internal pelanggan notes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <DetailRow label="Nama" value={pelanggan.name} />
                            <DetailRow label="Telepon" value={pelanggan.phone} />
                            <DetailRow label="Alamat" value={pelanggan.address} />
                            <DetailRow label="Catatan" value={pelanggan.note} />
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Services History</CardTitle>
                        <CardDescription>All services recorded for this pelanggan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {services.length === 0 ? (
                            <EmptyState title="Tidak service history" description="Service rows will appear once this pelanggan creates a request." />
                        ) : (
                            <div className="overflow-hidden rounded-lg border">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50 text-left text-muted-foreground">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Code</th>
                                                <th className="px-4 py-3 font-medium">Perangkat</th>
                                                <th className="px-4 py-3 font-medium">Status</th>
                                                <th className="px-4 py-3 font-medium">Tanggal</th>
                                                <th className="px-4 py-3 font-medium">Modal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {services.map((service) => (
                                                <tr key={service.id} className="transition-colors hover:bg-muted/30">
                                                    <td className="px-4 py-3 font-medium">
                                                        <Link href={`/services/${service.id}`} className="text-primary hover:underline">{serviceCode(service)}</Link>
                                                    </td>
                                                    <td className="px-4 py-3">{service.device_name ?? '-'}</td>
                                                    <td className="px-4 py-3"><StatusBadge status={service.status} /></td>
                                                    <td className="px-4 py-3">{formatTanggal(service.received_date ?? service.created_at)}</td>
                                                    <td className="px-4 py-3">{formatCurrency(service.final_cost ?? service.estimated_cost)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

PelanggansShow.layout = (page) => <AppLayout breadcrumbs={[{ title: 'Pelanggan', href: '/customers' }, { title: 'Pelanggan Detail', href: '#' }]}>{page}</AppLayout>;

export default PelanggansShow;
