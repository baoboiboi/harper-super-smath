<?php

namespace Database\Factories;

use App\Models\Lesson;
use App\Models\TypingExercise;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TypingExercise>
 */
class TypingExerciseFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'lesson_id' => Lesson::factory(),
            'type' => 'word_typing',
            'title' => fake()->words(2, true),
            'target_text' => 'cat dog',
            'points' => 10,
        ];
    }
}
