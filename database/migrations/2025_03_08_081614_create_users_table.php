<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->unsignedBigInteger('role_id');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
}
