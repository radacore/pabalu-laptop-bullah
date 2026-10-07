<?php

namespace App\Policies;

use App\Models\Service;
use App\Models\User;

class ServicePolicy
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
        return $user->role === 'admin';
    }

    /**
     * Hanya admin yang memakai sistem (role staff dinonaktifkan).
     */
    public function view(User $user, Service $service): bool
    {
        return $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Hanya admin yang memakai sistem (role staff dinonaktifkan).
     */
    public function update(User $user, Service $service): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Hanya admin yang boleh hapus service (masuk juga via before()).
     */
    public function delete(User $user, Service $service): bool
    {
        return false;
    }
}
