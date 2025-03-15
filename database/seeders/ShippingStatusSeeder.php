<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ShippingStatus;

class ShippingStatusSeeder extends Seeder
{
    public function run()
    {
        ShippingStatus::create(['id' => 1, 'name' => 'Pending']);
        ShippingStatus::create(['id' => 2, 'name' => 'Shipped']);
        ShippingStatus::create(['id' => 3, 'name' => 'Delivered']);
        ShippingStatus::create(['id' => 4, 'name' => 'Cancelled']);
    }
}