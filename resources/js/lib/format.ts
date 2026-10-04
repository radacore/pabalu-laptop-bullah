/**
 * Formatter mata uang & harga — modul murni tanpa data mock.
 *
 * Dipisah dari mock-commerce.ts agar halaman yang hanya butuh format
 * tidak ikut membundel generator data palsu.
 */

export const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

export function formatCurrency(value: number | string | null | undefined) {
    return currencyFormatter.format(Number(value ?? 0));
}

/**
 * Seperti formatCurrency, tapi tampilkan '-' untuk nilai kosong/nol.
 * Dipakai di tabel yang menganggap 0 = belum ada data.
 */
export function formatCurrencyOrDash(
    value: number | string | null | undefined,
) {
    const amount = Number(value ?? 0);

    if (!amount) {
        return '-';
    }

    return currencyFormatter.format(amount);
}

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
});

const datetimeFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

/**
 * Format tanggal gaya admin: "3 Okt 2026". '-' bila kosong.
 */
export function formatTanggal(value: string | null | undefined) {
    if (!value) {
        return '-';
    }

    return dateFormatter.format(new Date(value));
}

/**
 * Format tanggal + jam gaya admin. '-' bila kosong.
 */
export function formatTanggalWaktu(value: string | null | undefined) {
    if (!value) {
        return '-';
    }

    return datetimeFormatter.format(new Date(value));
}

/**
 * Short price format untuk card compact: "Rp 19,9jt", "Rp 850rb".
 */
export function formatShortPrice(value: number | string | null | undefined) {
    const price = Number(value ?? 0);

    if (price >= 1_000_000) {
        const jt = price / 1_000_000;

        return `Rp ${jt.toFixed(jt >= 10 ? 1 : 2).replace(/\.?0+$/, '')}jt`;
    }

    if (price >= 1000) {
        return `Rp ${Math.round(price / 1000)}rb`;
    }

    return formatCurrency(price);
}

/**
 * Format sold count ala marketplace: "15+", "1rb+", "10rb+" untuk visual density.
 */
export function formatSoldCount(count: number): string {
    if (count >= 10000) {
        return `${Math.floor(count / 1000)}rb+`;
    }

    if (count >= 1000) {
        return `${(count / 1000).toFixed(1).replace('.0', '')}rb+`;
    }

    if (count >= 50) {
        return `${Math.floor(count / 10) * 10}+`;
    }

    return `${count}+`;
}
