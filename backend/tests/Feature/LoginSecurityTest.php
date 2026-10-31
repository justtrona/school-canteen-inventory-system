<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class LoginSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
            'password' => Hash::make('Password123!'),
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'Password123!',
        ]);

        $response->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($user);
    }

    public function test_user_cannot_login_with_incorrect_password(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
            'password' => Hash::make('Password123!'),
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'WrongPassword123!',
        ]);

        $response->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_inactive_user_cannot_login(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'is_active' => false,
            'password' => Hash::make('Password123!'),
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'Password123!',
        ]);

        $response->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_login_is_rate_limited_after_five_failed_attempts(): void
{
    $email = 'ratelimit@example.com';

    $throttleKey = 'login:' . strtolower($email) . '|127.0.0.1';

    RateLimiter::clear($throttleKey);

    // Make five failed login attempts.
    for ($attempt = 1; $attempt <= 5; $attempt++) {
        $response = $this->post('/login', [
            'email' => $email,
            'password' => 'WrongPassword123!',
        ]);

        $response->assertSessionHasErrors('email');
    }

    // The sixth attempt should trigger the rate limiter.
    $response = $this->post('/login', [
        'email' => $email,
        'password' => 'WrongPassword123!',
    ]);

    $response->assertSessionHasErrors('email');

        $errorMessage = session('errors')->first('email');

        $this->assertStringContainsString(
            'Too many login attempts.',
            $errorMessage
        );
    $this->assertGuest();

    RateLimiter::clear($throttleKey);
}
}