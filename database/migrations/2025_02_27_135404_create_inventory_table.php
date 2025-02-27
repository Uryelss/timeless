<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->unique();
            $table->string('product_image');
            $table->string('product_name');
            $table->integer('stock_quantity')->default(0);
            $table->integer('sold')->default(0);
            $table->string('stock_status')->default('In Stock');
            $table->timestamps();
            $table->softDeletes(); // ✅ Supports Archiving

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('inventory');
    }
};
