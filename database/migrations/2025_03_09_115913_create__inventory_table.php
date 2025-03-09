<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInventoryTable extends Migration
{
    public function up()
    {
        Schema::create('Inventory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products');
            $table->string('size'); // e.g., "22mm", "24mm", etc.
            $table->integer('quantity');
            $table->integer('sold')->default(0);
            $table->string('stock_status')->default('In Stock'); // e.g., "In Stock", "Low Stock", "Out of Stock"
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('inventory');
    }
}
