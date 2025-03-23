<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TransactionStatus;

class TransactionStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            ['name' => 'Pending'],
            ['name' => 'Processing'],
            ['name' => 'Completed'],
            ['name' => 'Failed'],
            ['name' => 'Refunded'],
            ['name' => 'Cancelled'],
        ];

        foreach ($statuses as $status) {
            TransactionStatus::updateOrCreate(['name' => $status['name']], $status);
        }

        echo "Transaction statuses seeded successfully!\n";
    }
}
