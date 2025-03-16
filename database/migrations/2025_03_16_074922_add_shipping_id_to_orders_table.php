<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddShippingIdToOrdersTable extends Migration
{
    public function up()
{
    Schema::table('orders', function (Blueprint $table) {
        $table->unsignedBigInteger('shipping_id')->nullable();
    });
}
public function down()
{
    Schema::table('orders', function (Blueprint $table) {
        $table->dropColumn('shipping_id');
    });
}

}
