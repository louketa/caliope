<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PostLikeController extends Controller
{
    /**
     * Toggles the authenticated user's like on the post.
     */
    public function __invoke(Request $request, Post $post): PostResource
    {
        $userId = $request->user()->id;

        $liked = DB::transaction(function () use ($post, $userId): bool {
            $removed = $post->likers()->detach($userId);

            if ($removed > 0) {
                $post->decrement('likes_count');

                return false;
            }

            $post->likers()->attach($userId);
            $post->increment('likes_count');

            return true;
        });

        $post->refresh()->load('user:id,name')->setAttribute('liked', $liked);

        return new PostResource($post);
    }
}
