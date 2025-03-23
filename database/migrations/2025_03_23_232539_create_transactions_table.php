<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionsTable extends Migration
{
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            // Use profile_id instead of user_id
            $table->unsignedBigInteger('profile_id'); // Customer Profile ID
            $table->unsignedBigInteger('order_id');     // Reference to orders table
            $table->unsignedBigInteger('payment_method_id');
            $table->unsignedBigInteger('payment_status_id');
            $table->unsignedBigInteger('transaction_status_id')->default(1); // Default to "pending"
            // Optional field for a specific sub‑option (e.g., "G‑Cash")
            $table->string('payment_option')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign key constraints
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('payment_method_id')->references('id')->on('payment_methods')->onDelete('cascade');
            $table->foreign('payment_status_id')->references('id')->on('payment_statuses')->onDelete('cascade');
            $table->foreign('transaction_status_id')->references('id')->on('transaction_statuses')->onDelete('restrict');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transactions');
    }
}