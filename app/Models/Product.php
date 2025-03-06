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
        'product_image',
        'brand_id',
        'category_id',
        'movement_id',
        'strap_material_id',
        'gender_id',
        'price',
        'quantity',
        'description'
    ];

    protected $dates = ['deleted_at'];

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

    // Remove the singular relation
    // public function size()
    // {
    //     return $this->belongsTo(Size::class);
    // }

    // Only use the many-to-many relation:
    // In App\Models\Product.php

    public function sizes()
    {
        return $this->belongsToMany(Size::class, 'product_size');
    }


    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }
}
