<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductsTable extends Migration
{
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            // These fields reference sub_categories table (assume foreign key constraints as needed)
            $table->unsignedBigInteger('brand_id');
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('movement_id');
            $table->unsignedBigInteger('strap_material_id');
            $table->unsignedBigInteger('gender_id');
            $table->decimal('price', 10, 2);
            $table->integer('quantity');
            $table->text('description');
            $table->string('main_image');
            $table->string('side_image_1')->nullable();
            $table->string('side_image_2')->nullable();
            $table->string('side_image_3')->nullable();
            // JSON column for sizes and their quantities; example: [{"size": "Small", "quantity": 5}, {...}]
            $table->json('sizes');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('products');
    }
}
