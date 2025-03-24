<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemovePaymentDateFromShippingTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('shipping', function (Blueprint $table) {
            if (Schema::hasColumn('shipping', 'payment_date')) {
                $table->dropColumn('payment_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('shipping', function (Blueprint $table) {
            $table->timestamp('payment_date')->nullable()->after('address_id');
        });
    }
}
