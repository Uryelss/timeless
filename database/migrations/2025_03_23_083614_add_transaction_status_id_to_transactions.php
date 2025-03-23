<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('transaction_status_id')->nullable()->after('payment_status_id');
            $table->foreign('transaction_status_id')
                ->references('id')
                ->on('transaction_statuses')
                ->onDelete('SET NULL');
        });
    }

    public function down()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['transaction_status_id']);
            $table->dropColumn('transaction_status_id');
        });
    }
};
