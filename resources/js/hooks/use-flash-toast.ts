import { useEffect } from 'react';
import type { FlashToast } from '@/types/ui';

type ToastVariant = 'success' | 'update' | 'delete';

const noop = () => {};

export function detectVariant(message: string): ToastVariant {
    if (message.includes('dihapus')) return 'delete';
    if (message.includes('diperbarui') || message.includes('diedit')) return 'update';
    return 'success';
}

export function useFlashToast(_options?: {
    addToast?: (variant: ToastVariant, title: string, description?: string) => void;
}): void {
    useEffect(() => {
        noop();
    }, []);
}

export type { ToastVariant };
