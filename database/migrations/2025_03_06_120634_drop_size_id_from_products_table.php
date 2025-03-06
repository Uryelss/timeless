<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign(['size_id']);
            // Then drop the column
            $table->dropColumn('size_id');
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            // Re-add the column (you may need to adjust attributes as necessary)
            $table->unsignedBigInteger('size_id')->nullable();
            // Re-add the foreign key constraint
            $table->foreign('size_id')->references('id')->on('sizes')->onDelete('cascade');
        });
    }
};
