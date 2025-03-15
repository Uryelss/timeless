<?php

namespace Database\Seeders;

use App\Models\ShippingMethod;
use Illuminate\Database\Seeder;

class ShippingMethodSeeder extends Seeder
{
    public function run()
    {
        ShippingMethod::insert([
            ['name' => 'Standard Shipping', 'cost' => 75.00],
            ['name' => 'Expedited Shipping', 'cost' => 150.00],
        ]);
    }
}