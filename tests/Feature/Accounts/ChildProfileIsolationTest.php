<?php

namespace Tests\Feature\Accounts;

use App\Models\ChildProfile;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChildProfileIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_parent_can_create_a_child_profile(): void
    {
        $parent = User::factory()->create()->assignRole('parent');

        $response = $this->actingAs($parent)->post(route('parent.children.store'), [
            'name' => 'Harper',
            'pin' => '1234',
            'pin_confirmation' => '1234',
            'age_band' => '6-8',
        ]);

        $response->assertRedirect(route('parent.dashboard'));
        $this->assertDatabaseHas('child_profiles', [
            'parent_id' => $parent->id,
            'name' => 'Harper',
        ]);
    }

    public function test_non_parent_cannot_create_a_child_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('parent.children.store'), [
            'name' => 'Harper',
            'pin' => '1234',
            'pin_confirmation' => '1234',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('child_profiles', ['name' => 'Harper']);
    }

    public function test_user_without_parent_role_is_forbidden_from_parent_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('parent.dashboard'));

        $response->assertForbidden();
    }

    public function test_parent_cannot_delete_another_parents_child_profile(): void
    {
        $parentA = User::factory()->create()->assignRole('parent');
        $parentB = User::factory()->create()->assignRole('parent');

        $childOfB = ChildProfile::factory()->create(['parent_id' => $parentB->id]);

        $response = $this->actingAs($parentA)->delete(route('parent.children.destroy', $childOfB));

        $response->assertForbidden();
        $this->assertDatabaseHas('child_profiles', ['id' => $childOfB->id]);
    }

    public function test_parent_can_delete_their_own_child_profile(): void
    {
        $parent = User::factory()->create()->assignRole('parent');
        $child = ChildProfile::factory()->create(['parent_id' => $parent->id]);

        $response = $this->actingAs($parent)->delete(route('parent.children.destroy', $child));

        $response->assertRedirect(route('parent.dashboard'));
        $this->assertSoftDeleted('child_profiles', ['id' => $child->id]);
    }
}
