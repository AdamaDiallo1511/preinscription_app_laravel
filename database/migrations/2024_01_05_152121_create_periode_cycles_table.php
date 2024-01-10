<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('periode_cycles', function (Blueprint $table) {
            $table->id();
            $table->string('cycle_periode');
            $table->foreignId('cycles_id')->constrained()->cascadeOnDelete(true);
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('periode_cycles');
    }
};
