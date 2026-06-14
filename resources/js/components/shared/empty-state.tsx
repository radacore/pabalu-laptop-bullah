import { PackageOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
}

export default function EmptyState({
    icon: Icon = PackageOpen,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface px-6 py-12 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant">
                <Icon className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-on-surface">{title}</h3>
            <p className="mt-2 max-w-sm text-sm text-on-surface-variant">
                {description}
            </p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
