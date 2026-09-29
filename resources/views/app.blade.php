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

        {{-- SEO: meta tag dari Pengaturan (WebsiteSetting::current ter-cache) --}}
        @php($seo = \App\Models\WebsiteSetting::current())
        @if ($seo->meta_description)
            <meta name="description" content="{{ $seo->meta_description }}">
        @endif
        @if ($seo->google_site_verification)
            <meta name="google-site-verification" content="{{ $seo->google_site_verification }}">
        @endif
        <link rel="canonical" href="{{ url()->current() }}">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ $seo->website_name }}">
        <meta property="og:url" content="{{ url()->current() }}">
        @if ($seo->meta_description)
            <meta property="og:description" content="{{ $seo->meta_description }}">
        @endif
        <meta name="twitter:card" content="summary_large_image">
        @if ($seo->logo_url)
            <meta property="og:image" content="{{ url($seo->logo_url) }}">
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
            <title>{{ $seo->meta_title ?? config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
