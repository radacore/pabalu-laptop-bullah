<?php

namespace App\Policies;

use App\Models\Sparepart;
use App\Models\User;

class SparepartPolicy
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

    public function view(User $user, Sparepart $sparepart): bool
    {
        return in_array($user->role, ['admin', 'staff'], true);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff'], true);
    }

    public function update(User $user, Sparepart $sparepart): bool
    {
        return in_array($user->role, ['admin', 'staff'], true);
    }

    /**
     * Hanya admin yang boleh hapus (masuk juga via before()).
     */
    public function delete(User $user, Sparepart $sparepart): bool
    {
        return false;
    }
}
