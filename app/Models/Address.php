<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Address extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'profile_id',
        'country',
        'street_address',
        'barangay',
        'province',
        'city',
        'postal_code',
        'phone',
    ];
}