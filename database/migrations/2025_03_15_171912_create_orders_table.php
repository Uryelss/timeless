<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrdersTable extends Migration
{
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained('profiles')->onDelete('cascade');
            $table->foreignId('shipping_id')->nullable()->constrained('shipping')->onDelete('set null');
            $table->decimal('total_amount', 10, 2);
            $table->enum('order_status', ['pending', 'completed', 'cancelled', 'processing'])->default('pending');
            $table->timestamp('order_date')->useCurrent();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('orders');
    }
}