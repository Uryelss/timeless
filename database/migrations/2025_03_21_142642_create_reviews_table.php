<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// reviews migration
class CreateReviewsTable extends Migration
{
    public function up()
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('product_id')->nullable();
            $table->text('comment')->nullable();
            $table->integer('rating')->nullable();
            $table->timestamps();
            $table->boolean('is_archived')->default(false);
        });
    }

    public function down()
    {
        Schema::dropIfExists('reviews');
    }
}