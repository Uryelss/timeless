<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run()
    {
        PaymentMethod::insert([
            ['name' => 'Cash on Delivery'],
            ['name' => 'Credit Card'],
            ['name' => 'Digital Wallet'],
        ]);
    }
}