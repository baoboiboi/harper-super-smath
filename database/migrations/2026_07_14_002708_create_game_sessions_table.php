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
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_profile_id')->constrained()->cascadeOnDelete();
            $table->string('game_key');
            $table->string('difficulty')->default('easy');
            $table->unsignedInteger('score')->default(0);
            $table->unsignedInteger('rounds_played')->default(0);
            $table->unsignedInteger('time_spent_seconds')->default(0);
            $table->unsignedInteger('points_earned')->default(0);
            $table->timestamps();

            $table->index(['child_profile_id', 'game_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_sessions');
    }
};
