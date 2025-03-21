<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// shipping migration
class CreateShippingTable extends Migration
{
    public function up()
    {
        Schema::create('shipping', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->unsignedBigInteger('payment_method_id')->nullable();
            $table->unsignedBigInteger('payment_status_id')->nullable();
            $table->unsignedBigInteger('address_id')->nullable();
            $table->dateTime('payment_date')->nullable();
            $table->string('tracking_number')->nullable();
            $table->unsignedBigInteger('shipping_method_id')->nullable();
            $table->unsignedBigInteger('shipping_status_id')->nullable();
            $table->decimal('shipping_total_amount', 10, 2)->default(0.00);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('shipping');
    }
}