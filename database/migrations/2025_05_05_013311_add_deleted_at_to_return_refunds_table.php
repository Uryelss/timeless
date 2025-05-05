<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDeletedAtToReturnRefundsTable extends Migration
{
    public function up()
    {
        Schema::table('return_refunds', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::table('return_refunds', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
}
