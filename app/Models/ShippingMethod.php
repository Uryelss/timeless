<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ShippingMethod extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'cost'];

    public function shipping()
    {
        return $this->hasMany(Shipping::class);
    }
}