<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStaffRequest;
use App\Http\Requests\UpdateStaffRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Kelola akun internal (admin/staff) — admin only via route middleware.
 *
 * Role customer TIDAK dikelola di sini (itu akun portal publik, bukan
 * tim internal). Registrasi publik disabled (lihat config/fortify.php),
 * jadi controller ini satu-satunya jalur pembuatan akun tim.
 */
class StaffController extends Controller
{
    /**
     * Display a paginated staff listing.
     */
    public function index(Request $request): Response
    {
        $users = User::query()
            ->whereIn('role', ['admin', 'staff'])
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('staff/index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the staff creation page.
     */
    public function create(): Response
    {
        return Inertia::render('staff/create');
    }

    /**
     * Store a newly created staff account.
     */
    public function store(StoreStaffRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $user = new User;
        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
        ]);
        // role/is_active tidak fillable — assignment eksplisit.
        $user->role = $data['role'];
        $user->is_active = true;
        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Akun tim berhasil dibuat.']);

        return to_route('staff.index');
    }

    /**
     * Show the staff edit page.
     */
    public function edit(User $staff): Response
    {
        abort_unless(in_array($staff->role, ['admin', 'staff'], true), 404);

        return Inertia::render('staff/edit', [
            'staffUser' => $staff,
        ]);
    }

    /**
     * Update the selected staff account.
     */
    public function update(UpdateStaffRequest $request, User $staff): RedirectResponse
    {
        abort_unless(in_array($staff->role, ['admin', 'staff'], true), 404);

        $data = $request->validated();

        // Admin tidak boleh menonaktifkan/menurunkan dirinya sendiri —
        // mencegah lockout total dari panel admin.
        if ($staff->id === Auth::id()) {
            if (! $data['is_active']) {
                Inertia::flash('toast', ['type' => 'error', 'message' => 'Anda tidak bisa menonaktifkan akun sendiri.']);

                return back()->withErrors([
                    'is_active' => 'Anda tidak bisa menonaktifkan akun sendiri.',
                ]);
            }

            if ($data['role'] !== 'admin') {
                Inertia::flash('toast', ['type' => 'error', 'message' => 'Anda tidak bisa menurunkan role akun sendiri.']);

                return back()->withErrors([
                    'role' => 'Anda tidak bisa menurunkan role akun sendiri.',
                ]);
            }
        }

        $staff->fill([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
        ]);

        if (! empty($data['password'])) {
            $staff->password = $data['password'];
        }

        $staff->role = $data['role'];
        $staff->is_active = (bool) $data['is_active'];
        $staff->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Akun tim berhasil diperbarui.']);

        return to_route('staff.index');
    }
}
