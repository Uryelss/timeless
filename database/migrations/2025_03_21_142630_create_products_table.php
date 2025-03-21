<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// products migration
class CreateProductsTable extends Migration
{
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('product_name')->nullable();
            $table->unsignedBigInteger('brand_id')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->unsignedBigInteger('movement_id')->nullable();
            $table->unsignedBigInteger('strap_material_id')->nullable();
            $table->unsignedBigInteger('gender_id')->nullable();
            $table->decimal('price', 10, 2)->default(0.00);
            $table->integer('quantity')->default(0);
            $table->text('description')->nullable();
            $table->string('main_image')->nullable();
            $table->string('side_image_1')->nullable();
            $table->string('side_image_2')->nullable();
            $table->string('side_image_3')->nullable();
            $table->string('sizes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('products');
    }
}