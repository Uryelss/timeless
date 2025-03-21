<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePaymentMethodOptionsTable extends Migration
{
    public function up()
    {
        Schema::create('payment_method_options', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payment_method_id');
            $table->string('option_name'); // e.g., "G-Cash", "PayMaya", "Master Visa Card"
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('payment_method_id')->references('id')->on('payment_methods')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_method_options');
    }
}