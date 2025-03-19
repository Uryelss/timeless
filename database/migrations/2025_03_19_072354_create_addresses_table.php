<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAddressesTable extends Migration
{
    public function up()
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->engine = 'InnoDB'; // Ensure InnoDB engine is used

            $table->id(); // Primary Key
            $table->unsignedBigInteger('profile_id'); // Make sure it's the same type as 'id' in 'profiles'
            $table->string('street');
            $table->string('city');
            $table->string('state');
            $table->string('barangay')->nullable();
            $table->string('postal_code');
            $table->string('country');
            $table->string('phone');
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->softDeletes();

            // Foreign Key Constraint
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('addresses');
    }
}
