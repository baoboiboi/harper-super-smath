<?php

namespace Database\Factories;

use App\Models\Artwork;
use App\Models\ChildProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Artwork>
 */
class ArtworkFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'child_profile_id' => ChildProfile::factory(),
            'title' => fake()->words(2, true),
            'image_path' => 'artwork/test/'.fake()->uuid().'.png',
        ];
    }
}
