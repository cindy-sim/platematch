<?php

   namespace Database\Seeders;

   use App\Models\User;
   use App\Models\Like;
   use Illuminate\Database\Seeder;

   class UserSeeder extends Seeder
   {
       public function run(): void
       {
        $kol1 = User::create([
            'name' => 'John',
            'email' => 'john@example.com',
            'type' => 'KOL',
            'location' => 'New York',
            'profile_photo' => 'https://storage.googleapis.com/bucket/kol1.jpg',
        ]);

        $kol2 = User::create([
            'name' => 'Thomas',
            'email' => 'thomas@example.com',
            'type' => 'KOL',
            'location' => 'San Francisco',
            'profile_photo' => 'https://storage.googleapis.com/bucket/kol2.jpg',
        ]);

        // Create Restaurants
        $restaurant1 = User::create([
            'name' => 'RestoA',
            'email' => 'resto1@example.com',
            'type' => 'Restaurant',
            'location' => 'Los Angeles',
            'profile_photo' => 'https://storage.googleapis.com/bucket/restaurant1.jpg',
        ]);

        $restaurant2 = User::create([
            'name' => 'RestoB',
            'email' => 'resto2@example.com',
            'type' => 'Restaurant',
            'location' => 'Chicago',
            'profile_photo' => 'https://storage.googleapis.com/bucket/restaurant2.jpg',
        ]);

        // Create Likes
        // KOL One likes Restaurant A
        Like::create([
            'from_user_id' => $kol1->id,
            'to_user_id' => $restaurant1->id,
        ]);

        // Restaurant A likes KOL One (mutual like)
        Like::create([
            'from_user_id' => $restaurant1->id,
            'to_user_id' => $kol1->id,
        ]);

        // Restaurant B likes KOL One (one-way like)
        Like::create([
            'from_user_id' => $restaurant2->id,
            'to_user_id' => $kol1->id,
        ]);

        // KOL Two likes Restaurant B
        Like::create([
            'from_user_id' => $kol2->id,
            'to_user_id' => $restaurant2->id,
        ]);
       }
   }