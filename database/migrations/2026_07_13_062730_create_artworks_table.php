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
        Schema::create('artworks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('drawing_prompt_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('image_path');
            $table->timestamps();

            $table->index(['child_profile_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('artworks');
    }
};
