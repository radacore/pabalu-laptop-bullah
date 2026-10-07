import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    testMatch: '**/*.spec.js',
    timeout: 60_000,
    expect: { timeout: 10_000 },
    fullyParallel: false,
    workers: 1,
    // Retry 1x: dev server (artisan serve single-thread + vite) kadang
    // timeout di bawah beban — retry menyerap flake lingkungan, bukan
    // menutupi bug (test-nya sendiri deterministik).
    retries: 1,
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000',
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        viewport: { width: 1366, height: 768 },
    },
    projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
    outputDir: './test-results',
});
