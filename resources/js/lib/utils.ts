import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as React from 'react';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Minimal Slot – clones a single child, merging props + className. No Radix dependency. */
export function Slot({ children, className, ...rest }: { children: React.ReactNode; className?: string; [key: string]: unknown }) {
    const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
    const childClassName = child.props.className as string | undefined;
    return React.cloneElement(child, {
        ...rest,
        className: cn(childClassName, className),
    });
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}
