import { useState } from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppSidebarHeader } from '@/components/layout/app-sidebar-header';

interface AppSidebarLayoutProps {
    children: React.ReactNode;
}

export default function AppSidebarLayout({ children }: AppSidebarLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <AppSidebarHeader
                onToggleCollapse={toggleCollapse}
                collapsed={collapsed}
            />

            {/* Sidebar */}
            <AppSidebar collapsed={collapsed} />

            {/* Main content - pt-16 = 64px matches navbar h-16 */}
            <main
                className={`pt-16 pb-6 transition-all duration-300 ${
                    collapsed ? 'md:pl-20' : 'md:pl-64'
                }`}
            >
                <div className="px-6">{children}</div>
            </main>
        </div>
    );
}
