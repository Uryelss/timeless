<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Courier extends Model
{
    protected $fillable = ['name', 'phone', 'address', 'transfer_method'];

}
