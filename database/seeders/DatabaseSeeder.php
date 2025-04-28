<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            PaymentMethodSeeder::class,
            PaymentStatusSeeder::class,
            RoleSeeder::class,
            ShippingMethodSeeder::class,
            ShippingStatusSeeder::class,
            PaymentMethodOptionSeeder::class,
            AdminAccountSeeder::class,
            CourierSeeder::class,
        ]);
    }
}