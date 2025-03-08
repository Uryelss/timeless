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
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
