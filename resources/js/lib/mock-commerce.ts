/**
 * Mock e-commerce data — deterministic dari laptop ID.
 *
 * KENAPA MOCK: field rating, sold count, discount belum ada di schema.
 * Bikin mock deterministic (bukan random) supaya value konsisten antar
 * render dan antar halaman (tidak flicker saat user navigasi).
 *
 * Kalau nanti mau real: replace dengan field DB + resource layer.
 */

const CITIES = [
    'Kota Makassar',
    'Jakarta Pusat',
    'Bandung',
    'Surabaya',
    'Yogyakarta',
    'Medan',
];

export type MockCommerce = {
    rating: number;
    reviewCount: number;
    soldCount: number;
    discountPct: number;
    location: string;
    isFlashSale: boolean;
};

export function mockCommerce(id: number | null | undefined): MockCommerce {
    const seed = Number(id ?? 1);

    const rating = Number((3.8 + ((seed * 13) % 12) / 10).toFixed(1));
    const soldCount = ((seed * 37) % 80) + 15;
    const reviewCount = soldCount + Math.floor(soldCount * 0.4);
    const discountPct = seed % 3 === 0 ? 5 + ((seed * 7) % 15) : 0;
    const location = CITIES[seed % CITIES.length];
    const isFlashSale = seed % 5 === 0;

    return {
        rating,
        reviewCount,
        soldCount,
        discountPct,
        location,
        isFlashSale,
    };
}

/**
 * Hitung harga asli sebelum diskon dari sellingPrice + discountPct.
 * Return null kalau tidak ada diskon.
 */
export function originalPrice(
    sellingPrice: number | string | null | undefined,
    discountPct: number,
): number | null {
    if (discountPct <= 0) {
        return null;
    }

    const price = Number(sellingPrice ?? 0);

    if (price <= 0) {
        return null;
    }

    return Math.round(price / (1 - discountPct / 100));
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
