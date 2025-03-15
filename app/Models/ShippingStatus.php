<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingStatus extends Model
{
    protected $fillable = ['name'];

    public function shippings()
    {
        return $this->hasMany(Shipping::class, 'shipping_status_id');
    }
}