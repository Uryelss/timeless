<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ShippingStatus;

class ShippingStatusSeeder extends Seeder
{
    public function run()
    {
        ShippingStatus::create(['id' => 1, 'name' => 'Order Placed']);
        ShippingStatus::create(['id' => 2, 'name' => 'Payment Confirmed']);
        ShippingStatus::create(['id' => 3, 'name' => 'Shipped']);
        ShippingStatus::create(['id' => 4, 'name' => 'Delivered']);
        ShippingStatus::create(['id' => 5, 'name' => 'Cancelled']);
    }
}