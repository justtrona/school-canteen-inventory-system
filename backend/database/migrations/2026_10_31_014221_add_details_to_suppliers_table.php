
<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // No changes needed.
        // These columns already exist in the original suppliers migration.
    }

    public function down(): void
    {
        // Intentionally empty.
        // Preserve the existing suppliers table structure.
    }
};
