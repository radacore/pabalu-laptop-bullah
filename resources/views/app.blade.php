<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        {{-- SEO: meta per halaman dari prop `seo` (dibangun App\Support\Seo
             di controller publik) agar crawler non-JS (WhatsApp/Facebook/X/
             Google) melihat title + deskripsi + gambar yang benar TANPA
             SSR. Fallback ke Pengaturan Website bila halaman tidak kirim. --}}
        @php($seoSite = \App\Models\WebsiteSetting::current())
        @php($pageSeo = $page['props']['seo'] ?? [])
        @php($seoTitle = $pageSeo['title'] ?? $seoSite->meta_title ?? config('app.name', 'Laravel'))
        @php($seoDescription = $pageSeo['description'] ?? $seoSite->meta_description)
        @php($seoImage = $pageSeo['image'] ?? ($seoSite->logo_url ? url($seoSite->logo_url) : null))
        @if ($seoDescription)
            <meta name="description" content="{{ $seoDescription }}">
        @endif
        @if ($seoSite->google_site_verification)
            <meta name="google-site-verification" content="{{ $seoSite->google_site_verification }}">
        @endif
        @if (! empty($pageSeo['robots']))
            <meta name="robots" content="{{ $pageSeo['robots'] }}">
        @endif
        <link rel="canonical" href="{{ url()->current() }}">
        <meta property="og:type" content="{{ $pageSeo['og_type'] ?? 'website' }}">
        <meta property="og:site_name" content="{{ $seoSite->website_name }}">
        <meta property="og:title" content="{{ $seoTitle }}">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:locale" content="id_ID">
        @if ($seoDescription)
            <meta property="og:description" content="{{ $seoDescription }}">
        @endif
        @if ($seoImage)
            <meta property="og:image" content="{{ $seoImage }}">
        @endif
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $seoTitle }}">
        @if ($seoDescription)
            <meta name="twitter:description" content="{{ $seoDescription }}">
        @endif
        @if ($seoImage)
            <meta name="twitter:image" content="{{ $seoImage }}">
        @endif
        @if (! empty($pageSeo['json_ld']))
            @php($seoJsonLd = json_encode($pageSeo['json_ld'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE))
            @if (is_string($seoJsonLd))
                <script type="application/ld+json">{!! str_replace('</', '<\/', $seoJsonLd) !!}</script>
            @endif
        @endif

        {{-- Bunny Fonts (Inter, Outfit, Plus Jakarta Sans, JetBrains Mono) --}}
        @fonts

        {{-- Material Symbols hanya load untuk admin panel. Halaman publik pakai
             Phosphor + Lucide icon lewat React import. --}}
        @auth
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        @endauth

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ $seoTitle }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
