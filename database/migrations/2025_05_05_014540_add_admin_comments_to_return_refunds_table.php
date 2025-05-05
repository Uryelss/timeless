<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAdminCommentsToReturnRefundsTable extends Migration
{
    public function up()
    {
        Schema::table('return_refunds', function (Blueprint $table) {
            $table->text('admin_comments')->nullable()->after('status');
        });
    }

    public function down()
    {
        Schema::table('return_refunds', function (Blueprint $table) {
            $table->dropColumn('admin_comments');
        });
    }
}
