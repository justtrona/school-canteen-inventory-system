<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {

            $table->string('transaction_number', 50)->unique();

            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->decimal('subtotal', 12, 2)->default(0);

            $table->decimal('discount_amount', 12, 2)->default(0);

            $table->decimal('total_amount', 12, 2)->default(0);

            $table->enum('status', [
                'pending',
                'completed',
                'cancelled',
                'voided',
            ])->default('pending');

            $table->timestamp('completed_at')->nullable();

            $table->timestamp('voided_at')->nullable();

            $table->foreignId('voided_by')
                ->nullable()
                ->constrained('users')
                ->restrictOnDelete();

            $table->text('void_reason')->nullable();

            $table->text('notes')->nullable();

            $table->index(['status', 'completed_at']);

        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {

            $table->dropIndex(['status', 'completed_at']);

            $table->dropConstrainedForeignId('voided_by');

            $table->dropConstrainedForeignId('user_id');

            $table->dropColumn([
                'transaction_number',
                'subtotal',
                'discount_amount',
                'total_amount',
                'status',
                'completed_at',
                'voided_at',
                'void_reason',
                'notes',
            ]);

        });
    }
};