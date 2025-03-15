<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shipping extends Model
{
    use SoftDeletes;

    // Explicitly set the table name to 'shipping'
    protected $table = 'shipping';

    protected $fillable = [
        'order_id',
        'payment_method_id',
        'payment_status_id',
        'address_id',
        'shipping_method_id',
        'shipping_status_id',
        'shipping_total_amount',
        'tracking_number',
    ];

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

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function shippingMethod()
    {
        return $this->belongsTo(ShippingMethod::class, 'shipping_method_id');
    }
    public function shippingStatus()
    {
        return $this->belongsTo(ShippingStatus::class);
    }
}