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
        'barangay',
        'postal_code',
        'country',
        'phone',
        'is_default'
    ];

    // Append computed attributes to the JSON output.
    protected $appends = ['full_address'];

    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }

    public function shipping()
    {
        return $this->hasMany(Shipping::class);
    }

    // Computed accessor to get the full address as a single string.
    public function getFullAddressAttribute()
    {
        return "{$this->street}, {$this->barangay}, {$this->city}, {$this->state}, {$this->postal_code}, {$this->country}";
    }
}