<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Courier extends Model
{
    protected $fillable = ['name', 'email', 'is_fake'];

    public function orders()
    {
        return $this->hasMany(Order::class, 'courier_id');
    }
}
