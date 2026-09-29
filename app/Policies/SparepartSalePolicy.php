<?php

namespace App\Policies;

use App\Models\SparepartSale;
use App\Models\User;

class SparepartSalePolicy
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

    public function view(User $user, SparepartSale $sale): bool
    {
        return in_array($user->role, ['admin', 'staff'], true);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff'], true);
    }

    /**
     * Hanya admin yang boleh hapus penjualan (ledger immutable bagi staff).
     */
    public function delete(User $user, SparepartSale $sale): bool
    {
        return false;
    }
}
