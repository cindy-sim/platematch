<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function profile(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                Log::warning('No authenticated user found for profile request');
                return response()->json(['error' => 'Unauthorized: No user found'], 401);
            }

            Log::info('Fetched user profile for auth/profile', [
                'user_id' => $user->id,
                'email' => $user->email,
                'type' => $user->type,
            ]);

            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'type' => $user->type,
                'location' => $user->location,
                'profile_photo' => $user->profile_photo,
                'description' => $user->description,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching user profile in auth/profile', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    public function signup(Request $request)
    {
        $request->validate([
            'type' => 'required|in:KOL,Restaurant',
        ]);

        $user = $request->user();
        if ($user->type) {
            Log::warning('User type already set', ['email' => $user->email, 'type' => $user->type]);
            return response()->json(['message' => 'User type already set'], 400);
        }

        $user->type = $request->input('type');
        $user->save();

        Log::info('User type set during signup', ['email' => $user->email, 'type' => $user->type]);
        return response()->json(['message' => 'User created', 'user' => $user]);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->type) {
            Log::warning('No user or user type found for index request', ['user' => $user]);
            return response()->json(['message' => 'User type required'], 400);
        }
    
        $oppositeType = $user->type === 'KOL' ? 'Restaurant' : 'KOL';
    
        Log::info('Fetching all users for type, excluding users liked by the authenticated user', [
            'user_type' => $user->type,
            'opposite_type' => $oppositeType,
            'user_id' => $user->id,
        ]);
    
        $start = microtime(true);
        $likedUserIds = \DB::table('likes')
            ->where('from_user_id', $user->id)
            ->pluck('to_user_id')
            ->toArray();
        Log::debug('Time to fetch liked user IDs', ['duration' => microtime(true) - $start]);
    
        Log::debug('Users liked by the authenticated user', [
            'user_id' => $user->id,
            'liked_user_ids' => $likedUserIds,
        ]);
    
        $queryStart = microtime(true);
        $query = User::where('type', $oppositeType)
            ->whereNotIn('id', $likedUserIds)
            ->where('id', '!=', $user->id)
            ->select(['id', 'name', 'type', 'location', 'description', 'profile_photo']);
    
        $totalCount = $query->count();
        $users = $query->get(); 
    
        Log::debug('Time to fetch users', ['duration' => microtime(true) - $queryStart]);
    
        Log::info('Fetched all users', [
            'user_id' => $user->id,
            'total_count' => $totalCount,
            'returned_users_count' => $users->count(),
        ]);
    
        return response()->json([
            'users' => $users,
            'totalCount' => $totalCount,
        ]);
    }

    // {
    //     $user = $request->user();
    //     if (!$user || !$user->type) {
    //         Log::warning('No user or user type found for index request', ['user' => $user]);
    //         return response()->json(['message' => 'User type required'], 400);
    //     }

    //     $oppositeType = $user->type === 'KOL' ? 'Restaurant' : 'KOL';
    //     Log::info('Fetching users for type', ['user_type' => $user->type, 'opposite_type' => $oppositeType]);

    //     return User::where('type', $oppositeType)->get();
    // }

    public function show($id)
    {
        try {
            $user = User::findOrFail($id);
            Log::info('Fetched user profile', ['user_id' => $id]);
            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'type' => $user->type,
                'location' => $user->location,
                'profile_photo' => $user->profile_photo,
                'description' => $user->description,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('User not found', ['user_id' => $id]);
            return response()->json(['error' => 'User not found'], 404);
        }
    }

    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|regex:/^[\w\s.,!?()-]*$/',
            'location' => 'nullable|string|max:255|regex:/^[\w\s.,!?()-]*$/',
            'description' => 'nullable|string|max:1000|regex:/^[\w\s.,!?()-]*$/',
            'profile_photo' => 'nullable|string|url',
        ]);

        $user = $request->user();
        $user->update($request->only(['name', 'location', 'profile_photo', 'description']));
        return $user;
    }
}