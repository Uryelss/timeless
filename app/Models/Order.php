<?php

namespace App\Models;

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = ['customer_name', 'items', 'priority', 'order_status', 'total_amount'];

    protected $casts = [
        'items' => 'array', // Convert JSON to array automatically
    ];
}
