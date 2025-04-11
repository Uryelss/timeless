<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddImageToChatMessagesTable extends Migration
{
    public function up()
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            // Adds a new nullable string column 'image' after the 'is_read' column
            $table->string('image')->nullable()->after('is_read');
        });
    }

    public function down()
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            // Drop the 'image' column if the migration is rolled back
            $table->dropColumn('image');
        });
    }
}
