<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaymentStatus;

class PaymentStatusSeeder extends Seeder
{
    public function run()
    {
        PaymentStatus::create(['name' => 'Pending']);
        PaymentStatus::create(['name' => 'Paid']);
        PaymentStatus::create(['name' => 'Failed']);
    }
}
