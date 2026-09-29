<?php

namespace App\Http\Controllers;

use App\Models\Sparepart;
use App\Models\SparepartType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class PublicSparepartController extends Controller
{
    /**
     * Katalog sparepart: hanya aktif + stok tersedia.
     */
    public function catalog(Request $request): Response
    {
        $selectedTypeSlugs = collect($request->input('types', []))
            ->filter()
            ->values()
            ->all();
        $condition = $request->string('condition')->toString();
        $maxPrice = $request->integer('max_price') ?: null;

        $spareparts = Sparepart::query()
            ->with(['type', 'photos'])
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhereHas('type', fn ($q) => $q->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($selectedTypeSlugs !== [], fn ($query) => $query->whereHas('type', fn ($q) => $q->whereIn('slug', $selectedTypeSlugs)))
            ->when(in_array($condition, Sparepart::conditions(), true), fn ($query) => $query->where('condition', $condition))
            ->when($maxPrice, fn ($query) => $query->where('selling_price', '<=', $maxPrice))
            ->when($request->string('sort')->toString() === 'price_asc', fn ($query) => $query->orderBy('selling_price'))
            ->when($request->string('sort')->toString() === 'price_desc', fn ($query) => $query->orderByDesc('selling_price'))
            ->when(! in_array($request->string('sort')->toString(), ['price_asc', 'price_desc'], true), fn ($query) => $query->latest('id'))
            ->paginate(9)
            ->withQueryString();

        $filterOptions = Cache::remember('catalog.sparepart_filter_options', 600, function (): array {
            $availableTypeIds = Sparepart::query()
                ->where('is_active', true)
                ->where('stock', '>', 0)
                ->whereNotNull('sparepart_type_id')
                ->distinct()
                ->pluck('sparepart_type_id');

            $maxAvailablePrice = Sparepart::query()
                ->where('is_active', true)
                ->where('stock', '>', 0)
                ->max('selling_price');

            return [
                'types' => SparepartType::query()
                    ->whereIn('id', $availableTypeIds)
                    ->orderBy('name')
                    ->get(['id', 'name', 'slug']),
                'conditions' => Sparepart::conditions(),
                'max_price' => (int) ceil((($maxAvailablePrice ?? 1000000) / 100000)) * 100000,
            ];
        });

        return Inertia::render('public/sparepart-catalog', [
            'spareparts' => $spareparts,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'types' => $selectedTypeSlugs,
                'condition' => $condition,
                'max_price' => $maxPrice,
                'sort' => $request->string('sort')->toString() ?: 'newest',
            ],
            'filter_options' => $filterOptions,
        ]);
    }

    /**
     * Detail sparepart by slug (fallback ID dengan redirect 301).
     */
    public function show(string $sparepart): Response|RedirectResponse
    {
        $model = ctype_digit($sparepart)
            ? Sparepart::query()->find($sparepart)
            : Sparepart::query()->where('slug', $sparepart)->first();

        abort_if(! $model, 404);
        abort_unless($model->is_active && $model->stock > 0, 404);

        if (ctype_digit($sparepart) && $model->slug) {
            return to_route('spareparts.public.show', ['sparepart' => $model->slug], 301);
        }

        $model->load(['type', 'photos']);

        $related = Sparepart::query()
            ->with(['type', 'photos'])
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->when($model->sparepart_type_id, fn ($q) => $q->where('sparepart_type_id', $model->sparepart_type_id))
            ->where('id', '!=', $model->id)
            ->latest('id')
            ->take(3)
            ->get();

        return Inertia::render('public/sparepart-detail', [
            'sparepart' => $model,
            'related' => $related,
        ]);
    }
}
