<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class AdminAccountSeeder extends Seeder
{
    public function run()
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        User::create([
            'username' => 'OnlyAccount',
            'email'    => 'admin@gmail.com',
            'password' => Hash::make('12345678'),
            'role_id'  => $adminRole->id,
            'status'   => 'active',
        ]);
    }
}
