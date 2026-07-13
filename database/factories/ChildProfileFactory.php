<?php

namespace Database\Factories;

use App\Models\ChildProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<ChildProfile>
 */
class ChildProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'parent_id' => User::factory(),
            'name' => fake()->firstName(),
            'pin_hash' => Hash::make('1234'),
            'avatar' => fake()->randomElement(['🦊', '🐶', '🐼', '🦄', '🚀', '🌈']),
            'age_band' => fake()->randomElement(['3-5', '6-8', '9-11', '12+']),
            'grade_level' => null,
        ];
    }
}
