<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemovePhoneFromProfilesTable extends Migration
{
    public function up()
    {
        Schema::table('profiles', function (Blueprint $table) {
            // Remove the 'phone' column from the profiles table
            $table->dropColumn('phone');
        });
    }

    public function down()
    {
        Schema::table('profiles', function (Blueprint $table) {
            // Add the 'phone' column back if we rollback
            $table->string('phone')->nullable()->after('date_of_birth');
        });
    }
}
