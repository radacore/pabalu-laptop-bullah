<?php

namespace App\Policies;

use App\Models\Rental;
use App\Models\User;

class RentalPolicy
{
    /**
     * Admin selalu bisa (bypass di semua ability).
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff'], true);
    }

    /**
     * Staff hanya boleh lihat rental yang dia buat.
     */
    public function view(User $user, Rental $rental): bool
    {
        return $rental->created_by === $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff'], true);
    }

    /**
     * Staff hanya boleh update rental yang dia buat.
     */
    public function update(User $user, Rental $rental): bool
    {
        return $rental->created_by === $user->id;
    }

    /**
     * Hanya admin yang boleh hapus rental (masuk juga via before()).
     */
    public function delete(User $user, Rental $rental): bool
    {
        return false;
    }
}
