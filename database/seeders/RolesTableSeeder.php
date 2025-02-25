<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RolesTableSeeder extends Seeder
{
    public function run()
    {
        // Insert default roles if they don't exist
        Role::firstOrCreate(['role_type' => 'admin']);
        Role::firstOrCreate(['role_type' => 'user']);
    }
}
