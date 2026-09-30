import { useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
    children: ReactNode;
    className?: string;
    /** Jeda sebelum animasi jalan (ms), untuk efek stagger. */
    delay?: number;
    /** Ambang visibilitas 0-1 sebelum animasi terpicu. */
    threshold?: number;
    style?: CSSProperties;
    /** Diteruskan ke wrapper (mis. anchor #services). */
    id?: string;
    /**
     * True = tampil langsung tanpa animasi. Dipakai katalog agar hasil
     * filter/paginasi tidak fade-in ulang (terasa seperti refresh).
     */
    instant?: boolean;
}

/**
 * Bungkus section/kartu halaman publik agar fade+slide saat masuk
 * viewport. Sekali tampil, tetap tampil (tidak bolak-balik).
 * Nonaktif otomatis bila user pakai prefers-reduced-motion (CSS).
 */
export default function Reveal({
    children,
    className,
    delay = 0,
    threshold = 0.12,
    style,
    id,
    instant = false,
}: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (instant) {
            return;
        }

        const el = ref.current;

        if (!el) {
            return;
        }

        if (typeof IntersectionObserver === 'undefined') {
            el.classList.add('is-visible');

            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                }
            },
            { threshold, rootMargin: '0px 0px -8% 0px' },
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, [threshold, instant]);

    if (instant) {
        return (
            <div ref={ref} id={id} className={className} style={style}>
                {children}
            </div>
        );
    }

    return (
        <div
            ref={ref}
            id={id}
            className={cn('tc-reveal', className)}
            style={
                { ...style, '--reveal-delay': `${delay}ms` } as CSSProperties
            }
        >
            {children}
        </div>
    );
}
