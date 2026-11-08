
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_in_receipts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('stock_movement_id')
                ->unique()
                ->constrained('stock_movements')
                ->restrictOnDelete();

            $table->foreignId('supplier_id')
                ->nullable()
                ->constrained('suppliers')
                ->nullOnDelete();

            $table->string('reference_number', 50)->unique();

            $table->date('received_at');

            $table->timestamps();

            $table->index('received_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_in_receipts');
    }
};
