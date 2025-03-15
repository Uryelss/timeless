<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateShippingStatusesTable extends Migration
{
    public function up()
    {
        Schema::create('shipping_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g., "Pending", "Shipped", "Delivered"
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('shipping_statuses');
    }
}