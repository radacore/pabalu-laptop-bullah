import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppSidebarHeader } from '@/components/layout/app-sidebar-header';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import type { BreadcrumbItem } from '@/types';

interface AppSidebarLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppSidebarLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    // Key per URL agar animasi .admin-page-enter terpicu ulang di setiap
    // navigasi (tanpa ini React hanya reconcile dan animasi jalan sekali).
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-slate-50">
            <AppSidebarHeader
                onToggleCollapse={toggleCollapse}
                collapsed={collapsed}
            />

            <AppSidebar collapsed={collapsed} />

            <main
                className={`pt-16 pb-6 transition-all duration-300 ${
                    collapsed ? 'md:pl-20' : 'md:pl-64'
                }`}
            >
                <div className="px-6">
                    {breadcrumbs.length > 0 && (
                        <div className="pt-4">
                            <Breadcrumbs items={breadcrumbs} />
                        </div>
                    )}
                    <div key={url} className="admin-page-enter">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
