<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateTransactionsForPaymentOption extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Drop the old payment_option column if it exists.
            if (Schema::hasColumn('transactions', 'payment_option')) {
                $table->dropColumn('payment_option');
            }
            // Add new payment_option_id column.
            $table->unsignedBigInteger('payment_option_id')->nullable()->after('payment_status_id');
            // Set up a foreign key constraint referencing payment_method_options table.
            $table->foreign('payment_option_id')
                ->references('id')
                ->on('payment_method_options')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Drop the foreign key and column.
            $table->dropForeign(['payment_option_id']);
            $table->dropColumn('payment_option_id');
            // Optionally, re-add the payment_option column as a string.
            $table->string('payment_option')->nullable()->after('payment_status_id');
        });
    }
}
