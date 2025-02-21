<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    protected $fillable = ['username', 'email', 'password', 'role_id'];

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id'); // Ensure Role model exists
    }

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }
}
