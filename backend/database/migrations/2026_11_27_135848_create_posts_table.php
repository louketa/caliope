<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('kind', 20);
            $table->string('lang', 2);
            $table->string('title', 120)->nullable();
            $table->text('text');
            $table->string('url', 2048)->nullable();
            $table->boolean('featured')->default(false);
            $table->unsignedInteger('likes_count')->default(0);
            $table->timestamps();

            $table->index(['kind', 'lang', 'featured', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
