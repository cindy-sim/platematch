<?php

   use Illuminate\Database\Migrations\Migration;
   use Illuminate\Database\Schema\Blueprint;
   use Illuminate\Support\Facades\Schema;

   return new class extends Migration
   {
       public function up(): void
       {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('firebase_uid')->unique();
            $table->string('email');
            $table->string('name');
            $table->string('type')->nullable(); 
            $table->string('location')->nullable();
            $table->string('profile_photo')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

       public function down(): void
       {
           Schema::dropIfExists('users');
       }
   };