<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Administrator roles that only need access to the (currently empty)
     * admin shell for Phase 2. Their real scoped permissions are added
     * as each admin area is built in later phases.
     *
     * @var list<string>
     */
    private const ADMIN_ROLES = [
        'content_admin',
        'curriculum_manager',
        'customer_support',
        'finance_manager',
        'school_account_manager',
        'technical_admin',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'admin.access',
            'admin.manage-users',
            'admin.manage-roles',
            'admin.manage-settings',
            'admin.manage-curriculum',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        $superAdmin = Role::findOrCreate('super_admin');
        $superAdmin->syncPermissions($permissions);

        foreach (self::ADMIN_ROLES as $roleName) {
            Role::findOrCreate($roleName)->syncPermissions(['admin.access']);
        }

        Role::findOrCreate('content_admin')->givePermissionTo('admin.manage-curriculum');
        Role::findOrCreate('curriculum_manager')->givePermissionTo('admin.manage-curriculum');

        Role::findOrCreate('parent');
        Role::findOrCreate('teacher');
        Role::findOrCreate('school_admin');
    }
}
