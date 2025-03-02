<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Address extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'country',
        'street_address',
        'address_line1',
        'barangay',
        'province',
        'city',
        'postal_code',
        'phone_number',
        'is_default',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
