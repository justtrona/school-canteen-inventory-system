
<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // No changes needed.
        // sku_prefix already exists in the categories table.
    }

    public function down(): void
    {
        // Intentionally empty.
        // Preserve existing category SKU prefixes.
    }
};
