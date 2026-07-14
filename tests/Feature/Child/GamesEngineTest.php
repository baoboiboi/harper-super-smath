<?php

namespace Tests\Feature\Child;

use App\Models\ChildProfile;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class GamesEngineTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);
    }

    /**
     * @return array{0: User, 1: ChildProfile}
     */
    private function loginAsChild(): array
    {
        $parent = User::factory()->create()->assignRole('parent');
        $child = ChildProfile::factory()->create([
            'parent_id' => $parent->id,
            'pin_hash' => Hash::make('4242'),
        ]);

        $this->actingAs($parent)
            ->post(route('parent.children.authenticate', $child), ['pin' => '4242']);

        return [$parent, $child];
    }

    public function test_child_can_view_the_games_hub(): void
    {
        $this->loginAsChild();

        $response = $this->get(route('child.games.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('games', 4));
    }

    public function test_child_can_view_a_valid_game(): void
    {
        $this->loginAsChild();

        $response = $this->get(route('child.games.play', 'number-match'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Child/Games/NumberMatch')
            ->where('game.key', 'number-match')
        );
    }

    public function test_unknown_game_key_returns_not_found(): void
    {
        $this->loginAsChild();

        $response = $this->get(route('child.games.play', 'not-a-real-game'));

        $response->assertNotFound();
    }

    public function test_child_can_complete_a_game_and_points_are_recorded(): void
    {
        [, $child] = $this->loginAsChild();

        $response = $this->post(route('child.games.complete', 'number-match'), [
            'difficulty' => 'easy',
            'score' => 6,
            'rounds_played' => 8,
            'time_spent_seconds' => 45,
        ]);

        $response->assertRedirect(route('child.games.index'));

        $this->assertDatabaseHas('game_sessions', [
            'child_profile_id' => $child->id,
            'game_key' => 'number-match',
            'score' => 6,
            'points_earned' => 30,
        ]);
    }

    public function test_completing_an_unknown_game_returns_not_found(): void
    {
        $this->loginAsChild();

        $response = $this->post(route('child.games.complete', 'not-a-real-game'), [
            'difficulty' => 'easy',
            'score' => 1,
            'rounds_played' => 1,
            'time_spent_seconds' => 5,
        ]);

        $response->assertNotFound();
    }

    public function test_completing_a_game_validates_difficulty(): void
    {
        $this->loginAsChild();

        $response = $this->post(route('child.games.complete', 'number-match'), [
            'difficulty' => 'impossible',
            'score' => 1,
            'rounds_played' => 1,
            'time_spent_seconds' => 5,
        ]);

        $response->assertSessionHasErrors('difficulty');
    }

    public function test_games_hub_shows_best_score_after_playing(): void
    {
        [, $child] = $this->loginAsChild();

        $this->post(route('child.games.complete', 'memory-match'), [
            'difficulty' => 'medium',
            'score' => 6,
            'rounds_played' => 10,
            'time_spent_seconds' => 90,
        ]);

        $response = $this->get(route('child.games.index'));

        $response->assertInertia(fn ($page) => $page
            ->where('games.1.key', 'memory-match')
            ->where('games.1.best_score', 6)
        );
    }
}
