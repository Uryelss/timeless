<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            RoleSeeder::class,
            AdminAccountSeeder::class,
            PaymentMethodSeeder::class,
            PaymentStatusSeeder::class,
            ShippingStatusSeeder::class,
            ShippingMethodSeeder::class,
            PaymentMethodOptionSeeder::class,
            TransactionStatusSeeder::class,
        ]);
    }
}
