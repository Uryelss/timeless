<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMissingColumnsToAddressesTable extends Migration
{
    public function up()
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->boolean('is_pickup')->default(false)->after('phone');
            $table->boolean('is_return')->default(false)->after('is_pickup');
            $table->boolean('is_default')->default(false)->after('is_return');
        });
    }

    public function down()
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->dropColumn(['is_pickup', 'is_return', 'is_default']);
        });
    }
}
