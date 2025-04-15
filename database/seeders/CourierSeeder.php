<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Courier;

class CourierSeeder extends Seeder
{
    public function run()
    {
        // Define couriers without the 'status' field
        $fakeCouriers = [
            [
                'name' => 'JNT EXPRESS',
                'email' => 'JNTEXPRESS@gmail.com',
                'phone_number' => '+63 912 345 6789',
                'address' => '123 Main St, Quezon City, Metro Manila',
                // 'status' field is omitted, will use the default value
            ],
            [
                'name' => 'LAZADA EXPRESS',
                'email' => 'LAZADAEXPRESS@gmail.com',
                'phone_number' => '+63 917 654 3210',
                'address' => '456 Elm St, Makati City, Metro Manila',
                // 'status' field is omitted, will use the default value
            ],
            [
                'name' => 'TOKOK EXPRESS',
                'email' => 'TOKOKEXPRESS@gmail.com',
                'phone_number' => '+63 919 876 5432',
                'address' => '789 Oak St, Pasig City, Metro Manila',
                // 'status' field is omitted, will use the default value
            ],
        ];

        // Loop through the array and create couriers in the database
        foreach ($fakeCouriers as $courier) {
            Courier::create($courier);
        }
    }
}
