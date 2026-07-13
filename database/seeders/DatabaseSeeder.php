<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleAndPermissionSeeder::class);

        if (app()->environment('local')) {
            User::factory()->create([
                'name' => 'Test Admin',
                'email' => 'admin@example.com',
            ])->assignRole('super_admin');

            User::factory()->create([
                'name' => 'Test Parent',
                'email' => 'parent@example.com',
            ])->assignRole('parent');
        }
    }
}
