<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasFactory;

    protected $fillable = [
        'firebase_uid',
        'name',
        'email',
        'type',
        'location',
        'profile_photo',
        'description',
    ];

    public function likesGiven()
    {
        return $this->hasMany(Like::class, 'from_user_id');
    }

    public function likesReceived()
    {
        return $this->hasMany(Like::class, 'to_user_id');
    }
}