<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Profile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AdminAccountSeeder extends Seeder
{
    public function run()
    {
        // Ensure admin role exists
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // Create or update admin user
        $adminUser = User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'username' => 'OnlyAccount',
                'password' => Hash::make('12345678'),
                'role_id' => $adminRole->id,
                'status' => 'active',
            ]
        );

        // Set default image path
        $defaultImagePath = 'profiles/default-admin.png';

        // Create or update admin profile, preserving existing profile_image if set
        Profile::updateOrCreate(
            ['user_id' => $adminUser->id],
            [
                'first_name' => 'John',
                'middle_name' => 'Admin',
                'last_name' => 'Doe',
                'suffix' => '',
                'gender' => 'Male',
                'date_of_birth' => '1980-01-01',
                'profile_image' => Profile::where('user_id', $adminUser->id)->value('profile_image') ?? $defaultImagePath,
            ]
        );

        echo "Admin account and profile seeded successfully.\n";
    }
}