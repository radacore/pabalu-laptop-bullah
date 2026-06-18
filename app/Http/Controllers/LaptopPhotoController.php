<?php

namespace App\Http\Controllers;

use App\Models\Laptop;
use App\Models\LaptopPhoto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LaptopPhotoController extends Controller
{
    /**
     * Store a photo for the selected laptop.
     */
    public function store(Request $request, Laptop $laptop): RedirectResponse
    {
        $validated = $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
            'caption' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $path = $request->file('photo')->store("laptops/{$laptop->id}", 'public');

        $laptop->photos()->create([
            'file_path' => $path,
            'caption' => $validated['caption'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Foto laptop berhasil diunggah.']);

        return back();
    }

    /**
     * Delete the selected laptop photo.
     */
    public function destroy(Laptop $laptop, LaptopPhoto $photo): RedirectResponse
    {
        abort_unless($photo->laptop_id === $laptop->id, 404);

        Storage::disk('public')->delete($photo->file_path);
        $photo->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Foto laptop berhasil dihapus.']);

        return back();
    }
}
