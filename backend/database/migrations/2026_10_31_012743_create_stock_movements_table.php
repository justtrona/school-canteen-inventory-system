
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();

            // Product affected by the transaction.
            // Prevent deleting products with inventory history.
            $table->foreignId('product_id')
                ->constrained('products')
                ->restrictOnDelete();

            // User responsible for the transaction.
            // Preserve history even if the user account is deleted.
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Stock In, Stock Out, Adjustment, etc.
            $table->string('type', 30);

            // Positive for stock additions,
            // negative for stock deductions.
            $table->integer('quantity_change');

            // Inventory balance before and after the transaction.
            $table->unsignedInteger('quantity_before');
            $table->unsignedInteger('quantity_after');

            // Optional reference to another transaction.
            $table->string('reference_type', 100)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();

            // Explanation or reason for the movement.
            $table->text('reason')->nullable();

            $table->timestamps();

            // Indexes for inventory history searches.
            $table->index(['product_id', 'created_at']);
            $table->index(['type', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
