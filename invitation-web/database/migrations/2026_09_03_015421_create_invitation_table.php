<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitations', function (Blueprint $table) {
            $table->id();
            $table->string('passcode')->unique();
            $table->string('phone');
            $table->string('slug')->unique();
            $table->string('url');
            $table->string('bride');
            $table->string('groom');
            $table->dateTime('event_date');
            $table->string('event_date_formatted');
            $table->string('package');
            $table->string('active_until');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};