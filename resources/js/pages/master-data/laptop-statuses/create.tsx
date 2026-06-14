import * as React from "react";
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const ta = "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]";

export default function LaptopStatusBuat() {
    const f = useForm({ name: "", is_active: true, description: "" });
    function submit(e: React.FormEvent) { e.preventDefault(); f.post("/master-data/laptop-statuses"); }
    return (<><Head title="Buat" /><div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h1 className="text-2xl font-semibold tracking-tight">Buat Status Laptop</h1><p className="text-sm text-muted-foreground">Tambah status laptop baru</p></div>
            <Button variant="outline" asChild><Link href="/master-data/laptop-statuses"><ArrowLeft className="mr-2 size-4" />Back</Link></Button>
        </header>
        <form onSubmit={submit} className="space-y-6">
            <Card><CardHeader><CardTitle>Informasi</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="grid gap-2"><Label htmlFor="name">Nama *</Label><Input id="name" value={f.data.name} onChange={e=>f.setData("name",e.target.value)} /><InputError message={f.errors.name} /></div>
                <div className="flex items-center gap-2"><Switch id="is_active" checked={f.data.is_active} onCheckedChange={(c: boolean)=>f.setData("is_active",c)} /><Label htmlFor="is_active">Aktif</Label></div>
                <div className="grid gap-2"><Label htmlFor="description">Deskripsi</Label><textarea id="description" className={ta} value={f.data.description} onChange={e=>f.setData("description",e.target.value)} /></div>
            </CardContent></Card>
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" asChild><Link href="/master-data/laptop-statuses">Batal</Link></Button><Button type="submit" disabled={f.processing}><Save className="mr-2 size-4" />Save</Button></div>
        </form>
    </div></>);
}