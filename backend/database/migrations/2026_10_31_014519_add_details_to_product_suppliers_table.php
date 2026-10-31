<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_suppliers', function (Blueprint $table) {
            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnDelete();

            $table->foreignId('supplier_id')
                ->constrained('suppliers')
                ->cascadeOnDelete();

            $table->unique(['product_id', 'supplier_id']);
        });
    }

    public function down(): void
    {
        Schema::table('product_suppliers', function (Blueprint $table) {
            $table->dropUnique(['product_id', 'supplier_id']);

            $table->dropConstrainedForeignId('supplier_id');
            $table->dropConstrainedForeignId('product_id');
        });
    }
};