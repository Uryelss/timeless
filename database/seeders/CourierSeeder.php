<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Courier; // Corrected namespace (App\Models, not App\Model)

class CourierSeeder extends Seeder
{
    public function run()
    {
        $couriers = [
            [
                'name' => 'JNT Express',
                'phone' => '+639123456789',
                'address' => '123 Main St, Quezon City, Metro Manila, Philippines',
                'transfer_method' => 'Gcash transferred',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'LBC Express',
                'phone' => '+639987654321',
                'address' => '456 Elm St, Davao City, Davao del Sur, Philippines',
                'transfer_method' => 'Gcash transferred',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Grab Express',
                'phone' => '+639456789123',
                'address' => '789 Pine St, Cebu City, Cebu, Philippines',
                'transfer_method' => 'Gcash transferred',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($couriers as $courier) {
            Courier::create($courier); // This will now work with the correct namespace
        }
    }
}