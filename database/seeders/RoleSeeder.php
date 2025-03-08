<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run()
    {
        // Insert roles into the roles table
        Role::firstOrCreate(['id' => 1, 'name' => 'admin']);
        Role::firstOrCreate(['id' => 2, 'name' => 'user']);

        // Output message for confirmation
        echo "Roles seeded successfully.\n";
    }
}
