<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'profile_id',
        'total_amount',
        'order_status',
        'order_date',
        'shipping_id',
        'payment_confirmed_at',
        'shipped_at',
        'delivered_at',
        // 'cancelled_at', // Uncomment if added in the migration
    ];

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
