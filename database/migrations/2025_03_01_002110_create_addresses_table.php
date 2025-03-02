<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAddressesTable extends Migration
{
    public function up()
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('country');
            $table->string('street_address');
            $table->string('address_line1')->nullable(); // Optional second line
            $table->string('barangay');
            $table->string('province');
            $table->string('city');
            $table->string('postal_code');
            $table->string('phone_number');
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->softDeletes(); // Enables soft delete
        });
    }

    public function down()
    {
        Schema::dropIfExists('addresses');
    }
}
