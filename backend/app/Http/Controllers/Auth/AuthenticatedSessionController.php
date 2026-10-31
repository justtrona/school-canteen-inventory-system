<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\RateLimiter;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request): RedirectResponse
{
    $credentials = $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required', 'string'],
    ]);

    $throttleKey = strtolower($credentials['email']).'|'.$request->ip();

    if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
        $seconds = RateLimiter::availableIn($throttleKey);

        throw ValidationException::withMessages([
            'email' => "Too many login attempts. Please try again in {$seconds} seconds.",
        ]);
    }

    $user = User::where('email', $credentials['email'])->first();

    if (
        ! $user ||
        ! Hash::check($credentials['password'], $user->password) ||
        ! $user->is_active ||
        ! in_array($user->role, ['superadmin', 'admin'], true)
    ) {
        RateLimiter::hit($throttleKey, 60);

        throw ValidationException::withMessages([
            'email' => 'The provided credentials are incorrect or the account is inactive.',
        ]);
    }

    RateLimiter::clear($throttleKey);

    Auth::login($user);

    $request->session()->regenerate();

    return redirect()->intended('/dashboard');
}

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/login');
    }
}