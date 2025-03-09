<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inventory extends Model
{
    use SoftDeletes;

    protected $table = 'inventory';

    protected $fillable = ['product_id', 'size', 'quantity', 'sold', 'stock_status'];

    public function product()
    {
        // Use 'product_id' to match your inventory table
        return $this->belongsTo(Product::class, 'product_id');
    }
}
