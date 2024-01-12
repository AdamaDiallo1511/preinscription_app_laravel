<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class candidatez_preinscription extends Model
{
    use HasFactory;
    protected $fillable = [
        'user',
        'candidated',
        'create_at',
        'validate_users_information'
    ];
}
