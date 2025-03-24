<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RevertTransactionPaymentOption extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Drop the foreign key and column if they exist.
            if (Schema::hasColumn('transactions', 'payment_option_id')) {
                $table->dropForeign(['payment_option_id']);
                $table->dropColumn('payment_option_id');
            }
            // Add back the free-form payment_option column.
            $table->string('payment_option')->nullable()->after('payment_status_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('payment_option');
            $table->unsignedBigInteger('payment_option_id')->nullable()->after('payment_status_id');
            $table->foreign('payment_option_id')
                ->references('id')
                ->on('payment_method_options')
                ->onDelete('set null');
        });
    }
}
