
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_in_receipts', function (Blueprint $table) {
            $table->decimal('unit_cost', 12, 2)->nullable();
            $table->decimal('total_cost', 18, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('stock_in_receipts', function (Blueprint $table) {
            $table->dropColumn([
                'unit_cost',
                'total_cost',
            ]);
        });
    }
};
