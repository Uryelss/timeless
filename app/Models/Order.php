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

    public function updateStatus($newStatus, $details = null)
    {
        $this->order_status = $newStatus;
        $this->save();

        // Log the status change to order_status_history
        $this->statusHistory()->create([
            'status' => $newStatus,
            'timestamp' => now(),
            'details' => $details,
        ]);

        // Automatically generate tracking number when status is "shipped"
        if ($newStatus === 'shipped' && $this->shipping && !$this->shipping->tracking_number) {
            $date = now()->format('Ymd');
            $random = strtoupper(substr(uniqid(), -5));
            $trackingNumber = "TRK-{$date}-{$random}";
            $this->shipping->tracking_number = $trackingNumber;
            $this->shipping->save();
        }
    }
}