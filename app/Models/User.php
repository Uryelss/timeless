<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'email',
        'username',
        'password',
        'role_id',  // Ensure role_id is added here for mass assignment
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Define the relationship with the Role model.
     *
     * Each user belongs to one role.
     */
    public function role()
    {
        return $this->belongsTo(Role::class);  // Each user belongs to one role
    }

    /**
     * Define the relationship with the Profile model.
     *
     * Each user has one profile.
     */
    public function profile()
    {
        return $this->hasOne(Profile::class);  // Each user has one profile
    }
}
