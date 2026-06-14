import { router } from '@inertiajs/react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import type { FlashToast } from '@/types/ui';

type ToastVariant = 'success' | 'update' | 'delete';

type Toast = {
    id: string;
    variant: ToastVariant;
    title: string;
    description?: string;
};

type ToastContextType = {
    addToast: (variant: ToastVariant, title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within a <ToastProvider />');
    return ctx;
}

function detectVariant(message: string): ToastVariant {
    if (message.includes('dihapus')) return 'delete';
    if (message.includes('diperbarui') || message.includes('diedit')) return 'update';
    return 'success';
}

const variantConfig: Record<ToastVariant, { border: string; icon: string; iconColor: string }> = {
    success: {
        border: 'border-[#009668]',
        icon: 'check_circle',
        iconColor: 'text-[#009668]',
    },
    update: {
        border: 'border-[#0058be]',
        icon: 'edit',
        iconColor: 'text-[#0058be]',
    },
    delete: {
        border: 'border-[#ba1a1a]',
        icon: 'delete',
        iconColor: 'text-[#ba1a1a]',
    },
};

const defaultDescriptions: Record<ToastVariant, string> = {
    success: 'Informasi baru telah ditambahkan ke sistem.',
    update: 'Data berhasil diperbarui.',
    delete: 'Data telah dihapus dari sistem.',
};



function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const config = variantConfig[toast.variant];

    return (
        <div
            className={`pointer-events-auto flex gap-3 rounded-lg border-l-4 ${config.border} bg-white p-4 shadow-xl animate-slide-in`}
            role="alert"
        >
            <div className={`${config.iconColor} flex items-start pt-0.5`}>
                <span className="material-symbols-outlined text-[22px]">{config.icon}</span>
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-semibold leading-5 text-[#1b1c1e]">
                    {toast.title}
                </h4>
                {toast.description && (
                    <p className="mt-0.5 text-[13px] leading-4 text-[#49454f]">
                        {toast.description}
                    </p>
                )}
            </div>

            <button
                type="button"
                onClick={onClose}
                className="flex items-start pt-0.5 text-[#76777d] hover:text-[#1b1c1e] transition-colors"
                aria-label="Tutup"
            >
                <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
        </div>
    );
}



export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const counterRef = useRef(0);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        (variant: ToastVariant, title: string, description?: string) => {
            const id = `toast-${++counterRef.current}`;
            setToasts((prev) => [...prev, { id, variant, title, description }]);
            setTimeout(() => removeToast(id), 5000);
        },
        [removeToast],
    );

    /* Listen for Inertia flash toasts */
    useEffect(() => {
        return router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.toast as FlashToast | undefined;
            if (!data) return;

            const variant = detectVariant(data.message);

            let message = data.message;
            /* Capitalise first letter */
            message = message.charAt(0).toUpperCase() + message.slice(1);

            addToast(variant, message, defaultDescriptions[variant]);
        });
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}

            {/* Toast container - fixed bottom-right */}
            <div className="fixed bottom-6 right-6 z-[9999] flex w-[360px] flex-col gap-3 pointer-events-none">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}
