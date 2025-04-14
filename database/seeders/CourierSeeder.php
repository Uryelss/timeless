<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Courier;

class CourierSeeder extends Seeder
{
    public function run()
    {
        $fakeCouriers = [
            [
                'name' => 'Jaypee Gecain',
                'email' => 'GecainJaypee@gmail.com',
                'is_fake' => true,
            ],
            [
                'name' => 'Arji Galabo',
                'email' => 'GalaboArji@gmail.com',
                'is_fake' => true,
            ],
            [
                'name' => 'Kyle Mahinay',
                'email' => 'MahinayKyle@gmail.com',
                'is_fake' => true,
            ],
        ];

        foreach ($fakeCouriers as $courier) {
            Courier::create($courier);
        }
    }
}