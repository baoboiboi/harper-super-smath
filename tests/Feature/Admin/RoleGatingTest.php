<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleGatingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_guest_is_redirected_from_admin_dashboard(): void
    {
        $response = $this->get(route('admin.dashboard'));

        $response->assertRedirect(route('login'));
    }

    public function test_regular_parent_cannot_access_admin_dashboard(): void
    {
        $parent = User::factory()->create()->assignRole('parent');

        $response = $this->actingAs($parent)->get(route('admin.dashboard'));

        $response->assertForbidden();
    }

    public function test_super_admin_can_access_admin_dashboard(): void
    {
        $admin = User::factory()->create()->assignRole('super_admin');

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertOk();
    }

    public function test_admin_role_without_manage_users_permission_cannot_view_user_list(): void
    {
        $finance = User::factory()->create()->assignRole('finance_manager');

        $response = $this->actingAs($finance)->get(route('admin.users.index'));

        $response->assertForbidden();
    }

    public function test_only_super_admin_can_grant_the_super_admin_role(): void
    {
        $contentAdmin = User::factory()->create()->assignRole('content_admin');
        $contentAdmin->givePermissionTo('admin.manage-roles');
        $target = User::factory()->create()->assignRole('parent');

        $response = $this->actingAs($contentAdmin)->patch(route('admin.users.update-role', $target), [
            'role' => 'super_admin',
        ]);

        $response->assertForbidden();
        $this->assertFalse($target->fresh()->hasRole('super_admin'));
    }

    public function test_super_admin_can_assign_a_role_to_a_user(): void
    {
        $superAdmin = User::factory()->create()->assignRole('super_admin');
        $target = User::factory()->create()->assignRole('parent');

        $response = $this->actingAs($superAdmin)->patch(route('admin.users.update-role', $target), [
            'role' => 'teacher',
        ]);

        $response->assertRedirect();
        $this->assertTrue($target->fresh()->hasRole('teacher'));
        $this->assertFalse($target->fresh()->hasRole('parent'));
    }
}
