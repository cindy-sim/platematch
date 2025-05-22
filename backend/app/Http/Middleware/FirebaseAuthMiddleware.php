<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Kreait\Firebase\Auth as FirebaseAuth;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class FirebaseAuthMiddleware
{
    protected $auth;

    public function __construct(FirebaseAuth $auth)
    {
        $this->auth = $auth;
    }

    public function handle(Request $request, Closure $next)
    {
        $startTime = microtime(true);
        Log::info('FirebaseAuthMiddleware: Processing request', ['url' => $request->url()]);

        $token = $request->bearerToken();
        Log::info('FirebaseAuthMiddleware: Bearer token received', ['token_present' => !!$token]);

        if (!$token) {
            Log::warning('FirebaseAuthMiddleware: No token provided');
            return response()->json(['error' => 'Unauthorized: No token provided'], 401);
        }

        try {
            Log::info('FirebaseAuthMiddleware: Verifying token');
            $verifiedToken = $this->auth->verifyIdToken($token);
            $firebaseUid = $verifiedToken->claims()->get('sub');
            Log::info('FirebaseAuthMiddleware: Verified Firebase UID', ['uid' => $firebaseUid]);

            $user = User::where('firebase_uid', $firebaseUid)->first();
            if ($user) {
                Log::info('FirebaseAuthMiddleware: User found', ['email' => $user->email, 'type' => $user->type]);
                $firebaseUser = $this->auth->getUser($firebaseUid);
                if ($user->email !== $firebaseUser->email || $user->name !== ($firebaseUser->displayName ?? $user->name)) {
                    $user->update([
                        'email' => $firebaseUser->email,
                        'name' => $firebaseUser->displayName ?? $user->name,
                    ]);
                    Log::info('FirebaseAuthMiddleware: Updated user data', ['email' => $user->email, 'name' => $user->name]);
                }
                if (!$user->type) {
                    Log::warning('FirebaseAuthMiddleware: User has no type', ['email' => $user->email]);
                }
            } else {
                Log::info('FirebaseAuthMiddleware: Fetching Firebase user');
                try {
                    $firebaseUser = $this->auth->getUser($firebaseUid);
                    Log::info('FirebaseAuthMiddleware: Firebase user data', [
                        'email' => $firebaseUser->email,
                        'displayName' => $firebaseUser->displayName,
                    ]);

                    // Ensure no duplicate user exists
                    if (User::where('firebase_uid', $firebaseUid)->exists()) {
                        Log::error('FirebaseAuthMiddleware: Duplicate user detected', ['firebase_uid' => $firebaseUid]);
                        return response()->json(['error' => 'Internal server error'], 500);
                    }

                    $user = User::create([
                        'firebase_uid' => $firebaseUid,
                        'email' => $firebaseUser->email,
                        'name' => $firebaseUser->displayName ?? 'User_' . substr($firebaseUid, 0, 8),
                        'type' => null,
                        'location' => null,
                        'profile_photo' => null,
                        'description' => null,
                    ]);
                    Log::info('FirebaseAuthMiddleware: Created user', ['email' => $user->email, 'id' => $user->id]);
                } catch (\Exception $e) {
                    Log::error('FirebaseAuthMiddleware: Failed to fetch Firebase user', ['error' => $e->getMessage()]);
                    return response()->json(['error' => 'Unable to create user'], 500);
                }
            }

            $request->setUserResolver(function () use ($user) {
                return $user;
            });

            $duration = microtime(true) - $startTime;
            Log::info('FirebaseAuthMiddleware: Proceeding to next middleware', ['duration_ms' => $duration * 1000]);
            return $next($request);
        } catch (\Kreait\Firebase\Auth\FailedToVerifyToken $e) {
            Log::error('FirebaseAuthMiddleware: Token verification failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Unauthorized: Invalid token'], 401);
        } catch (\Exception $e) {
            Log::error('FirebaseAuthMiddleware: General error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }
}