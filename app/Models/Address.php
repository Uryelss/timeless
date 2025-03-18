<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Address extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'profile_id',
        'street',
        'city',
        'state',
        'barangay', // Add this
        'postal_code',
        'country',
        'phone',
        'is_default',
        'is_pickup',
        'is_return'
    ];

    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }

    public function shipping()
    {
        return $this->hasMany(Shipping::class);
    }
}
