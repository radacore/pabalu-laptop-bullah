<?php

namespace App\Http\Controllers;

use App\Models\Sparepart;
use App\Models\SparepartPhoto;
use App\Services\WebpImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SparepartPhotoController extends Controller
{
    /**
     * Store a photo for the selected sparepart.
     */
    public function store(Request $request, Sparepart $sparepart): RedirectResponse
    {
        $validated = $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
            'caption' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $path = WebpImage::store($request->file('photo'), "spareparts/{$sparepart->id}");

        $sparepart->photos()->create([
            'file_path' => $path,
            'caption' => $validated['caption'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Foto sparepart berhasil diunggah.']);

        return back();
    }

    /**
     * Delete the selected sparepart photo.
     */
    public function destroy(Sparepart $sparepart, SparepartPhoto $photo): RedirectResponse
    {
        abort_unless($photo->sparepart_id === $sparepart->id, 404);

        Storage::disk('public')->delete($photo->file_path);
        $photo->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Foto sparepart berhasil dihapus.']);

        return back();
    }
}
