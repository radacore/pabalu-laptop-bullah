import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DeleteDialog from '@/components/shared/delete-dialog';
import HalamanHeader from '@/components/layout/page-header';
import StatusBadge from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ItemData { id: number; name: string; is_active?: boolean; description?: string | null; color?: string | null; }
interface IndexProps { categories: { data: ItemData[]; current_page: number; last_page: number; total: number; from: number | null; to: number | null }; filters: { search?: string }; }

export default function KategoriIndex({ categories: data, filters }: IndexProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    function handleDelete() { if (!deleteId) return; router.delete(`/master-data/categories/${deleteId}`, { preserveState: true, replace: true, onSuccess: () => setDeleteId(null) }); }
    function handleSearch(v: string) { setSearch(v); router.get('/master-data/categories', { search: v || undefined }, { preserveState: true, replace: true }); }
    function goToHalaman(p: number) { router.get(`/master-data/categories?page=${p}`, {}, { preserveState: true, replace: true }); }
    return (<><Head title="Kategori" /><div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
        <HalamanHeader title="Kategori" description="Manage product categories" actions={[<Button key="c" asChild><Link href="/master-data/categories/create"><Plus className="mr-2 size-4" />Add Kategori</Link></Button>]} />
        <Card className="overflow-hidden py-0">
            <div className="border-b px-4 py-4 sm:px-6"><div className="relative w-full sm:max-w-sm">
                <input type="search" placeholder="Cari kategori..." className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 pl-9 text-sm shadow-xs outline-none focus-visible:ring-[3px]" value={search} onChange={(e) => handleSearch(e.target.value)} />
                <svg className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div></div>
            <CardContent className="px-0">
                <div className="overflow-x-auto"><table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground"><tr className="border-b">
                        <th className="px-4 py-3 text-left font-medium sm:px-6">Nama</th><th className="px-4 py-3 text-left font-medium sm:px-6">Status</th><th className="px-4 py-3 text-right font-medium sm:px-6">Activity</th>
                    </tr></thead>
                    <tbody className="divide-y">
                        {data.data.map((item: ItemData) => (<tr key={item.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 sm:px-6"><div className="flex items-center gap-2">{item.color && <span className="inline-block size-3 rounded-full" style={{backgroundColor:item.color}}/>}<span className="font-medium">{item.name}</span></div></td>
                            <td className="px-4 py-3 sm:px-6"><StatusBadge status={item.is_active ? 'available' : 'error'} /></td>
                            <td className="px-4 py-3 text-right sm:px-6"><div className="flex items-center justify-end gap-1">
                                <Button variant="success" size="sm" asChild><Link href={`/master-data/categories/${item.id}/edit`}><Edit className="mr-1 size-4" />Edit</Link></Button>
                                <Button variant="destructive" size="sm" onClick={() => setDeleteId(item.id)}><Trash2 className="mr-1 size-4" />Hapus</Button>
                            </div></td>
                        </tr>))}
                        {data.data.length === 0 && (<tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Tidak data.</td></tr>)}
                    </tbody>
                </table></div>
            </CardContent>
            {data.last_page > 1 && (<div className="flex items-center justify-between border-t px-6 py-3">
                <p className="text-sm text-muted-foreground">Menampilkan {data.from ?? 0} to {data.to ?? 0} of {data.total}</p>
                <div className="flex gap-1"><Button variant="outline" size="sm" disabled={data.current_page<=1} onClick={() => goToHalaman(data.current_page-1)}>Sebelumnya</Button><Button variant="outline" size="sm" disabled={data.current_page>=data.last_page} onClick={() => goToHalaman(data.current_page+1)}>Selanjutnya</Button></div>
            </div>)}
        </Card>
    </div>
    <DeleteDialog open={deleteId!==null} onOpenChange={(o)=>{if(!o)setDeleteId(null);}} onKonfirmasi={handleDelete} title="Trash2 Kategori" description="Apakah Anda yakin?" />
    </>);
}
