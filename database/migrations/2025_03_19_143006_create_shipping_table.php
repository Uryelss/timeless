<?php



use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateShippingTable extends Migration
{
    public function up()
    {
        Schema::create('shipping', function (Blueprint $table) {
            $table->engine = 'InnoDB'; // Ensure InnoDB engine is used

            $table->id(); // Primary Key

            // Foreign key columns
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('payment_method_id');
            $table->unsignedBigInteger('payment_status_id');
            $table->unsignedBigInteger('address_id'); // Make sure this matches the 'id' column in 'addresses'
            $table->unsignedBigInteger('shipping_method_id');
            $table->unsignedBigInteger('shipping_status_id');

            $table->timestamp('payment_date')->nullable();
            $table->string('tracking_number')->nullable();
            $table->decimal('shipping_total_amount', 10, 2);
            $table->timestamps();
            $table->softDeletes();

            // Foreign Key Constraints
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('payment_method_id')->references('id')->on('payment_methods')->onDelete('cascade');
            $table->foreign('payment_status_id')->references('id')->on('payment_statuses')->onDelete('cascade');
            $table->foreign('address_id')->references('id')->on('addresses')->onDelete('cascade');
            $table->foreign('shipping_method_id')->references('id')->on('shipping_methods')->onDelete('cascade');
            $table->foreign('shipping_status_id')->references('id')->on('shipping_statuses')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('shipping');
    }
}
