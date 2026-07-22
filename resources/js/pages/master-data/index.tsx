import { Head, Link } from '@inertiajs/react';
import {
    Buildings,
    ChartBar,
    CircleNotch,
    Cpu,
    Database,
    GearSix,
    HardDrives,
    Package,
    Receipt,
    Tag,
    Trademark,
    TreeStructure,
    Wrench,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import AppLayout from '@/layouts/app-layout';

interface MasterDataItem {
    key: string;
    title: string;
    description: string;
    icon: string;
    href: string;
    count: number;
}

interface MasterDataGroup {
    key: string;
    title: string;
    description: string;
    items: MasterDataItem[];
}

interface MasterDataIndexProps {
    groups: MasterDataGroup[];
    totals: { groups: number; items: number };
}

const iconMap: Record<
    string,
    React.ComponentType<{ className?: string; weight?: any }>
> = {
    Tag: Tag,
    Cpu: Cpu,
    HardDrives: HardDrives,
    Buildings: Buildings,
    CircleNotch: CircleNotch,
    TreeStructure: TreeStructure,
    Wrench: Wrench,
    Package: Package,
    Receipt: Receipt,
    BrandApple: Trademark,
    GearSix: GearSix,
    ChartBar: ChartBar,
};

function MasterDataIndex({ groups, totals }: MasterDataIndexProps) {
    return (
        <>
            <Head title="Data Master" />
            <div className="mx-auto max-w-7xl space-y-8 p-6">
                {/* Header */}
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Data Master
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Kelola data referensi yang digunakan di seluruh
                            aplikasi
                        </p>
                    </div>
                </header>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="text-sm font-medium text-slate-600">
                            Total Grup
                        </div>
                        <div className="mt-1 text-2xl font-bold text-slate-900">
                            {totals.groups}
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="text-sm font-medium text-slate-600">
                            Total Item
                        </div>
                        <div className="mt-1 text-2xl font-bold text-slate-900">
                            {totals.items}
                        </div>
                    </div>
                </div>

                {/* Groups */}
                <div className="space-y-6">
                    {groups.map((group) => (
                        <section key={group.key} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        {group.title}
                                    </h2>
                                    <p className="text-sm text-slate-600">
                                        {group.description}
                                    </p>
                                </div>
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                    {group.items.length} master
                                </span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {group.items.map((item) => {
                                    const Icon = iconMap[item.icon] ?? Tag;

                                    return (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            className="group relative rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                                                    <Icon
                                                        className="h-5 w-5"
                                                        weight="duotone"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="text-sm font-semibold text-slate-900">
                                                            {item.title}
                                                        </h3>
                                                        <span className="flex-shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                                            {item.count}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </>
    );
}

MasterDataIndex.layout = (page: ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Data Master', href: '/master-data' }]}>
        {page}
    </AppLayout>
);

export default MasterDataIndex;
