<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_name',
        'price',
        'category',
        'brand',
        'movement',
        'strap_material',
        'gender',
        'size',
        'product_image'
    ];

    protected $dates = ['deleted_at'];
}
