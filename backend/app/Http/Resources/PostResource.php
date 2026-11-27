<?php

namespace App\Http\Resources;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Post
 */
class PostResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kind' => $this->kind->value,
            'lang' => $this->lang->value,
            'author' => $this->user->name,
            'text' => $this->text,
            'title' => $this->title,
            'url' => $this->url,
            'featured' => $this->featured,
            'likes' => $this->likes_count,
            'liked' => (bool) ($this->liked ?? false),
            'mine' => $this->user_id === $request->user()?->id,
            'createdAt' => $this->created_at->getTimestampMs(),
        ];
    }
}
