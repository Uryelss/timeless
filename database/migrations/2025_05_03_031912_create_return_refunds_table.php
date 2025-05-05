<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReturnRefundsTable extends Migration
{
    public function up()
    {
        Schema::create('return_refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('issue_type'); // 'received_with_issues' or 'not_received'
            $table->json('products')->nullable(); // Store selected products for return
            $table->string('reason'); // e.g., 'missing_part', 'wrong_item', 'damaged', 'defective'
            $table->string('refund_method'); // 'gcash' or 'reorder'
            $table->decimal('refund_amount', 10, 2);
            $table->text('description')->nullable();
            $table->json('images')->nullable(); // Store uploaded image paths
            $table->boolean('policy_confirmed')->default(false);
            $table->string('status')->default('pending'); // 'pending', 'approved', 'denied', 'completed'
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('return_refunds');
    }
}