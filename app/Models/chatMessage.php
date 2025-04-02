<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    protected $fillable = ['user_id', 'sender_type', 'message', 'is_read'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
