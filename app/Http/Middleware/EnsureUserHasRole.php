<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /** Usage: ->middleware('role:admin') or ->middleware('role:admin,staff') */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if ($user === null || ! in_array($user->role, $roles, true)) {
            abort(403);
        }

        // User yang di-nonaktifkan (is_active=false) tidak boleh mengakses
        // resource protected walaupun session masih valid. Logout paksa
        // supaya cookie session tidak "menghidupkan" akses lagi.
        if ($user->is_active === false) {
            auth()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            abort(403, 'Akun Anda telah dinonaktifkan.');
        }

        return $next($request);
    }
}
