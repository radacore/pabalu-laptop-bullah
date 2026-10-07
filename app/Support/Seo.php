<?php

namespace App\Support;

use App\Models\Laptop;
use App\Models\Sparepart;
use App\Models\WebsiteSetting;
use Illuminate\Support\Str;

/**
 * Pembangun prop `seo` untuk halaman publik.
 *
 * Setiap controller publik mengirim `['seo' => Seo::...()]` ke
 * Inertia::render. `resources/views/app.blade.php` membaca prop ini
 * langsung dari `$page['props']['seo']` sehingga crawler non-JS
 * (WhatsApp/Facebook/X/Google) melihat title + deskripsi + gambar
 * yang benar TANPA perlu SSR.
 *
 * `resources/js/components/public-layout.tsx` (PublicPage) membaca
 * `seo.title` lewat usePage agar document.title hasil hidrasi sama
 * persis dengan title server (tidak ada flicker). Meta/OG/JSON-LD
 * sengaja HANYA di-render blade — kalau di-render ulang lewat
 * <Head> akan jadi tag ganda setelah hidrasi.
 *
 * Bentuk array: title, description, image (URL absolut), robots
 * (null = indexable), og_type, json_ld (siap json_encode, digabung
 * dalam satu script @graph oleh blade).
 */
class Seo
{
    public static function site(): WebsiteSetting
    {
        return WebsiteSetting::current();
    }

    /**
     * @param  array<int, array<string, mixed>>  $nodes
     */
    public static function page(
        string $title,
        ?string $description = null,
        ?string $image = null,
        ?string $robots = null,
        string $ogType = 'website',
        array $nodes = [],
    ): array {
        $seo = [
            'title' => $title,
            'description' => $description,
            'image' => $image,
            'robots' => $robots,
            'og_type' => $ogType,
        ];

        if ($nodes !== []) {
            $seo['json_ld'] = [
                '@context' => 'https://schema.org',
                '@graph' => array_values($nodes),
            ];
        }

        return $seo;
    }

    public static function absoluteImage(?string $path): ?string
    {
        if (! is_string($path) || trim($path) === '') {
            return null;
        }

        $path = trim($path);

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, '//')) {
            return $path;
        }

        return url('/'.ltrim($path, '/'));
    }

    public static function rupiah(int|float|string|null $amount): string
    {
        return 'Rp '.number_format((float) ($amount ?? 0), 0, ',', '.');
    }

    public static function excerpt(?string $text, int $limit = 160): ?string
    {
        if (! is_string($text)) {
            return null;
        }

        $clean = trim(preg_replace('/\s+/', ' ', strip_tags($text)) ?? '');

        if ($clean === '') {
            return null;
        }

        return Str::limit($clean, $limit);
    }

    public static function laptopName(Laptop $laptop): string
    {
        $name = trim((string) ($laptop->name ?? ''));

        if ($name !== '') {
            return $name;
        }

        $branded = trim(trim((string) ($laptop->brand?->name ?? '')).' '.trim((string) ($laptop->model ?? '')));

        if ($branded !== '') {
            return $branded;
        }

        return (string) ($laptop->sku ?: 'Laptop');
    }

    // ─── Halaman statis ───

    public static function home(): array
    {
        $site = static::site();
        $title = "{$site->website_name} | Laptop & Servis Terpercaya";
        $description = $site->meta_description
            ?: "{$site->website_name} — jual laptop berkualitas, sewa laptop harian, sparepart, dan servis profesional.";
        $image = static::absoluteImage($site->hero_image_url)
            ?? static::absoluteImage($site->logo_url);

        return static::page(
            $title,
            static::excerpt($description),
            $image,
            null,
            'website',
            [static::storeNode($site, $description, $image)],
        );
    }

    public static function laptopCatalog(): array
    {
        $site = static::site();

        return static::page(
            "Katalog Laptop - {$site->website_name}",
            static::excerpt("Jual laptop berkualitas di {$site->website_name} — stok tersedia, harga transparan, garansi toko. Pesan mudah via WhatsApp."),
        );
    }

    public static function rentalCatalog(): array
    {
        $site = static::site();

        return static::page(
            "Sewa Laptop - {$site->website_name}",
            static::excerpt("Sewa laptop harian di {$site->website_name} — unit siap pakai untuk kerja, event, dan kebutuhan sementara. Pesan mudah via WhatsApp."),
        );
    }

    public static function sparepartCatalog(): array
    {
        $site = static::site();

        return static::page(
            "Sparepart - {$site->website_name}",
            static::excerpt("Katalog sparepart laptop di {$site->website_name} — baterai, layar, charger, dan komponen original. Stok tersedia, pesan via WhatsApp."),
        );
    }

    public static function serviceTrackLanding(): array
    {
        $site = static::site();

        return static::page(
            "Cek Status Servis - {$site->website_name}",
            static::excerpt("Lacak progres servis laptop Anda di {$site->website_name} — masukkan kode tiket untuk melihat status pengerjaan dan estimasi selesai."),
        );
    }

    public static function rentalTrackLanding(): array
    {
        $site = static::site();

        return static::page(
            "Lacak Sewa - {$site->website_name}",
            static::excerpt("Cek status penyewaan laptop Anda di {$site->website_name} — masukkan kode sewa untuk melihat status unit dan jatuh tempo."),
        );
    }

    /**
     * Halaman hasil tracking berisi data tiket milik pelanggan —
     * tidak boleh diindeks mesin pencari.
     */
    public static function trackingResult(string $label): array
    {
        $site = static::site();

        return static::page(
            "{$label} - {$site->website_name}",
            'Halaman status tiket pelanggan.',
            null,
            'noindex, nofollow',
        );
    }

    // ─── Halaman detail ───

    public static function laptopDetail(Laptop $laptop): array
    {
        $site = static::site();
        $name = static::laptopName($laptop);
        $spec = $laptop->specification;

        $specParts = array_values(array_filter([
            $spec?->ram ? "RAM {$spec->ram}" : null,
            $spec?->storage ? "Storage {$spec->storage}" : null,
            $spec?->processor,
        ]));

        $specText = $specParts !== [] ? implode(', ', $specParts).'. ' : '';
        $description = static::excerpt(
            "{$name} — {$specText}Harga ".static::rupiah($laptop->selling_price).". Tersedia di {$site->website_name}."
        );

        $brandName = $laptop->brand?->name;
        $image = static::absoluteImage(
            $laptop->photos?->firstWhere('file_path')?->file_path
                ? 'storage/'.ltrim((string) $laptop->photos->firstWhere('file_path')->file_path, '/')
                : null
        );

        $offer = [
            '@type' => 'Offer',
            'url' => url()->current(),
            'priceCurrency' => 'IDR',
            'price' => (float) $laptop->selling_price,
            'availability' => 'https://schema.org/InStock',
        ];

        $product = [
            '@type' => 'Product',
            'name' => $name,
            'description' => $description,
            'offers' => $offer,
        ];

        if ($brandName) {
            $product['brand'] = ['@type' => 'Brand', 'name' => $brandName];
        }

        if ($image) {
            $product['image'] = [$image];
        }

        return static::page(
            "{$name} - {$site->website_name}",
            $description,
            $image,
            null,
            'product',
            [$product, static::breadcrumbNode([
                ['Beranda', url('/')],
                ['Katalog Laptop', url('/shop')],
                [$name, null],
            ])],
        );
    }

    public static function rentalDetail(Laptop $laptop): array
    {
        $site = static::site();
        $name = static::laptopName($laptop);
        $spec = $laptop->specification;

        $specParts = array_values(array_filter([
            $spec?->ram ? "RAM {$spec->ram}" : null,
            $spec?->storage ? "Storage {$spec->storage}" : null,
        ]));

        $specText = $specParts !== [] ? implode(', ', $specParts).'. ' : '';
        $description = static::excerpt(
            "Sewa {$name} — {$specText}Tarif ".static::rupiah($laptop->daily_rate)."/hari di {$site->website_name}."
        );

        $image = static::absoluteImage(
            $laptop->photos?->firstWhere('file_path')?->file_path
                ? 'storage/'.ltrim((string) $laptop->photos->firstWhere('file_path')->file_path, '/')
                : null
        );

        $product = [
            '@type' => 'Product',
            'name' => "{$name} (Sewa)",
            'description' => $description,
        ];

        if ($laptop->brand?->name) {
            $product['brand'] = ['@type' => 'Brand', 'name' => $laptop->brand->name];
        }

        if ($image) {
            $product['image'] = [$image];
        }

        return static::page(
            "{$name} (Sewa) - {$site->website_name}",
            $description,
            $image,
            null,
            'website',
            [$product, static::breadcrumbNode([
                ['Beranda', url('/')],
                ['Sewa Laptop', url('/sewa')],
                [$name, null],
            ])],
        );
    }

    public static function sparepartDetail(Sparepart $sparepart): array
    {
        $site = static::site();
        $typeName = $sparepart->type?->name;
        $conditionLabel = $sparepart->condition === 'baru' ? 'Baru' : 'Bekas';

        $typeText = $typeName ? " ({$typeName}, kondisi {$conditionLabel})" : '';
        $description = static::excerpt(
            "{$sparepart->name}{$typeText} — ".static::rupiah($sparepart->selling_price).". Stok tersedia di {$site->website_name}."
        );

        $firstPhoto = $sparepart->photos?->firstWhere('file_path');
        $image = static::absoluteImage(
            $firstPhoto?->file_path
                ? 'storage/'.ltrim((string) $firstPhoto->file_path, '/')
                : null
        );

        $product = [
            '@type' => 'Product',
            'name' => $sparepart->name,
            'description' => $description,
            'offers' => [
                '@type' => 'Offer',
                'url' => url()->current(),
                'priceCurrency' => 'IDR',
                'price' => (float) $sparepart->selling_price,
                'availability' => 'https://schema.org/InStock',
                'itemCondition' => $sparepart->condition === 'baru'
                    ? 'https://schema.org/NewCondition'
                    : 'https://schema.org/UsedCondition',
            ],
        ];

        if ($typeName) {
            $product['category'] = $typeName;
        }

        if ($image) {
            $product['image'] = [$image];
        }

        return static::page(
            "{$sparepart->name} - {$site->website_name}",
            $description,
            $image,
            null,
            'product',
            [$product, static::breadcrumbNode([
                ['Beranda', url('/')],
                ['Sparepart', url('/sparepart')],
                [$sparepart->name, null],
            ])],
        );
    }

    // ─── Node JSON-LD ───

    /**
     * @param  array<int, array{0: string, 1: ?string}>  $crumbs
     */
    private static function breadcrumbNode(array $crumbs): array
    {
        $items = [];

        foreach ($crumbs as $index => [$name, $itemUrl]) {
            $item = [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $name,
            ];

            if ($itemUrl) {
                $item['item'] = $itemUrl;
            }

            $items[] = $item;
        }

        return [
            '@type' => 'BreadcrumbList',
            'itemListElement' => $items,
        ];
    }

    private static function storeNode(WebsiteSetting $site, ?string $description, ?string $image): array
    {
        $store = [
            '@type' => 'Store',
            'name' => $site->website_name,
            'url' => rtrim(config('app.url'), '/').'/',
        ];

        if ($description) {
            $store['description'] = $description;
        }

        if ($image) {
            $store['image'] = $image;
        }

        $phone = $site->phone ?: $site->whatsapp_number;

        if ($phone) {
            $store['telephone'] = $phone;
        }

        if ($site->email) {
            $store['email'] = $site->email;
        }

        if ($site->address) {
            $store['address'] = [
                '@type' => 'PostalAddress',
                'streetAddress' => $site->address,
            ];
        }

        return $store;
    }
}
