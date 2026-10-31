<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->foreignId('product_id')
                ->constrained('products')
                ->restrictOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->enum('type', [
                'stock_in',
                'stock_out',
                'adjustment',
                'sale',
                'sale_reversal',
            ]);

            $table->integer('quantity_change');

            $table->unsignedInteger('quantity_before');

            $table->unsignedInteger('quantity_after');

            $table->string('reference_type', 50)->nullable();

            $table->unsignedBigInteger('reference_id')->nullable();

            $table->text('reason')->nullable();

            $table->index(['product_id', 'created_at']);

            $table->index(['reference_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropIndex(['product_id', 'created_at']);
            $table->dropIndex(['reference_type', 'reference_id']);

            $table->dropConstrainedForeignId('product_id');
            $table->dropConstrainedForeignId('user_id');

            $table->dropColumn([
                'type',
                'quantity_change',
                'quantity_before',
                'quantity_after',
                'reference_type',
                'reference_id',
                'reason',
            ]);
        });
    }
};