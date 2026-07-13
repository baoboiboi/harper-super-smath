<?php

namespace Database\Factories;

use App\Models\DrawingPrompt;
use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DrawingPrompt>
 */
class DrawingPromptFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'lesson_id' => Lesson::factory(),
            'type' => 'trace_letter',
            'title' => 'Trace the Letter A',
            'template_text' => 'A',
            'points' => 10,
        ];
    }
}
