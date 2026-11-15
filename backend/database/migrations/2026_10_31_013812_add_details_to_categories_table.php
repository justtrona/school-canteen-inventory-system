
<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // No changes needed.
        // These columns already exist in the original categories migration.
    }

    public function down(): void
    {
        // Intentionally empty.
        // Do not remove existing categories columns.
    }
};
