<?php

namespace Tests\Feature\Accounts;

use App\Models\ChildProfile;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ChildPinLoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_child_can_log_in_with_correct_pin_and_reach_dashboard(): void
    {
        $parent = User::factory()->create()->assignRole('parent');
        $child = ChildProfile::factory()->create([
            'parent_id' => $parent->id,
            'pin_hash' => Hash::make('4242'),
        ]);

        $response = $this->actingAs($parent)->post(route('parent.children.authenticate', $child), [
            'pin' => '4242',
        ]);

        $response->assertRedirect(route('child.dashboard'));
        $this->assertEquals($child->id, session('active_child_profile_id'));

        $dashboard = $this->get(route('child.dashboard'));
        $dashboard->assertOk();
    }

    public function test_child_login_fails_with_incorrect_pin(): void
    {
        $parent = User::factory()->create()->assignRole('parent');
        $child = ChildProfile::factory()->create([
            'parent_id' => $parent->id,
            'pin_hash' => Hash::make('4242'),
        ]);

        $response = $this->actingAs($parent)->post(route('parent.children.authenticate', $child), [
            'pin' => '0000',
        ]);

        $response->assertSessionHasErrors('pin');
        $this->assertNull(session('active_child_profile_id'));
    }

    public function test_child_dashboard_is_inaccessible_without_an_active_child_session(): void
    {
        $parent = User::factory()->create()->assignRole('parent');

        $response = $this->actingAs($parent)->get(route('child.dashboard'));

        $response->assertRedirect(route('parent.dashboard'));
    }

    public function test_parent_cannot_start_a_pin_session_for_another_parents_child(): void
    {
        $parentA = User::factory()->create()->assignRole('parent');
        $parentB = User::factory()->create()->assignRole('parent');
        $childOfB = ChildProfile::factory()->create([
            'parent_id' => $parentB->id,
            'pin_hash' => Hash::make('4242'),
        ]);

        $response = $this->actingAs($parentA)->post(route('parent.children.authenticate', $childOfB), [
            'pin' => '4242',
        ]);

        $response->assertForbidden();
    }

    public function test_child_exit_clears_the_active_session(): void
    {
        $parent = User::factory()->create()->assignRole('parent');
        $child = ChildProfile::factory()->create([
            'parent_id' => $parent->id,
            'pin_hash' => Hash::make('4242'),
        ]);

        $this->actingAs($parent)->post(route('parent.children.authenticate', $child), ['pin' => '4242']);

        $response = $this->actingAs($parent)->post(route('child.exit'));

        $response->assertRedirect(route('parent.dashboard'));
        $this->assertNull(session('active_child_profile_id'));
    }
}
