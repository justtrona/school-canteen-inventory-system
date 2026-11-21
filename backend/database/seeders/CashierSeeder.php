<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CashierSeeder extends Seeder
{
    public function run(): void
    {
        $email = env(
            'SEED_CASHIER_EMAIL',
            'cashier@canteen.test'
        );

        $password = env('SEED_CASHIER_PASSWORD');

        if (empty($password)) {
            throw new \RuntimeException(
                'Set SEED_CASHIER_PASSWORD in your .env file before running CashierSeeder.'
            );
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Canteen Cashier',
                'password' => Hash::make($password),
                'role' => 'cashier',
                'is_active' => true,
            ]
        );
    }
}
