<?php

  namespace App\Providers;

  use Illuminate\Support\ServiceProvider;
  use Kreait\Firebase\Factory;
  use Kreait\Firebase\Auth as FirebaseAuth;

  class FirebaseServiceProvider extends ServiceProvider
  {
      public function register()
      {
          $this->app->singleton(FirebaseAuth::class, function ($app) {
              $factory = (new Factory)->withServiceAccount(config('services.firebase.credentials'));
              return $factory->createAuth();
          });
      }

      public function boot()
      {
          //
      }
  }