<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // ✅ Import SoftDeletes

class Product extends Model
{
    use HasFactory, SoftDeletes; // ✅ Use SoftDeletes

    protected $fillable = [
        'product_name',
        'product_image',
        'brand_id',
        'category_id',
        'movement_id',
        'strap_material_id',
        'gender_id',
        'size_id',
        'price',
        'quantity',
        'description'
    ];

    protected $casts = [
        'is_archived' => 'boolean',
    ];
    protected $dates = ['deleted_at']; // ✅ Track soft deletes



    // Relationships
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function movement()
    {
        return $this->belongsTo(Movement::class);
    }

    public function strapMaterial()
    {
        return $this->belongsTo(StrapMaterial::class);
    }

    public function gender()
    {
        return $this->belongsTo(Gender::class);
    }

    public function size()
    {
        return $this->belongsTo(Size::class);
    }
    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }
}
