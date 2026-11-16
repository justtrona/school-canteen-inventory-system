<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class AdminSeeder extends Seeder
{
    /**
     * Seed the default Admin account.
     */
    public function run(): void
    {
        $email = 'php artisan tinker';

        $password = env('SEED_ADMIN_PASSWORD');

        if (empty($password)) {
            throw new RuntimeException(
                'SEED_ADMIN_PASSWORD is not configured.'
            );
        }

        // Prevent accidentally changing an existing
        // Superadmin or another user's account.
        $existingUser = User::where('email', $email)->first();

        if ($existingUser && $existingUser->role !== 'admin') {
            throw new RuntimeException(
                'The Admin email is already assigned to another role.'
            );
        }

        // Create the Admin if it does not exist.
        // Re-running the seeder will not reset its password.
        if (!$existingUser) {
            $admin = new User();

            $admin->name = 'SC Admin';
            $admin->email = $email;
            $admin->password = Hash::make($password);
            $admin->role = 'admin';

            $admin->save();

            $this->command?->info(
                'Admin account created successfully!'
            );
        } else {
            $this->command?->info(
                'Admin account already exists. Skipping.'
            );
        }
    }
}
