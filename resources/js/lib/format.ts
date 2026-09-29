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
