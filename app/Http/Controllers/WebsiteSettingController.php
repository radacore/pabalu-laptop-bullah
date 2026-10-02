<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateWebsiteSettingRequest;
use App\Models\WebsiteSetting;
use App\Services\WebpImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteSettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/website-settings', [
            'setting' => WebsiteSetting::current(),
        ]);
    }

    public function update(UpdateWebsiteSettingRequest $request): RedirectResponse
    {
        $setting = WebsiteSetting::current();
        $data = $request->validated();
        unset($data['logo'], $data['remove_logo'], $data['hero_image'], $data['remove_hero_image']);

        if ($request->boolean('remove_logo') && $setting->logo) {
            Storage::disk('public')->delete($setting->logo);
            $data['logo'] = null;
        }

        if ($request->hasFile('logo')) {
            if ($setting->logo) {
                Storage::disk('public')->delete($setting->logo);
            }
            $data['logo'] = WebpImage::store($request->file('logo'), 'website');
        }

        if ($request->boolean('remove_hero_image') && $setting->hero_image) {
            Storage::disk('public')->delete($setting->hero_image);
            $data['hero_image'] = null;
        }

        if ($request->hasFile('hero_image')) {
            if ($setting->hero_image) {
                Storage::disk('public')->delete($setting->hero_image);
            }
            $data['hero_image'] = WebpImage::store($request->file('hero_image'), 'website');
        }

        $data['updated_by'] = Auth::id();
        $setting->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pengaturan website berhasil disimpan.']);

        return back();
    }
}
