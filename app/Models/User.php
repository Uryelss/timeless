<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes; // ✅ Soft Deletes

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes; // ✅ Enables soft delete

    protected $fillable = [
        'email',
        'username',
        'password',
        'role_id',
        'status',  // ✅ Ensure status is included
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    protected $dates = ['deleted_at']; // ✅ Soft delete tracking

    // Relationships
    public function role()
    {
        return $this->belongsTo(Role::class);
    }
}
