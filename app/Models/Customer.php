<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    // Use the profiles table
    protected $table = 'profiles';

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
    ];

    // Accessor to compute full_name (e.g., "John H. Doe")
    public function getFullNameAttribute()
    {
        $first = ucfirst($this->first_name);
        $last = ucfirst($this->last_name);
        $middle = $this->middle_name ? strtoupper(substr($this->middle_name, 0, 1)) . ". " : "";
        return trim("$first $middle$last");
    }
}