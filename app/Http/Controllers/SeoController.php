<?php

namespace App\Http\Controllers;

use App\Models\Laptop;
use App\Models\LaptopStatus;
use App\Models\Sparepart;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    /**
     * robots.txt dinamis: host + sitemap selalu benar di tiap environment,
     * area admin/login tidak boleh diindeks.
     */
    public function robots(): Response
    {
        $base = rtrim(config('app.url'), '/');

        $content = implode("\n", [
            'User-agent: *',
            'Allow: /',
            'Disallow: /dashboard',
            'Disallow: /login',
            'Disallow: /search',
            '',
            "Sitemap: {$base}/sitemap.xml",
            '',
        ]);

        return response($content, 200, ['Content-Type' => 'text/plain']);
    }

    /**
     * sitemap.xml: halaman publik + unit laptop yang tersedia.
     */
    public function sitemap(): Response
    {
        $base = rtrim(config('app.url'), '/');

        $urls = [
            $this->url($base.'/', now()->toDateString(), 'daily', '1.0'),
            $this->url($base.'/shop', now()->toDateString(), 'daily', '0.9'),
            $this->url($base.'/sewa', now()->toDateString(), 'daily', '0.9'),
            $this->url($base.'/sparepart', now()->toDateString(), 'daily', '0.9'),
            $this->url($base.'/services/track', now()->toDateString(), 'monthly', '0.5'),
            $this->url($base.'/rentals/track', now()->toDateString(), 'monthly', '0.5'),
        ];

        $tersediaId = LaptopStatus::query()->where('slug', 'tersedia')->value('id');

        $laptops = Laptop::query()
            ->when($tersediaId, fn ($q) => $q->where('laptop_status_id', $tersediaId))
            ->orderByDesc('updated_at')
            ->get(['id', 'slug', 'is_rentable', 'updated_at']);

        foreach ($laptops as $laptop) {
            $urls[] = $this->url(
                $base.'/shop/'.($laptop->slug ?: $laptop->id),
                $laptop->updated_at?->toDateString() ?? now()->toDateString(),
                'weekly',
                '0.8',
            );

            if ($laptop->is_rentable) {
                $urls[] = $this->url(
                    $base.'/sewa/'.($laptop->slug ?: $laptop->id),
                    $laptop->updated_at?->toDateString() ?? now()->toDateString(),
                    'weekly',
                    '0.8',
                );
            }
        }

        $spareparts = Sparepart::query()
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->orderByDesc('updated_at')
            ->get(['id', 'slug', 'updated_at']);

        foreach ($spareparts as $sparepart) {
            $urls[] = $this->url(
                $base.'/sparepart/'.($sparepart->slug ?: $sparepart->id),
                $sparepart->updated_at?->toDateString() ?? now()->toDateString(),
                'weekly',
                '0.8',
            );
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n"
            .implode("\n", $urls)."\n"
            .'</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    private function url(string $loc, string $lastmod, string $changefreq, string $priority): string
    {
        $loc = htmlspecialchars($loc, ENT_XML1);

        return "  <url>\n    <loc>{$loc}</loc>\n    <lastmod>{$lastmod}</lastmod>\n    <changefreq>{$changefreq}</changefreq>\n    <priority>{$priority}</priority>\n  </url>";
    }
}
