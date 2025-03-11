<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    protected $fillable = [
        'profile_id',
        'street',
        'city',
        'brgy',
        'country',
        'postal_code'
    ];

    // Each address belongs to a profile.
    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }
}
