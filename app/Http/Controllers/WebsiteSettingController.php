<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateWebsiteSettingRequest;
use App\Models\WebsiteSetting;
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
        unset($data['logo'], $data['remove_logo']);

        if ($request->boolean('remove_logo') && $setting->logo) {
            Storage::disk('public')->delete($setting->logo);
            $data['logo'] = null;
        }

        if ($request->hasFile('logo')) {
            if ($setting->logo) {
                Storage::disk('public')->delete($setting->logo);
            }
            $data['logo'] = $request->file('logo')->store('website', 'public');
        }

        $data['updated_by'] = Auth::id();
        $setting->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pengaturan website berhasil disimpan.']);

        return back();
    }
}
