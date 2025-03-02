<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->softDeletes(); // ✅ Adds `deleted_at` column
        });
    }

    public function down()
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropSoftDeletes(); // ✅ Remove `deleted_at` on rollback
        });
    }
};
