<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;

/**
 * Satu pintu konversi upload gambar ke WebP.
 *
 * Semua foto yang di-upload (laptop, sparepart, logo, hero) wajib lewat
 * sini: input JPG/PNG/WebP selalu disimpan ulang sebagai `.webp` di disk
 * lokal. SVG tetap ditolak di level validasi (bisa memuat script).
 */
class WebpImage
{
    /**
     * Kualitas WebP 0-100. 82 = artefak nyaris tak terlihat, ukuran
     * umumnya 60-80% lebih kecil dari JPG sepadan.
     */
    public const QUALITY = 82;

    /**
     * Lebar maksimum output. Gambar lebih besar dikecilkan dulu
     * (tidak pernah di-upscale). 1920 cukup untuk hero full-bleed
     * dan jauh lebih ringan untuk katalog.
     */
    public const MAX_WIDTH = 1920;

    /**
     * Convert upload ke WebP dan simpan di disk lokal.
     *
     * @return string path relatif (mis. `laptops/3/a1b2c3.webp`)
     */
    public static function store(UploadedFile $file, string $directory, string $disk = 'public'): string
    {
        $image = (new ImageManager(new Driver))->decode($file->getRealPath());

        if ($image->width() > self::MAX_WIDTH) {
            $image->scaleDown(width: self::MAX_WIDTH);
        }

        $encoded = $image->encode(new WebpEncoder(quality: self::QUALITY, strip: true));

        $filename = pathinfo($file->hashName(), PATHINFO_FILENAME).'.webp';
        $path = trim($directory, '/').'/'.$filename;

        Storage::disk($disk)->put($path, (string) $encoded);

        return $path;
    }
}
