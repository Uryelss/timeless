<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = ['profile_id', 'total_amount', 'order_status', 'order_date', 'shipping_id'];

    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }

    public function shipping()
    {
        return $this->hasOne(Shipping::class);
    }

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }

    public function statusHistory()
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    // Helper method to update status and log it in history
    public function updateStatus($newStatus, $details = null)
    {
        $this->order_status = $newStatus;
        $this->save();

        $this->statusHistory()->create([
            'status' => $newStatus,
            'timestamp' => now(),
            'details' => $details,
        ]);
    }
}