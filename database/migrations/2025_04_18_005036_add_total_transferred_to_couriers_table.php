<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTotalTransferredToCouriersTable extends Migration
{
    
    public function up(): void
    {
        Schema::table('couriers', function (Blueprint $table) {
            $table->decimal('total_transferred', 10, 2)->default(0.00)->after('transfer_method');
        });
    }

    public function down(): void
    {
        Schema::table('couriers', function (Blueprint $table) {
            $table->dropColumn('total_transferred');
        });
    }
}
