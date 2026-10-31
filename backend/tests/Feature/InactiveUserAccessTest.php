<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InactiveUserAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_inactive_superadmin_cannot_access_dashboard(): void
    {
        $user = User::factory()->create([
            'role' => 'superadmin',
            'is_active' => false,
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertRedirect('/login');

        $this->assertGuest();
    }

    public function test_inactive_admin_cannot_access_dashboard(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'is_active' => false,
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertRedirect('/login');

        $this->assertGuest();
    }

    public function test_active_admin_can_access_dashboard(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();

        $this->assertAuthenticatedAs($user);
    }
}