<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Question>
 */
class QuestionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'activity_id' => Activity::factory(),
            'type' => 'multiple_choice',
            'prompt' => fake()->sentence()."?",
        ];
    }
}
