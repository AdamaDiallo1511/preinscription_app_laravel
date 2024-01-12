<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class validate_users_informations extends Model
{
    use HasFactory;
    protected $fillable = [
        'user',
        'create_at',
        'validate_users_information'
    ];
}
