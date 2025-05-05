<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReturnRefund extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_id',
        'profile_id',
        'issue_type',
        'products',
        'reason',
        'refund_method',
        'refund_amount',
        'description',
        'images',
        'policy_confirmed',
        'status',
        'admin_comments',
    ];

    protected $casts = [
        'products' => 'array',
        'images' => 'array',
        'policy_confirmed' => 'boolean',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }
}
