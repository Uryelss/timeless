<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentStatus extends Model
{
    use SoftDeletes;

    protected $fillable = ['name'];

    public function shipping()
    {
        return $this->hasMany(Shipping::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

}