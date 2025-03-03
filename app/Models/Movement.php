<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // ✅ Add SoftDeletes

class Movement extends Model
{
    use HasFactory, SoftDeletes; // ✅ Enable SoftDeletes

    protected $fillable = ['name'];

    protected $dates = ['deleted_at']; // ✅ Track deleted_at
}
