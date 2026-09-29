import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import type { BreadcrumbItem } from '@/types';

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm text-slate-500"
        >
            <ol className="flex flex-wrap items-center gap-1">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const key = `${item.title}-${String(item.href)}`;

                    return (
                        <Fragment key={key}>
                            <li className="flex items-center">
                                {isLast ? (
                                    <span
                                        aria-current="page"
                                        className="font-medium text-slate-900"
                                    >
                                        {item.title}
                                    </span>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className="rounded-md px-1 py-0.5 hover:bg-slate-100 hover:text-slate-900"
                                    >
                                        {item.title}
                                    </Link>
                                )}
                            </li>
                            {!isLast && (
                                <li
                                    aria-hidden="true"
                                    className="text-slate-300"
                                >
                                    <ChevronRight className="size-3.5" />
                                </li>
                            )}
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}
