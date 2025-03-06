<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Check if an admin role exists
        $adminRole = Role::where('role_type', 'admin')->first();

        if (!$adminRole) {
            // Create the admin role if it doesn't exist
            $adminRole = Role::create(['role_type' => 'admin']);
        }

        // Delete existing admin user to prevent conflicts (OPTIONAL)
        User::where('email', 'admin@gmail.com')->delete();

        // Create the admin user (FORCE INSERT)
        User::create([
            'username' => 'OnlyAccount',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('12345678'), // Change this to a secure password
            'role_id' => $adminRole->id,
            'status' => 'Active', // Ensure the admin is active
        ]);

        echo "✅ Admin user created successfully!\n";
    }
}