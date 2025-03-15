<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'profile_id',
        'profile_name',
        'address_id',
        'items',
        'shipping_priority',
        'status',
        'total_amount',
        'order_date',
    ];

    protected $casts = [
        'items'      => 'array',
        'order_date' => 'datetime',
    ];
}