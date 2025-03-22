<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'payment_method_id',
        'payment_status_id',
        'transaction_status_id',
        'payment_option',
        'order_id',
        'profile_id'
    ];

    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function paymentStatus()
    {
        return $this->belongsTo(PaymentStatus::class);
    }

    public function transactionStatus()
    {
        return $this->belongsTo(TransactionStatus::class, 'transaction_status_id');
    }
}
