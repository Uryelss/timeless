<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifyUsersTable extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Add role_id foreign key
            $table->foreignId('role_id')->after('password')->constrained('roles')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the foreign key and column if rolling back
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });
    }
}
