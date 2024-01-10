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
        Schema::table('users', function (Blueprint $table) {
            //
            $table->string('surname', 100)->nullable();
            $table->string('city_of_birth', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('phone_number', 100)->nullable();
            $table->char('sex', 1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('surname');
            $table->dropColumn('city_of_birth');
            $table->dropColumn('country');
            $table->dropColumn('phone_number');
            $table->dropColumn('sex');
        });
    }
};
