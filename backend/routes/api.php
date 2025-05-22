
<?php

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\LikeController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth.firebase')->group(function () {
    Route::get('/auth/profile', [UserController::class, 'profile']);
    Route::post('/signup', [UserController::class, 'signup']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users', [UserController::class, 'update']);
    Route::post('/likes', [LikeController::class, 'store']);
    Route::get('/likes/mutual', [LikeController::class, 'mutual']);
    Route::get('/likes/received', [LikeController::class, 'received']);
    Route::get('/likes/sent', [LikeController::class, 'sent']);
});

Route::get('/health', fn() => response()->json(['status' => 'ok']));