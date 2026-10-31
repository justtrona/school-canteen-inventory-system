<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('action', 100);

            $table->string('module', 100);

            $table->unsignedBigInteger('record_id')->nullable();

            $table->json('old_values')->nullable();

            $table->json('new_values')->nullable();

            $table->text('reason')->nullable();

            $table->ipAddress('ip_address')->nullable();

            $table->text('user_agent')->nullable();

            $table->index(['module', 'record_id']);

            $table->index(['action', 'created_at']);

        });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {

            $table->dropIndex(['module', 'record_id']);

            $table->dropIndex(['action', 'created_at']);

            $table->dropConstrainedForeignId('user_id');

            $table->dropColumn([
                'action',
                'module',
                'record_id',
                'old_values',
                'new_values',
                'reason',
                'ip_address',
                'user_agent',
            ]);

        });
    }
};