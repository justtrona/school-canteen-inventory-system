<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperadminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_access_protected_route(): void
    {
        $user = User::factory()->create([
            'role' => 'superadmin',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)
            ->get('/superadmin/test');

        $response->assertOk();
        $response->assertJson([
            'message' => 'Superadmin access granted.',
        ]);
    }

    public function test_admin_cannot_access_superadmin_route(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)
            ->get('/superadmin/test');

        $response->assertForbidden();
    }

    public function test_guest_cannot_access_superadmin_route(): void
    {
        $response = $this->get('/superadmin/test');

        $response->assertRedirect('/login');
    }
}