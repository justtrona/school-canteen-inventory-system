
<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // No changes needed.
        // product_id and supplier_id already exist
        // in the original product_suppliers migration.
    }

    public function down(): void
    {
        // Intentionally empty.
        // Preserve existing product-supplier relationships.
    }
};
