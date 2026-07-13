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
        Schema::create('typing_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('typing_exercise_id')->constrained()->cascadeOnDelete();
            $table->text('typed_text');
            $table->unsignedInteger('wpm')->default(0);
            $table->unsignedInteger('accuracy_percent')->default(0);
            $table->unsignedInteger('error_count')->default(0);
            $table->json('key_stats')->nullable();
            $table->unsignedInteger('points_earned')->default(0);
            $table->timestamps();

            $table->index(['child_profile_id', 'typing_exercise_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('typing_sessions');
    }
};
