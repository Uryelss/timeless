<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaymentMethodOption;

class PaymentMethodOptionSeeder extends Seeder
{
    public function run()
    {
        // For the Digital Wallet payment method (assumed id = 3)
        PaymentMethodOption::create([
            'payment_method_id' => 3,
            'option_name' => 'G-Cash'
        ]);

        PaymentMethodOption::create([
            'payment_method_id' => 3,
            'option_name' => 'PayMaya'
        ]);

        // For the Credit Card payment method (assumed id = 2)
        PaymentMethodOption::create([
            'payment_method_id' => 2,
            'option_name' => 'Master Visa Card'
        ]);
    }
}