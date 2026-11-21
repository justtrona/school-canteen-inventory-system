
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE users
            MODIFY COLUMN role
            ENUM('superadmin', 'admin', 'cashier')
            NOT NULL DEFAULT 'admin'
        ");
    }

    public function down(): void
    {
        $cashierExists = DB::table('users')
            ->where('role', 'cashier')
            ->exists();

        if ($cashierExists) {
            throw new \RuntimeException(
                'Cannot remove cashier role while cashier accounts exist.'
            );
        }

        DB::statement("
            ALTER TABLE users
            MODIFY COLUMN role
            ENUM('superadmin', 'admin')
            NOT NULL DEFAULT 'admin'
        ");
    }
};
