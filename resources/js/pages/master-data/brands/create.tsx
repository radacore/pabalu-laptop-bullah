import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const textareaClassNama = 'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50';

export default function MerekBuat() {
    const form = useForm({
        name: '',
        is_active: true,
        description: '',
    });

    function submit(e: { preventDefault: () => void }) {
        e.preventDefault();
        form.post('/master-data/brands');
    }

    return (
        <>
            <Head title="Buat Merek" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Buat Merek</h1>
                        <p className="text-sm text-muted-foreground">Add a new laptop brand</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/master-data/brands">
                            <ArrowLeft className="mr-2 size-4" />
                            Back
                        </Link>
                    </Button>
                </header>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Merek</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama <span className="text-destructive">*</span></Label>
                                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Dell, Lenovo" />
                                <InputError message={form.errors.name} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch id="is_active" checked={form.data.is_active} onCheckedChange={(checked: boolean) => form.setData('is_active', checked)} />
                                <Label htmlFor="is_active">Aktif</Label>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <textarea id="description" className={textareaClassNama} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} placeholder="Optional description" />
                                <InputError message={form.errors.description} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/master-data/brands">Batal</Link>
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            <Save className="mr-2 size-4" />
                            Save
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
