
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('unit_of_measure', 20)
                ->default('pcs')
                ->after('quantity');

            $table->decimal('reorder_level', 12, 3)
                ->default(0)
                ->after('unit_of_measure');

            $table->decimal('quantity', 12, 3)
                ->default(0)
                ->change();
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->decimal('quantity_change', 12, 3)
                ->change();

            $table->decimal('quantity_before', 12, 3)
                ->unsigned()
                ->default(0)
                ->change();

            $table->decimal('quantity_after', 12, 3)
                ->unsigned()
                ->default(0)
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'unit_of_measure',
                'reorder_level',
            ]);

            // Reverting to integers can lose fractional quantities.
            $table->unsignedInteger('quantity')
                ->default(0)
                ->change();
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->integer('quantity_change')->change();

            $table->unsignedInteger('quantity_before')
                ->default(0)
                ->change();

            $table->unsignedInteger('quantity_after')
                ->default(0)
                ->change();
        });
    }
};
