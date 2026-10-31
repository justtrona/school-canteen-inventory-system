<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use RuntimeException;

class SuperadminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('INITIAL_SUPERADMIN_EMAIL');
        $password = env('INITIAL_SUPERADMIN_PASSWORD');

        if (! $email || ! $password) {
            throw new RuntimeException(
                'Set INITIAL_SUPERADMIN_EMAIL and INITIAL_SUPERADMIN_PASSWORD in .env before running this seeder.'
            );
        }

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('Invalid initial Superadmin email address.');
        }

        if (strlen($password) < 12) {
            throw new RuntimeException(
                'Initial Superadmin password must contain at least 12 characters.'
            );
        }

        if (User::where('email', $email)->exists()) {
            $this->command->warn(
                'A user with this email already exists. No changes were made.'
            );

            return;
        }

        $user = new User();

        $user->name = 'SC Superadmin';
        $user->email = $email;
        $user->password = Hash::make($password);
        $user->role = 'superadmin';
        $user->is_active = true;
        $user->email_verified_at = now();

        $user->save();

        $this->command->info('Initial Superadmin account created successfully.');
    }
}