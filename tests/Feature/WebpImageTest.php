<?php

use App\Models\Brand;
use App\Models\Laptop;
use App\Models\LaptopSource;
use App\Models\LaptopStatus;
use App\Models\Sparepart;
use App\Models\User;
use App\Models\WebsiteSetting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function webpTestUpload(string $name, int $width, int $height, string $format = 'jpeg'): UploadedFile
{
    $path = sys_get_temp_dir().'/'.uniqid('webp-test-', true).'.'.$format;
    $img = imagecreatetruecolor($width, $height);

    if ($format === 'png') {
        imagealphablending($img, false);
        imagesavealpha($img, true);
        $transparent = imagecolorallocatealpha($img, 0, 0, 0, 127);
        imagefill($img, 0, 0, $transparent);
        imagepng($img, $path);
    } else {
        $bg = imagecolorallocate($img, 200, 30, 30);
        imagefill($img, 0, 0, $bg);
        imagejpeg($img, $path, 90);
    }

    imagedestroy($img);

    return new UploadedFile($path, $name, null, null, true);
}

function assertStoredWebp(string $path): void
{
    expect($path)->toEndWith('.webp');

    $bytes = Storage::disk('public')->get($path);

    expect(substr($bytes, 0, 4))->toBe('RIFF')
        ->and(substr($bytes, 8, 4))->toBe('WEBP');
}

function webpTestLaptop(int $userId): Laptop
{
    return Laptop::query()->create([
        'sku' => fake()->unique()->bothify('PBL-########-####'),
        'name' => 'Webp Test Laptop',
        'brand_id' => Brand::query()->firstOrCreate(['slug' => 'lenovo'], ['name' => 'Lenovo', 'is_active' => true, 'sort_order' => 0])->id,
        'model' => 'ThinkPad T14',
        'laptop_source_id' => LaptopSource::query()->firstOrCreate(['slug' => 'trade-in-test'], ['name' => 'Trade In', 'is_active' => true, 'sort_order' => 0])->id,
        'purchase_date' => '2026-06-01',
        'cost_price' => 5500000,
        'selling_price' => 7500000,
        'laptop_status_id' => LaptopStatus::query()->firstOrCreate(['slug' => 'tersedia'], ['name' => 'Tersedia', 'is_active' => true, 'sort_order' => 0])->id,
        'created_by' => $userId,
    ]);
}

test('laptop photo jpg is converted to webp', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'admin']);
    $laptop = webpTestLaptop($admin->id);

    $this->actingAs($admin)
        ->post(route('laptops.photos.store', $laptop), [
            'photo' => webpTestUpload('foto.jpg', 800, 600, 'jpeg'),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $path = $laptop->photos()->latest()->firstOrFail()->file_path;

    assertStoredWebp($path);
});

test('sparepart photo png with transparency is converted to webp', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'admin']);
    $sparepart = Sparepart::query()->create([
        'sku' => fake()->unique()->bothify('SPR-########-####'),
        'name' => 'Webp Test Sparepart',
        'condition' => 'baru',
        'stock' => 5,
        'selling_price' => 200000,
        'is_active' => true,
        'created_by' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->post(route('spareparts.photos.store', $sparepart), [
            'photo' => webpTestUpload('foto.png', 400, 400, 'png'),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $path = $sparepart->photos()->latest()->firstOrFail()->file_path;

    assertStoredWebp($path);
});

test('oversized photo is downscaled to max width', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'admin']);
    $laptop = webpTestLaptop($admin->id);

    $this->actingAs($admin)
        ->post(route('laptops.photos.store', $laptop), [
            'photo' => webpTestUpload('besar.jpg', 2500, 1400, 'jpeg'),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $path = $laptop->photos()->latest()->firstOrFail()->file_path;

    assertStoredWebp($path);

    $size = getimagesizefromstring(Storage::disk('public')->get($path));

    expect($size[0])->toBeLessThanOrEqual(1920);
});

test('website logo is converted to webp and old logo deleted', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->put(route('website-settings.update'), [
            'website_name' => 'Pabalu Laptop',
            'logo' => webpTestUpload('logo.jpg', 500, 200, 'jpeg'),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $first = WebsiteSetting::current()->logo;

    assertStoredWebp($first);

    $this->actingAs($admin)
        ->put(route('website-settings.update'), [
            'website_name' => 'Pabalu Laptop',
            'logo' => webpTestUpload('logo2.jpg', 500, 200, 'jpeg'),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $second = WebsiteSetting::current()->logo;

    expect($second)->not->toBe($first);
    assertStoredWebp($second);
    Storage::disk('public')->assertMissing($first);
});
