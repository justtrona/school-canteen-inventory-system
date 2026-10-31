<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {

            $table->foreignId('category_id')
                ->nullable()
                ->constrained('categories')
                ->nullOnDelete();

            $table->string('sku', 50)->unique();

            $table->string('name');

            $table->text('description')->nullable();

            $table->decimal('price', 10, 2)->default(0);

            $table->unsignedInteger('quantity')->default(0);

            $table->boolean('is_active')->default(true);

        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {

            $table->dropConstrainedForeignId('category_id');

            $table->dropColumn([
                'sku',
                'name',
                'description',
                'price',
                'quantity',
                'is_active',
            ]);

        });
    }
};