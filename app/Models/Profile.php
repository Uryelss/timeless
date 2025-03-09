<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Profile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'gender',
        'date_of_birth',
        'phone',
        'profile_image',
        'address'
    ];

    // Accessor: returns merged customer name (e.g., "John H. Doe")
    public function getCustomerNameAttribute()
    {
        $first = ucfirst($this->first_name);
        $middle = $this->middle_name ? strtoupper(substr($this->middle_name, 0, 1)) . '. ' : '';
        $last = ucfirst($this->last_name);
        return $first . ' ' . $middle . $last;
    }
}