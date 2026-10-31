<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {

            $table->foreignId('order_id')
                ->constrained('orders')
                ->restrictOnDelete();

            $table->foreignId('product_id')
                ->constrained('products')
                ->restrictOnDelete();

            $table->string('product_name');

            $table->string('product_sku', 50);

            $table->unsignedInteger('quantity');

            $table->decimal('unit_price', 12, 2);

            $table->decimal('subtotal', 12, 2);

            $table->index('order_id');

        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {

            $table->dropIndex(['order_id']);

            $table->dropConstrainedForeignId('product_id');

            $table->dropConstrainedForeignId('order_id');

            $table->dropColumn([
                'product_name',
                'product_sku',
                'quantity',
                'unit_price',
                'subtotal',
            ]);

        });
    }
};