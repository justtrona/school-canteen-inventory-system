<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {

            $table->foreignId('order_id')
                ->constrained('orders')
                ->restrictOnDelete();

            $table->foreignId('received_by')
                ->constrained('users')
                ->restrictOnDelete();

            $table->string('payment_method', 30)->default('cash');

            $table->decimal('amount', 12, 2);

            $table->decimal('amount_received', 12, 2);

            $table->decimal('change_amount', 12, 2)->default(0);

            $table->string('reference_number', 100)->nullable();

            $table->enum('status', [
                'pending',
                'paid',
                'refunded',
                'voided',
            ])->default('pending');

            $table->timestamp('paid_at')->nullable();

            $table->text('notes')->nullable();

            $table->index(['status', 'paid_at']);

        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {

            $table->dropIndex(['status', 'paid_at']);

            $table->dropConstrainedForeignId('received_by');

            $table->dropConstrainedForeignId('order_id');

            $table->dropColumn([
                'payment_method',
                'amount',
                'amount_received',
                'change_amount',
                'reference_number',
                'status',
                'paid_at',
                'notes',
            ]);

        });
    }
};