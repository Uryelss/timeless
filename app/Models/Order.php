<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'profile_id',
        'courier_id',
        'total_amount',
        'order_status',
        'order_date',
        'cancel_reason',
        'shipping_id',
    ];

    protected $casts = [
        'order_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        'payment_confirmed_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function courier()
    {
        return $this->belongsTo(Courier::class);
    }

    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }

    public function shipping()
    {
        return $this->hasOne(Shipping::class);
    }

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }
}