<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class validate_documents extends Model
{
    use HasFactory;
    protected $fillable = [
        'user',
        'create_at',
        'document'
    ];
}
