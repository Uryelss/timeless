<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrdersTable extends Migration
{
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id(); // Order ID
            // You can store a reference to the customer if you have a customers table.
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->string('customer_name');
            // If you plan on storing order items as JSON (list of items) or change as needed.
            $table->json('items');
            // Priority: expedited or standard
            $table->enum('priority', ['expedited', 'standard'])->default('standard');
            // Order status: completed, pending, others
            $table->enum('order_status', ['completed', 'pending', 'others'])->default('pending');
            $table->decimal('total_amount', 10, 2);
            // Order date; you could also use timestamps() if you prefer created_at for order date.
            $table->timestamp('order_date')->useCurrent();
            // Soft deletes will help with the archive functionality.
            $table->softDeletes();
            $table->timestamps();
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('orders');
    }
}
