<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'courier_id')) {
                $table->unsignedBigInteger('courier_id')->nullable()->after('profile_id');
                $table->foreign('courier_id')
                      ->references('id')
                      ->on('couriers')
                      ->onDelete('set null');
            }
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'courier_id')) {
                $table->dropForeign(['courier_id']);
                $table->dropColumn('courier_id');
            }
        });
    }
};
