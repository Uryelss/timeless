<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'product_name',
        'brand_id',
        'category_id',
        'movement_id',
        'strap_material_id',
        'gender_id',
        'price',
        'quantity',
        'description',
        'main_image',
        'side_image_1',
        'side_image_2',
        'side_image_3',
        'sizes',
    ];

    protected $casts = [
        'sizes' => 'array',
    ];

    protected $appends = ['average_rating', 'image'];

    // Relationships
    public function brand()
    {
        return $this->belongsTo(SubCategory::class, 'brand_id');
    }

    public function category()
    {
        return $this->belongsTo(SubCategory::class, 'category_id');
    }

    public function movement()
    {
        return $this->belongsTo(SubCategory::class, 'movement_id');
    }

    public function strapMaterial()
    {
        return $this->belongsTo(SubCategory::class, 'strap_material_id');
    }

    public function gender()
    {
        return $this->belongsTo(SubCategory::class, 'gender_id');
    }

    public function inventory()
    {
        return $this->hasMany(Inventory::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    // Accessors
    public function getAverageRatingAttribute()
    {
        $average = $this->reviews()->avg('rating');
        return $average ? round($average, 1) : 0; // Round to 1 decimal place, default to 0 if no reviews
    }

    public function getImageAttribute()
    {
        return $this->main_image ?? $this->side_image_1 ?? $this->side_image_2 ?? $this->side_image_3 ?? null;
    }
}