import type { ReactNode } from 'react';
import SearchInput from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Column<RowData> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: RowData) => ReactNode;
}

interface DataTableProps<RowData extends object> {
    columns: Column<RowData>[];
    data: RowData[];
    pagination: {
        current_page: number;
        last_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    search?: string;
    onSearch?: (value: string) => void;
    onPageChange?: (page: number) => void;
}

function getVisiblePages(currentPage: number, lastPage: number) {
    const pages = new Set<number>();
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(lastPage, currentPage + 1);

    pages.add(1);

    for (let page = startPage; page <= endPage; page += 1) {
        pages.add(page);
    }

    pages.add(lastPage);

    return Array.from(pages).sort((a, b) => a - b);
}

function getCellValue<RowData extends object>(item: RowData, key: string) {
    return (item as Record<string, unknown>)[key];
}

export default function DataTable<RowData extends object>({
    columns,
    data,
    pagination,
    search = '',
    onSearch,
    onPageChange,
}: DataTableProps<RowData>) {
    const visiblePages = getVisiblePages(
        pagination.current_page,
        pagination.last_page,
    );
    const canGoPrev = pagination.current_page > 1;
    const canGoNext = pagination.current_page < pagination.last_page;

    return (
        <Card className="overflow-hidden rounded-xl py-0 shadow-low">
            {onSearch && (
                <div className="border-b border-[#e2e8f0] px-4 py-4 sm:px-6">
                    <SearchInput
                        value={search}
                        onChange={onSearch}
                        placeholder="Cari data..."
                    />
                </div>
            )}

            <CardContent className="px-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#e2e8f0]">
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        scope="col"
                                        className={cn(
                                            'h-11 border-b border-outline-variant px-4 text-left align-middle label-md font-medium whitespace-nowrap text-on-surface-variant sm:px-6',
                                        )}
                                    >
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, rowIndex) => {
                                    const rowId = (
                                        item as { id?: number | string }
                                    ).id;

                                    return (
                                        <tr
                                            key={rowId ?? rowIndex}
                                            className={cn(
                                                'border-b border-[#e2e8f0] transition-colors last:border-0',
                                                rowIndex % 2 === 1 &&
                                                    'bg-[#f8fafc]',
                                            )}
                                        >
                                            {columns.map((column) => {
                                                const cellValue = getCellValue(
                                                    item,
                                                    column.key,
                                                );

                                                return (
                                                    <td
                                                        key={column.key}
                                                        className="px-4 py-3 align-middle whitespace-nowrap sm:px-6"
                                                    >
                                                        {column.render
                                                            ? column.render(
                                                                  item,
                                                              )
                                                            : (cellValue as ReactNode)}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-4 py-12 text-center text-sm text-on-surface-variant"
                                    >
                                        Belum ada data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>

            {pagination.last_page > 1 && (
                <CardFooter className="flex items-center justify-between border-t border-[#e2e8f0] px-4 py-3 sm:px-6">
                    <p className="text-sm text-on-surface-variant">
                        Menampilkan {pagination.from ?? 0}–{pagination.to ?? 0}{' '}
                        dari {pagination.total}
                    </p>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={!canGoPrev}
                            onClick={() =>
                                onPageChange?.(pagination.current_page - 1)
                            }
                        >
                            Sebelumnya
                        </Button>

                        {visiblePages.map((page, index) => {
                            const prevPage = visiblePages[index - 1];
                            const showGap =
                                prevPage != null && page - prevPage > 1;

                            return (
                                <span
                                    key={page}
                                    className="flex items-center gap-1"
                                >
                                    {showGap && (
                                        <span className="px-1 text-sm text-on-surface-variant">
                                            ...
                                        </span>
                                    )}
                                    <Button
                                        variant={
                                            page === pagination.current_page
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        size="sm"
                                        className="min-w-9"
                                        onClick={() => onPageChange?.(page)}
                                    >
                                        {page}
                                    </Button>
                                </span>
                            );
                        })}

                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={!canGoNext}
                            onClick={() =>
                                onPageChange?.(pagination.current_page + 1)
                            }
                        >
                            Selanjutnya
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
