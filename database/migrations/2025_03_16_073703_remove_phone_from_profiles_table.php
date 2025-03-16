<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemovePhoneFromProfilesTable extends Migration
{
    public function up()
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn('phone');
        });
    }

    public function down()
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('date_of_birth');
        });
    }
}
