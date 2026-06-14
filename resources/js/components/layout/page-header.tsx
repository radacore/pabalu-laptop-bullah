import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode[];
}

export default function PageHeader({
    title,
    description,
    actions = [],
}: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
                <h1 className="headline-md text-foreground">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    {actions.map((action, actionIndex) => (
                        <span key={actionIndex}>{action}</span>
                    ))}
                </div>
            )}
        </div>
    );
}
