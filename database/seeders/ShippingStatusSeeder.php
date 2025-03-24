<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ShippingStatus;

class ShippingStatusSeeder extends Seeder
{
    public function run()
    {
        ShippingStatus::create(['name' => 'Order Placed']);
        ShippingStatus::create(['name' => 'Payment Info Confirmed']);
        ShippingStatus::create(['name' => 'Shipped']);
        ShippingStatus::create(['name' => 'Delivered']);
        ShippingStatus::create(['name' => 'Cancelled']);
        ShippingStatus::create(['name' => 'Completed']);
    }
}
