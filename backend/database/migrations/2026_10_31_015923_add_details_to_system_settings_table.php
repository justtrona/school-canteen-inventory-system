<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('system_settings', function (Blueprint $table) {

            $table->string('key', 100)->unique();

            $table->text('value')->nullable();

            $table->string('type', 30)->default('string');

            $table->string('group', 50)->default('general');

            $table->text('description')->nullable();

            $table->foreignId('updated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

        });
    }

    public function down(): void
    {
        Schema::table('system_settings', function (Blueprint $table) {

            $table->dropConstrainedForeignId('updated_by');

            $table->dropColumn([
                'key',
                'value',
                'type',
                'group',
                'description',
            ]);

        });
    }
};