<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrderStatusHistoryTable extends Migration
{
    public function up()
    {
        Schema::create('order_status_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id');
            $table->string('status'); // e.g., 'pending', 'processing', 'shipped', 'delivered', 'completed'
            $table->dateTime('timestamp');
            $table->text('details')->nullable(); // Optional: reason or notes
            $table->timestamps(); // Adds created_at and updated_at for the history record itself
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('order_status_history');
    }
}
