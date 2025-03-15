<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = ['profile_id', 'shipping_id', 'total_amount', 'order_status', 'order_date'];

    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }

    public function shipping()
    {
        return $this->belongsTo(Shipping::class);
    }

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }
}