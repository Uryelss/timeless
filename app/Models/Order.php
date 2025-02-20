<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_name',
        'items',
        'priority',
        'order_status',
        'total_amount',
        'customer_details',
        'payment_information'
    ];

    protected $casts = [
        'items' => 'array',
        'customer_details' => 'array',
        'payment_information' => 'array',
    ];
}
