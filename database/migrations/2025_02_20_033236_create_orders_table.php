<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id(); // Auto-increment ID
            $table->string('customer_name'); // Customer Name
            $table->json('items'); // Store items as JSON (array of products)
            $table->enum('priority', ['standard', 'expedited'])->default('standard'); // Shipping Type
            $table->enum('order_status', ['pending', 'confirmed', 'processing', 'PHcompleted'])->default('pending'); // Order Status
            $table->decimal('total_amount', 10, 2); // Total Price
            $table->timestamp('date_added')->useCurrent(); // Date Added
            $table->timestamp('last_updated')->useCurrent()->useCurrentOnUpdate(); // Last Updated
            $table->json('customer_details')->nullable(); // Address, Contact, etc.
            $table->json('payment_information')->nullable(); // Payment Method, Transaction ID, etc.
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('orders');
    }
};
