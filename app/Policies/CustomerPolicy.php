<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return null;
    }

    /**
     * Customer master data — hanya admin yang boleh CRUD.
     * Staff bisa lihat lewat dropdown di form servis (form itu tidak lewat Policy).
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    public function view(User $user, Customer $customer): bool
    {
        return false;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Customer $customer): bool
    {
        return false;
    }

    public function delete(User $user, Customer $customer): bool
    {
        return false;
    }
}
