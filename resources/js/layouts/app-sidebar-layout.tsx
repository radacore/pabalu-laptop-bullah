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
            <AppSidebarHeader onToggleCollapse={toggleCollapse} collapsed={collapsed} />

            {/* Sidebar */}
            <AppSidebar collapsed={collapsed} />

            {/* Main content */}
            <main
                className={`transition-all duration-300 pt-16 ${
                    collapsed ? 'md:pl-20' : 'md:pl-64'
                }`}
            >
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
