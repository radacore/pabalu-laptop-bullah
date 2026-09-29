<?php

namespace App\Policies;

use App\Models\Laptop;
use App\Models\User;

class LaptopPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return null;
    }

    /**
     * Non-admin (staff) hanya boleh lihat (untuk cross-check saat servis),
     * tidak boleh modifikasi apapun. Rule dapat diperlonggar kalau di masa
     * depan staff dilibatkan di inventory management.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff'], true);
    }

    public function view(User $user, Laptop $laptop): bool
    {
        return in_array($user->role, ['admin', 'staff'], true);
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Laptop $laptop): bool
    {
        return false;
    }

    public function delete(User $user, Laptop $laptop): bool
    {
        return false;
    }
}
