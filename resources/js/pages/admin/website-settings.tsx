import { Head, Link, useForm } from '@inertiajs/react';
import {
    Clock,
    FacebookLogo,
    FloppyDisk,
    Globe,
    Image,
    InstagramLogo,
    Link as LinkIcon,
    MapPin,
    PaperPlaneTilt,
    Phone,
    SpinnerGap,
    TiktokLogo,
    Trash,
    WhatsappLogo,
    YoutubeLogo,
} from '@phosphor-icons/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
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

const fieldClass = 'h-10 rounded-lg border-slate-200';
const textareaClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

const inputGroup = 'space-y-2';

function SectionCard({
    icon: Icon,
    title,
    description,
    children,
    className = '',
}: {
    icon: React.ComponentType<{ className?: string; weight?: any }>;
    title: string;
    description: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`rounded-lg border border-slate-200 bg-white ${className}`}>
            <div className="border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Icon className="h-4.5 w-4.5" weight="duotone" />
                    </div>
                    <div>
                        <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
                        <p className="text-xs text-slate-500">{description}</p>
                    </div>
                </div>
            </div>
            <div className="space-y-4 px-6 py-5">{children}</div>
        </div>
    );
}

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

            <form onSubmit={submit} className="mx-auto max-w-7xl space-y-6 p-6">
                <PageHeader
                    title="Pengaturan Website"
                    description="Konfigurasi identitas, kontak, jam buka, dan tautan sosial yang ditampilkan di halaman publik."
                />

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Identitas */}
                    <SectionCard icon={Globe} title="Identitas" description="Nama, tagline, dan logo website.">
                        <div className={inputGroup}>
                            <Label htmlFor="website_name">
                                Nama Website <span className="text-red-500">*</span>
                            </Label>
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

                        <div className={inputGroup}>
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

                        <div className={inputGroup}>
                            <Label>Logo</Label>
                            <div className="flex items-start gap-4">
                                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                                    ) : (
                                        <Image className="h-8 w-8 text-slate-300" weight="duotone" />
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col gap-2">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
                                        onChange={handleLogoChange}
                                        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                                    />
                                    <p className="text-xs text-slate-500">JPG, PNG, SVG, atau WebP. Maks 2MB.</p>
                                    {logoPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveLogo}
                                            className="inline-flex w-fit items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-700"
                                        >
                                            <Trash className="h-3.5 w-3.5" weight="duotone" />
                                            Hapus Logo
                                        </button>
                                    )}
                                </div>
                            </div>
                            <InputError message={form.errors.logo} />
                        </div>
                    </SectionCard>

                    {/* Kontak */}
                    <SectionCard icon={Phone} title="Kontak" description="Alamat workshop, WhatsApp, telepon, dan email.">
                        <div className={inputGroup}>
                            <Label htmlFor="address">Alamat Workshop</Label>
                            <textarea
                                id="address"
                                className={`${textareaClass} min-h-20`}
                                value={form.data.address}
                                onChange={(e) => form.setData('address', e.target.value)}
                                rows={3}
                                placeholder="Jl. Tekno Raya No. 123, Kota Modern"
                                maxLength={1000}
                            />
                            <InputError message={form.errors.address} />
                        </div>

                        <div className={inputGroup}>
                            <Label htmlFor="whatsapp_number" className="flex items-center gap-2">
                                <WhatsappLogo className="h-4 w-4 text-green-600" weight="duotone" />
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
                            <p className="text-xs text-slate-500">
                                Format internasional (awalan 62). Dipakai untuk tombol WhatsApp di halaman publik.
                            </p>
                            <InputError message={form.errors.whatsapp_number} />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className={inputGroup}>
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

                            <div className={inputGroup}>
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <PaperPlaneTilt className="h-4 w-4 text-slate-400" weight="duotone" />
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
                    </SectionCard>

                    {/* Jam Operasional */}
                    <SectionCard icon={Clock} title="Jam Operasional" description="Teks bebas untuk ditampilkan di halaman kontak.">
                        <div className={inputGroup}>
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

                        <div className={inputGroup}>
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
                    </SectionCard>

                    {/* Lokasi */}
                    <SectionCard
                        icon={MapPin}
                        title="Lokasi (Google Maps)"
                        description="Paste URL src dari iframe Google Maps."
                    >
                        <div className={inputGroup}>
                            <Label htmlFor="google_maps_embed">Embed URL</Label>
                            <textarea
                                id="google_maps_embed"
                                className={`${textareaClass} min-h-28 font-mono text-xs`}
                                value={form.data.google_maps_embed}
                                onChange={(e) => form.setData('google_maps_embed', e.target.value)}
                                rows={4}
                                placeholder="https://www.google.com/maps/embed?pb=..."
                                maxLength={2000}
                            />
                            <p className="text-xs text-slate-500">
                                Buka Google Maps → Share → Embed a map → salin URL di atribut <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] font-mono">src</code> dari tag{' '}
                                <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] font-mono">&lt;iframe&gt;</code>.
                            </p>
                            <InputError message={form.errors.google_maps_embed} />
                        </div>

                        {form.data.google_maps_embed && (
                            <div className="overflow-hidden rounded-lg border border-slate-200">
                                <iframe
                                    src={form.data.google_maps_embed}
                                    className="h-56 w-full"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Preview Peta"
                                />
                            </div>
                        )}
                    </SectionCard>

                    {/* Tautan Sosial */}
                    <SectionCard icon={LinkIcon} title="Tautan Sosial" description="URL lengkap (opsional). Kosongkan untuk menyembunyikan.">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className={inputGroup}>
                                <Label htmlFor="facebook_url" className="flex items-center gap-2">
                                    <FacebookLogo className="h-4 w-4 text-blue-600" weight="duotone" />
                                    Facebook
                                </Label>
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
                            <div className={inputGroup}>
                                <Label htmlFor="instagram_url" className="flex items-center gap-2">
                                    <InstagramLogo className="h-4 w-4 text-pink-600" weight="duotone" />
                                    Instagram
                                </Label>
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
                            <div className={inputGroup}>
                                <Label htmlFor="youtube_url" className="flex items-center gap-2">
                                    <YoutubeLogo className="h-4 w-4 text-red-600" weight="duotone" />
                                    YouTube
                                </Label>
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
                            <div className={inputGroup}>
                                <Label htmlFor="tiktok_url" className="flex items-center gap-2">
                                    <TiktokLogo className="h-4 w-4 text-slate-900" weight="duotone" />
                                    TikTok
                                </Label>
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
                    </SectionCard>

                    {/* Footer */}
                    <SectionCard
                        icon={Globe}
                        title="Footer"
                        description="Deskripsi singkat di footer halaman publik."
                        className="lg:col-span-2"
                    >
                        <div className={inputGroup}>
                            <Label htmlFor="footer_description">Deskripsi Footer</Label>
                            <textarea
                                id="footer_description"
                                className={`${textareaClass} min-h-24`}
                                value={form.data.footer_description}
                                onChange={(e) => form.setData('footer_description', e.target.value)}
                                rows={3}
                                placeholder="Pusat laptop bekas berkualitas dan jasa reparasi terpercaya..."
                                maxLength={1000}
                            />
                            <InputError message={form.errors.footer_description} />
                        </div>
                    </SectionCard>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
                    <Button variant="outline" asChild className="rounded-lg border-slate-200">
                        <Link href="/dashboard">Batal</Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.processing}
                        size="lg"
                        className="rounded-lg bg-blue-600 hover:bg-blue-700"
                    >
                        {form.processing ? (
                            <>
                                <SpinnerGap className="h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <FloppyDisk className="h-4 w-4" weight="duotone" />
                                Simpan Pengaturan
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
