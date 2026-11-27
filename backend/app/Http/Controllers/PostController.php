<?php

namespace App\Http\Controllers;

use App\Enums\Lang;
use App\Enums\PostKind;
use App\Http\Requests\StorePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class PostController extends Controller
{
    private const FEED_LIMIT = 200;

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'kind' => ['sometimes', Rule::enum(PostKind::class)],
            'lang' => ['sometimes', Rule::enum(Lang::class)],
        ]);

        $posts = Post::query()
            ->with('user:id,name')
            ->withExists(['likers as liked' => fn ($query) => $query->whereKey($request->user()->id)])
            ->when($filters['kind'] ?? null, fn ($query, string $kind) => $query->where('kind', $kind))
            ->when($filters['lang'] ?? null, fn ($query, string $lang) => $query->where('lang', $lang))
            ->orderByDesc('featured')
            ->latest()
            ->limit(self::FEED_LIMIT)
            ->get();

        return PostResource::collection($posts);
    }

    public function store(StorePostRequest $request): PostResource
    {
        $post = $request->user()->posts()->create($request->validated());

        return new PostResource($post->refresh()->load('user:id,name'));
    }
}
