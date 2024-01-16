<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class preinscription extends Model
{
    use HasFactory;
    protected $fillable = [
        'formation',
        'document',
        'user',
        'created_at',
    ];
}
