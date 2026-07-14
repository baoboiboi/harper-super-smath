<?php

namespace Database\Factories;

use App\Models\ChildProfile;
use App\Models\GameSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GameSession>
 */
class GameSessionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'child_profile_id' => ChildProfile::factory(),
            'game_key' => 'number-match',
            'difficulty' => 'easy',
            'score' => 5,
            'rounds_played' => 8,
            'time_spent_seconds' => 60,
            'points_earned' => 25,
        ];
    }
}
