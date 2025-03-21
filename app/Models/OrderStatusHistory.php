<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderStatusHistory extends Model
{
    protected $table = 'order_status_history'; // Explicitly set the table name to match the migration
    protected $fillable = ['order_id', 'status', 'timestamp', 'details'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}