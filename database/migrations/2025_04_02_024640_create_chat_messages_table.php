<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChatMessagesTable extends Migration
{
    public function up()
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->bigIncrements('id');
            // The conversation is linked to a specific user (the chat initiator)
            $table->unsignedBigInteger('user_id');
            // Use sender_type to indicate who sent the message ("user" or "admin")
            $table->enum('sender_type', ['user', 'admin']);
            $table->text('message');
            // Field to track if the user message has been read by admin
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            // Foreign key constraint to the users table
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('chat_messages');
    }
}
