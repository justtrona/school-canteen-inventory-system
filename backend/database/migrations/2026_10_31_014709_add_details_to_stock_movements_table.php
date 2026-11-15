
<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // No changes needed.
        // All stock movement columns already exist
        // in the original create_stock_movements_table migration.
    }

    public function down(): void
    {
        // Intentionally empty.
        // Preserve existing stock movement records and columns.
    }
};
