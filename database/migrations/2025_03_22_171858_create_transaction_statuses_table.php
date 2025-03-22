<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class FixTransactionsTableRemoveTransactionStatus extends Migration
{
    public function up()
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Drop the old transaction_status column
            $table->dropColumn('transaction_status');

            // Ensure transaction_status_id exists and is nullable
            if (!Schema::hasColumn('transactions', 'transaction_status_id')) {
                $table->unsignedBigInteger('transaction_status_id')->nullable()->after('payment_status_id');
                $table->foreign('transaction_status_id')
                    ->references('id')
                    ->on('transaction_statuses')
                    ->onDelete('set null');
            }
        });
    }

    public function down()
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Revert by adding transaction_status back as a string
            $table->string('transaction_status')->nullable()->after('transaction_status_id');

            // Optionally drop transaction_status_id if it was added (for rollback purposes)
            // $table->dropForeign(['transaction_status_id']);
            // $table->dropColumn('transaction_status_id');
        });
    }
}
