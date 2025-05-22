<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;

class LikeController extends Controller
{
    public function store(Request $request)
    // {
    //     $request->validate([
    //         'liked_user_id' => 'required|exists:users,id',
    //     ]);

    //     $user = $request->user();
    //     $likedUserId = $request->input('liked_user_id');

    //     // Prevent self-likes
    //     if ($user->id === $likedUserId) {
    //         Log::warning('User attempted to like themselves', ['user_id' => $user->id]);
    //         return response()->json(['error' => 'Cannot like yourself'], 400);
    //     }

    //     // Check for existing like
    //     $existingLike = Like::where('from_user_id', $user->id)
    //         ->where('to_user_id', $likedUserId)
    //         ->exists();

    //     if ($existingLike) {
    //         Log::info('Duplicate like attempted', ['from_user_id' => $user->id, 'to_user_id' => $likedUserId]);
    //         return response()->json(['error' => 'Already liked this user'], 400);
    //     }

    //     try {
    //         $like = Like::create([
    //             'from_user_id' => $user->id,
    //             'to_user_id' => $likedUserId,
    //         ]);

    //         // Check for mutual like
    //         $mutualLike = Like::where('from_user_id', $likedUserId)
    //             ->where('to_user_id', $user->id)
    //             ->exists();

    //         Log::info('Like created', [
    //             'from_user_id' => $user->id,
    //             'to_user_id' => $like->to_user_id,
    //             'from_type' => $user->type,
    //             'mutual' => $mutualLike,
    //         ]);

    //         return response()->json([
    //             'like' => $like,
    //             'mutual' => $mutualLike,
    //         ], 201);
    //     } catch (QueryException $e) {
    //         if ($e->getCode() === '23505') { 
    //             Log::warning('Duplicate like detected by database', ['from_user_id' => $user->id, 'to_user_id' => $likedUserId]);
    //             return response()->json(['error' => 'Already liked this user'], 400);
    //         }
    //         Log::error('Like creation failed', ['error' => $e->getMessage()]);
    //         return response()->json(['error' => 'Failed to create like'], 500);
    //     }
    // }
    {
        $start = microtime(true);
    
        $validationStart = microtime(true);
        $request->validate([
            'liked_user_id' => 'required|exists:users,id',
        ]);
        Log::debug('Time to validate liked_user_id', ['duration' => microtime(true) - $validationStart]);
    
        $user = $request->user();
        $likedUserId = $request->input('liked_user_id');
    
        if ($user->id === $likedUserId) {
            Log::warning('User attempted to like themselves', ['user_id' => $user->id]);
            return response()->json(['error' => 'Cannot like yourself'], 400);
        }
    
        $insertStart = microtime(true);
        $inserted = \DB::insert(
            'INSERT INTO likes (from_user_id, to_user_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW()) ON CONFLICT (from_user_id, to_user_id) DO NOTHING',
            [$user->id, $likedUserId]
        );
        Log::debug('Time to insert like', ['duration' => microtime(true) - $insertStart]);
    
        if (!$inserted) {
            Log::info('Duplicate like attempted', ['from_user_id' => $user->id, 'to_user_id' => $likedUserId]);
            return response()->json(['error' => 'Already liked this user'], 400);
        }
    
        $mutualStart = microtime(true);
        $mutualLike = \DB::table('likes')
            ->where('from_user_id', $likedUserId)
            ->where('to_user_id', $user->id)
            ->select('id')
            ->first() !== null;
        Log::debug('Time to check mutual like', ['duration' => microtime(true) - $mutualStart]);
    
        Log::info('Like created', [
            'from_user_id' => $user->id,
            'to_user_id' => $likedUserId,
            'from_type' => $user->type,
            'mutual' => $mutualLike,
        ]);
    
        Log::info('Total time for POST /likes', ['duration' => microtime(true) - $start]);
    
        return response()->json([
            'like' => [
                'from_user_id' => $user->id,
                'to_user_id' => $likedUserId,
            ],
            'mutual' => $mutualLike,
        ], 201);
    }

    public function sent(Request $request)
    {
        $user = $request->user();
        $likes = Like::where('from_user_id', $user->id)
            ->with('to_user')
            ->get();

        $formattedLikes = $likes->map(function ($like) use ($user) {
            $toUser = $like->to_user;
            return [
                'id' => $toUser->id,
                'name' => $toUser->name,
                'type' => $toUser->type,
                'location' => $toUser->location,
                'profile_photo' => $toUser->profile_photo,
                'mutual' => Like::where('from_user_id', $toUser->id)
                    ->where('to_user_id', $user->id)
                    ->exists(),
            ];
        });

        Log::info('Fetched sent likes', ['user_id' => $user->id, 'count' => $formattedLikes->count()]);
        return response()->json($formattedLikes);
    }

    public function received(Request $request)
    {
        $user = $request->user();
        $likes = Like::where('to_user_id', $user->id)
            ->with('from_user')
            ->get();

        $formattedLikes = $likes->map(function ($like) use ($user) {
            $fromUser = $like->from_user;
            return [
                'id' => $fromUser->id,
                'name' => $fromUser->name,
                'type' => $fromUser->type,
                'location' => $fromUser->location,
                'profile_photo' => $fromUser->profile_photo,
                'mutual' => Like::where('from_user_id', $user->id)
                    ->where('to_user_id', $fromUser->id)
                    ->exists(),
            ];
        });

        Log::info('Fetched received likes', ['user_id' => $user->id, 'count' => $formattedLikes->count()]);
        return response()->json($formattedLikes);
    }

    public function mutual(Request $request)
    {
        $user = $request->user();
        $sentLikes = Like::where('from_user_id', $user->id)
            ->pluck('to_user_id');
        $mutualLikes = Like::where('to_user_id', $user->id)
            ->whereIn('from_user_id', $sentLikes)
            ->with('from_user')
            ->get();

        $formattedMutualLikes = $mutualLikes->map(function ($like) {
            $fromUser = $like->from_user;
            return [
                'id' => $fromUser->id,
                'name' => $fromUser->name,
                'type' => $fromUser->type,
                'location' => $fromUser->location,
                'profile_photo' => $fromUser->profile_photo,
                'mutual' => true, 
            ];
        });

        Log::info('Fetched mutual likes', ['user_id' => $user->id, 'count' => $formattedMutualLikes->count()]);
        return response()->json($formattedMutualLikes);
    }
}