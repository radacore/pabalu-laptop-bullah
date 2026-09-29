import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Inter', {
                    weights: [400, 500, 600, 700],
                }),
                bunny('Outfit', {
                    weights: [400, 500, 600, 700, 800],
                }),
                bunny('Plus Jakarta Sans', {
                    weights: [400, 500, 600, 700, 800],
                }),
                bunny('JetBrains Mono', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    build: {
        // Split vendor libs ke chunk terpisah supaya page code tidak
        // menyertakan seluruh library berat di setiap navigasi. Charts
        // dan icon library (~200KB) hanya di-load kalau halaman butuh.
        rollupOptions: {
            output: {
                manualChunks(id: string) {
                    if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
                        return 'react-vendor';
                    }

                    if (id.includes('node_modules/@inertiajs/')) {
                        return 'inertia';
                    }

                    if (id.includes('node_modules/@phosphor-icons/')) {
                        return 'icons-phosphor';
                    }

                    if (id.includes('node_modules/lucide-react/')) {
                        return 'icons-lucide';
                    }

                    if (id.includes('node_modules/recharts/')) {
                        return 'charts';
                    }

                    return undefined;
                },
            },
        },
    },
});
