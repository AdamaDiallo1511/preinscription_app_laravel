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
        Schema::create('statut_preinscriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('preinscription')->nullable(false);
            $table->foreign('preinscription')->references('id')->on('users')->onDelete('cascade');
            $table->tinyInteger('statut')->nullable(false)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('statut_preinscriptions');
    }
};
