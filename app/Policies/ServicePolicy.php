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
        return in_array($user->role, ['admin', 'staff'], true);
    }

    /**
     * Staff hanya boleh lihat service yang di-assign ke dia atau yang dia buat.
     */
    public function view(User $user, Service $service): bool
    {
        return $service->technician_id === $user->id
            || $service->created_by === $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff'], true);
    }

    /**
     * Staff hanya boleh update service yang di-assign ke dia atau yang dia buat.
     */
    public function update(User $user, Service $service): bool
    {
        return $service->technician_id === $user->id
            || $service->created_by === $user->id;
    }

    /**
     * Hanya admin yang boleh hapus service (masuk juga via before()).
     */
    public function delete(User $user, Service $service): bool
    {
        return false;
    }
}
