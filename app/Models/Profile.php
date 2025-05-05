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
        'profile_image'
    ];

    // Automatically include the computed customer_name in JSON responses.
    protected $appends = ['customer_name'];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    // A profile belongs to a user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // A profile can have many addresses.
    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    // Get full customer name
    public function getCustomerNameAttribute()
    {
        $first = ucfirst($this->first_name);
        $middle = $this->middle_name ? strtoupper(substr($this->middle_name, 0, 1)) . '. ' : '';
        $last = ucfirst($this->last_name);
        return trim("$first $middle$last");
    }
    public function returnRefunds()
    {
        return $this->hasMany(ReturnRefund::class);
    }
}