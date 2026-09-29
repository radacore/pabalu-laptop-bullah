<?php

use App\Models\User;
use App\Models\WebsiteSetting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('admin can update hero image and seo fields', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->put(route('website-settings.update'), [
        'website_name' => 'Pabalu Laptop',
        'hero_image' => UploadedFile::fake()->image('hero.webp', 1600, 900),
        'meta_title' => 'Pabalu Laptop | Laptop Bekas & Servis Terpercaya',
        'meta_description' => 'Toko laptop bekas berkualitas dan jasa servis terpercaya.',
        'google_site_verification' => 'AbC123XyZ-_456',
    ]);

    $response->assertRedirect()->assertSessionHasNoErrors();

    $this->assertDatabaseHas('website_settings', [
        'id' => 1,
        'meta_title' => 'Pabalu Laptop | Laptop Bekas & Servis Terpercaya',
        'google_site_verification' => 'AbC123XyZ-_456',
    ]);

    expect(WebsiteSetting::current()->hero_image)->not->toBeNull();
});

test('google verification rejects html injection', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this
        ->actingAs($admin)
        ->from(route('website-settings.edit'))
        ->put(route('website-settings.update'), [
            'website_name' => 'Pabalu Laptop',
            'google_site_verification' => '<script>alert(1)</script>',
        ]);

    $response->assertRedirect(route('website-settings.edit'));
    $response->assertSessionHasErrors('google_site_verification');
});

test('browser-style post with method spoof updates settings', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this
        ->actingAs($admin)
        ->post(route('website-settings.update'), [
            '_method' => 'PUT',
            'website_name' => 'Pabalu Laptop Baru',
        ]);

    $response->assertRedirect()->assertSessionHasNoErrors();

    $this->assertDatabaseHas('website_settings', [
        'id' => 1,
        'website_name' => 'Pabalu Laptop Baru',
    ]);
});

test('staff cannot update website settings', function () {
    $staff = User::factory()->create(['role' => 'staff']);

    $this->actingAs($staff)
        ->put(route('website-settings.update'), [
            'website_name' => 'Diubah Staff',
        ])
        ->assertForbidden();
});

test('maps embed rejects non-google url', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this
        ->actingAs($admin)
        ->from(route('website-settings.edit'))
        ->put(route('website-settings.update'), [
            'website_name' => 'Pabalu Laptop',
            'google_maps_embed' => 'javascript:alert(1)',
        ]);

    $response
        ->assertRedirect(route('website-settings.edit'))
        ->assertSessionHasErrors('google_maps_embed');
});

test('sitemap lists public pages and available laptops', function () {
    $response = $this->get('/sitemap.xml');

    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/xml');
    $response->assertSee('/shop', false);
    $response->assertSee('/services/track', false);
});

test('robots allows public and blocks admin areas', function () {
    $response = $this->get('/robots.txt');

    $response->assertOk();
    $response->assertSee('Disallow: /dashboard', false);
    $response->assertSee('/sitemap.xml', false);
});
