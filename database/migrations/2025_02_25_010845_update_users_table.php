<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->after('id'); // Adding username field
            $table->unsignedBigInteger('role_id')->after('updated_at')->nullable(); // Adding role_id field
            $table->dropColumn('name'); // Removing 'name' column
            $table->dropColumn('email_verified_at'); // Removing 'email_verified_at' column
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('username');
            $table->dropColumn('role_id');
            $table->string('name')->after('id');
            $table->timestamp('email_verified_at')->nullable()->after('email');
        });
    }
}
