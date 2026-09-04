<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invitation extends Model
{
    protected $fillable = [
        'passcode',
        'phone',
        'slug',
        'url',
        'bride',
        'groom',
        'event_date',
        'event_date_formatted',
        'package',
        'active_until',
    ];

    protected $casts = [
        'event_date' => 'datetime',
    ];
}