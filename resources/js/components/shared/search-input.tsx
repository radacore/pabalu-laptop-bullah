import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
    value?: string | null;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchInput({
    value = '',
    onChange,
    placeholder = 'Cari...',
    className,
}: SearchInputProps) {
    const [localValue, setLocalValue] = useState(value ?? '');
    // onChange disimpan di ref agar effect tidak refire saat caller
    // passing inline arrow (referensi baru tiap render) — hanya localValue
    // yang memicu debounce. Skip tembakan pertama saat mount.
    const onChangeRef = useRef(onChange);
    const mountedRef = useRef(false);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;

            return;
        }

        const timeout = window.setTimeout(() => {
            onChangeRef.current(localValue);
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [localValue]);

    return (
        <div className={cn('relative w-full sm:max-w-sm', className)}>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-on-surface-variant" />
            <Input
                value={localValue}
                onChange={(event) => setLocalValue(event.target.value)}
                placeholder={placeholder}
                className="pr-10 pl-9"
                type="search"
            />
            {localValue && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    onClick={() => setLocalValue('')}
                    aria-label="Hapus pencarian"
                >
                    <X className="size-4" />
                </Button>
            )}
        </div>
    );
}
