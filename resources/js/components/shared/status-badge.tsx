import { cn } from '@/lib/utils';

type StatusLike = {
    name?: string | null;
    slug?: string | null;
    color?: string | null;
};

/** DESIGN.md: pill badges with 10% background tint + 100% text color */
const statusVariants: Record<string, { bg: string; text: string }> = {
    available: { bg: 'bg-[#10b981]/10', text: 'text-[#10b981]' },
    completed: { bg: 'bg-[#8b5cf6]/10', text: 'text-[#8b5cf6]' },
    done: { bg: 'bg-[#8b5cf6]/10', text: 'text-[#8b5cf6]' },
    error: { bg: 'bg-[#ef4444]/10', text: 'text-[#ef4444]' },
    pending: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
    progress: { bg: 'bg-[#3b82f6]/10', text: 'text-[#3b82f6]' },
    sold: { bg: 'bg-[#64748b]/10', text: 'text-[#64748b]' },
    'dalam-proses': { bg: 'bg-[#3b82f6]/10', text: 'text-[#3b82f6]' },
    diterima: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
    selesai: { bg: 'bg-[#8b5cf6]/10', text: 'text-[#8b5cf6]' },
    tersedia: { bg: 'bg-[#10b981]/10', text: 'text-[#10b981]' },
    terjual: { bg: 'bg-[#64748b]/10', text: 'text-[#64748b]' },
};

function normalizeStatus(status: StatusLike | string | null | undefined) {
    if (!status) {
        return { label: 'Tidak Diketahui', key: 'tidak-diketahui' };
    }

    if (typeof status === 'string') {
        return {
            label: status,
            key: status.toLowerCase().replace(/\s+/g, '-'),
        };
    }

    const label = status.name ?? status.slug ?? 'Tidak Diketahui';
    const key = (status.slug ?? label).toLowerCase().replace(/\s+/g, '-');

    return { label, key };
}

export default function StatusBadge({
    status,
    className,
}: {
    status: StatusLike | string | null | undefined;
    className?: string;
}) {
    const { label, key } = normalizeStatus(status);
    const variant = statusVariants[key] ??
        Object.values(statusVariants).find((_, i) =>
            Object.keys(statusVariants)[i] === key,
        ) ??
        { bg: 'bg-[#64748b]/10', text: 'text-[#64748b]' };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                variant.bg,
                variant.text,
                className,
            )}
        >
            {label}
        </span>
    );
}
