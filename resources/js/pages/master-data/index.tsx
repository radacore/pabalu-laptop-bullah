import { Head, Link } from '@inertiajs/react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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

function MasterDataIndex({ groups, totals }: MasterDataIndexProps) {
    return (
        <>
            <Head title="Data Master" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Data Master</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola data referensi yang digunakan di seluruh aplikasi · {totals.groups} grup · {totals.items} item
                        </p>
                    </div>
                </div>

                <div className="space-y-8">
                    {groups.map((group) => (
                        <section key={group.key} className="space-y-3">
                            <div className="flex items-end justify-between border-b pb-2">
                                <div>
                                    <h2 className="text-base font-bold uppercase tracking-wider text-on-surface">{group.title}</h2>
                                    <p className="mt-0.5 text-xs text-muted-foreground">{group.description}</p>
                                </div>
                                <span className="rounded-full bg-secondary-container px-2.5 py-0.5 text-[11px] font-bold text-on-secondary-container">
                                    {group.items.length} master
                                </span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {group.items.map((item) => {
                                    const Icon = (Icons as unknown as Record<string, LucideIcon>)[item.icon] ?? Icons.Tag;
                                    return (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            className="group relative flex items-start gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                                        >
                                            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                                                <Icon className="size-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="text-sm font-bold text-on-surface">{item.title}</h3>
                                                    <span className="flex-shrink-0 rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-bold text-on-surface-variant">
                                                        {item.count}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                                            </div>
                                            <Icons.ChevronRight className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-outline opacity-0 transition-opacity group-hover:opacity-100" />
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
