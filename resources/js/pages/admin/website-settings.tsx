import { Head, Link, useForm } from '@inertiajs/react';
import {
    Building2,
    Clock,
    Globe,
    ImageIcon,
    Loader2,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Save,
    Share2,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/layout/page-header';
import { edit as websiteSettingsEdit, update as websiteSettingsUpdate } from '@/routes/website-settings';
import type { BreadcrumbItem, WebsiteSetting } from '@/types';

interface Props {
    setting: WebsiteSetting;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pengaturan Website', href: websiteSettingsEdit().url },
];

const fieldClass = 'h-10 rounded-lg';
const textareaClass =
    'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]';

export default function WebsiteSettings({ setting }: Props) {
    const [logoPreview, setLogoPreview] = useState<string | null>(setting.logo_url ?? null);
    const [removeLogo, setRemoveLogo] = useState(false);

    const form = useForm({
        website_name: setting.website_name ?? '',
        tagline: setting.tagline ?? '',
        logo: null as File | null,
        address: setting.address ?? '',
        whatsapp_number: setting.whatsapp_number ?? '',
        phone: setting.phone ?? '',
        email: setting.email ?? '',
        operational_hours_weekday: setting.operational_hours_weekday ?? '',
        operational_hours_weekend: setting.operational_hours_weekend ?? '',
        google_maps_embed: setting.google_maps_embed ?? '',
        footer_description: setting.footer_description ?? '',
        facebook_url: setting.facebook_url ?? '',
        instagram_url: setting.instagram_url ?? '',
        youtube_url: setting.youtube_url ?? '',
        tiktok_url: setting.tiktok_url ?? '',
        remove_logo: false as boolean,
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post(websiteSettingsUpdate().url, {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        form.setData('logo', file);
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
            setRemoveLogo(false);
            form.setData('remove_logo', false);
        }
    }

    function handleRemoveLogo() {
        setLogoPreview(null);
        setRemoveLogo(true);
        form.setData('logo', null);
        form.setData('remove_logo', true);
    }

    return (
        <>
            <Head title="Pengaturan Website" />

            <form onSubmit={submit} className="flex h-full flex-1 flex-col gap-6 p-4">
                <PageHeader
                    title="Pengaturan Website"
                    description="Konfigurasi identitas, kontak, jam buka, dan tautan sosial yang ditampilkan di halaman publik."
                />

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-secondary" />
                                Identitas
                            </CardTitle>
                            <CardDescription>Nama, tagline, dan logo website.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="website_name">Nama Website <span className="text-error">*</span></Label>
                                <Input
                                    id="website_name"
                                    className={fieldClass}
                                    value={form.data.website_name}
                                    onChange={(e) => form.setData('website_name', e.target.value)}
                                    required
                                    maxLength={120}
                                />
                                <InputError message={form.errors.website_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tagline">Tagline</Label>
                                <Input
                                    id="tagline"
                                    className={fieldClass}
                                    value={form.data.tagline}
                                    onChange={(e) => form.setData('tagline', e.target.value)}
                                    placeholder="Solusi Terpercaya untuk Laptop Anda"
                                    maxLength={255}
                                />
                                <InputError message={form.errors.tagline} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Logo</Label>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-on-surface-variant/40" />
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col gap-2">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
                                            onChange={handleLogoChange}
                                            className="block w-full text-sm text-on-surface-variant file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-secondary hover:file:bg-on-secondary-fixed-variant"
                                        />
                                        <p className="text-xs text-on-surface-variant">JPG, PNG, SVG, atau WebP. Maks 2MB.</p>
                                        {logoPreview && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRemoveLogo}
                                                className="w-fit"
                                            >
                                                <Trash2 className="h-4 w-4" /> Hapus Logo
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <InputError message={form.errors.logo} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5 text-secondary" />
                                Kontak
                            </CardTitle>
                            <CardDescription>Alamat workshop, WhatsApp, telepon, dan email.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="address">Alamat Workshop</Label>
                                <textarea
                                    id="address"
                                    className={textareaClass + ' min-h-20'}
                                    value={form.data.address}
                                    onChange={(e) => form.setData('address', e.target.value)}
                                    rows={3}
                                    placeholder="Jl. Tekno Raya No. 123, Kota Modern"
                                    maxLength={1000}
                                />
                                <InputError message={form.errors.address} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="whatsapp_number" className="flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                                    Nomor WhatsApp
                                </Label>
                                <Input
                                    id="whatsapp_number"
                                    className={fieldClass}
                                    value={form.data.whatsapp_number}
                                    onChange={(e) => form.setData('whatsapp_number', e.target.value)}
                                    placeholder="6281234567890"
                                    maxLength={32}
                                />
                                <p className="text-xs text-on-surface-variant">Format internasional (awalan 62). Dipakai untuk tombol WhatsApp di halaman publik.</p>
                                <InputError message={form.errors.whatsapp_number} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">No. Telepon</Label>
                                    <Input
                                        id="phone"
                                        className={fieldClass}
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        placeholder="(021) 555-0123"
                                        maxLength={32}
                                    />
                                    <InputError message={form.errors.phone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className={fieldClass}
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        placeholder="halo@contoh.id"
                                        maxLength={255}
                                    />
                                    <InputError message={form.errors.email} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-secondary" />
                                Jam Operasional
                            </CardTitle>
                            <CardDescription>Teks bebas untuk ditampilkan di halaman kontak.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="operational_hours_weekday">Hari Kerja</Label>
                                <Input
                                    id="operational_hours_weekday"
                                    className={fieldClass}
                                    value={form.data.operational_hours_weekday}
                                    onChange={(e) => form.setData('operational_hours_weekday', e.target.value)}
                                    placeholder="Senin - Jumat: 09:00 - 18:00"
                                    maxLength={120}
                                />
                                <InputError message={form.errors.operational_hours_weekday} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="operational_hours_weekend">Akhir Pekan</Label>
                                <Input
                                    id="operational_hours_weekend"
                                    className={fieldClass}
                                    value={form.data.operational_hours_weekend}
                                    onChange={(e) => form.setData('operational_hours_weekend', e.target.value)}
                                    placeholder="Sabtu: 10:00 - 16:00 (Minggu Tutup)"
                                    maxLength={120}
                                />
                                <InputError message={form.errors.operational_hours_weekend} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-secondary" />
                                Lokasi (Google Maps)
                            </CardTitle>
                            <CardDescription>Paste URL <code>src</code> dari iframe Google Maps.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="google_maps_embed">Embed URL</Label>
                                <textarea
                                    id="google_maps_embed"
                                    className={textareaClass + ' min-h-28 font-mono text-xs'}
                                    value={form.data.google_maps_embed}
                                    onChange={(e) => form.setData('google_maps_embed', e.target.value)}
                                    rows={4}
                                    placeholder="https://www.google.com/maps/embed?pb=..."
                                    maxLength={2000}
                                />
                                <p className="text-xs text-on-surface-variant">Buka Google Maps → Share → Embed a map → salin URL di atribut <code>src</code> dari tag <code>&lt;iframe&gt;</code>.</p>
                                <InputError message={form.errors.google_maps_embed} />
                            </div>

                            {form.data.google_maps_embed && (
                                <div className="overflow-hidden rounded-lg border border-outline-variant">
                                    <iframe
                                        src={form.data.google_maps_embed}
                                        className="h-56 w-full"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Preview Peta"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Share2 className="h-5 w-5 text-secondary" />
                                Tautan Sosial
                            </CardTitle>
                            <CardDescription>URL lengkap (opsional). Kosongkan untuk menyembunyikan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="facebook_url">Facebook</Label>
                                    <Input
                                        id="facebook_url"
                                        type="url"
                                        className={fieldClass}
                                        value={form.data.facebook_url}
                                        onChange={(e) => form.setData('facebook_url', e.target.value)}
                                        placeholder="https://facebook.com/..."
                                        maxLength={255}
                                    />
                                    <InputError message={form.errors.facebook_url} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="instagram_url">Instagram</Label>
                                    <Input
                                        id="instagram_url"
                                        type="url"
                                        className={fieldClass}
                                        value={form.data.instagram_url}
                                        onChange={(e) => form.setData('instagram_url', e.target.value)}
                                        placeholder="https://instagram.com/..."
                                        maxLength={255}
                                    />
                                    <InputError message={form.errors.instagram_url} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="youtube_url">YouTube</Label>
                                    <Input
                                        id="youtube_url"
                                        type="url"
                                        className={fieldClass}
                                        value={form.data.youtube_url}
                                        onChange={(e) => form.setData('youtube_url', e.target.value)}
                                        placeholder="https://youtube.com/@..."
                                        maxLength={255}
                                    />
                                    <InputError message={form.errors.youtube_url} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tiktok_url">TikTok</Label>
                                    <Input
                                        id="tiktok_url"
                                        type="url"
                                        className={fieldClass}
                                        value={form.data.tiktok_url}
                                        onChange={(e) => form.setData('tiktok_url', e.target.value)}
                                        placeholder="https://tiktok.com/@..."
                                        maxLength={255}
                                    />
                                    <InputError message={form.errors.tiktok_url} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-secondary" />
                                Footer
                            </CardTitle>
                            <CardDescription>Deskripsi singkat di footer halaman publik.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2">
                                <Label htmlFor="footer_description">Deskripsi Footer</Label>
                                <textarea
                                    id="footer_description"
                                    className={textareaClass + ' min-h-24'}
                                    value={form.data.footer_description}
                                    onChange={(e) => form.setData('footer_description', e.target.value)}
                                    rows={3}
                                    placeholder="Pusat laptop bekas berkualitas dan jasa reparasi terpercaya..."
                                    maxLength={1000}
                                />
                                <InputError message={form.errors.footer_description} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">Batal</Link>
                    </Button>
                    <Button type="submit" disabled={form.processing} size="lg">
                        {form.processing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" /> Simpan Pengaturan
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </>
    );
}

WebsiteSettings.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
