import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppSidebarHeader } from '@/components/layout/app-sidebar-header';
import type { ReactNode } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: {
    children: ReactNode;
    breadcrumbs?: unknown[];
}) {
    return (
        <div className="flex h-full w-full">
            <AppSidebar />
            <div className="flex h-full w-full flex-1 flex-col md:ml-[280px]">
                <AppSidebarHeader />
                <main className="p-container-padding flex-1 overflow-y-auto bg-background pb-12">
                    {children}
                </main>
            </div>
        </div>
    );
}
