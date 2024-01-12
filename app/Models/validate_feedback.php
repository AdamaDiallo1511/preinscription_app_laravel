<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class validate_feedback extends Model
{
    use HasFactory;
    protected $fillable = [
        'user',
        'create_at',
        'validate_feedback',
    ];
}
