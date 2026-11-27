<?php

use App\Models\Post;
use App\Models\User;

describe('feed', function () {
    it('requires authentication', function () {
        $this->getJson('/api/posts')->assertUnauthorized();
    });

    it('filters by kind and language, featured first then newest', function () {
        $user = User::factory()->create();
        $old = Post::factory()->create(['created_at' => now()->subDay()]);
        $new = Post::factory()->create();
        $featured = Post::factory()->create(['featured' => true, 'created_at' => now()->subWeek()]);
        Post::factory()->create(['lang' => 'es']);
        Post::factory()->romance()->create();

        $ids = $this->actingAs($user)->getJson('/api/posts?kind=aforismo&lang=pt')
            ->assertOk()
            ->json('data.*.id');

        expect($ids)->toBe([$featured->id, $new->id, $old->id]);
    });

    it('exposes the author name and whether the viewer liked it', function () {
        $user = User::factory()->create();
        $post = Post::factory()->for(User::factory()->state(['name' => 'Bia']))->create();
        $post->likers()->attach($user);

        $this->actingAs($user)->getJson('/api/posts')
            ->assertJsonPath('data.0.author', 'Bia')
            ->assertJsonPath('data.0.liked', true)
            ->assertJsonPath('data.0.mine', false);
    });

    it('rejects an unknown kind filter', function () {
        $this->actingAs(User::factory()->create())->getJson('/api/posts?kind=novela')->assertUnprocessable();
    });
});

describe('publishing', function () {
    it('publishes an aphorism signed by the logged user', function () {
        $user = User::factory()->create(['name' => 'Ana']);

        $this->actingAs($user)->postJson('/api/posts', ['kind' => 'aforismo', 'lang' => 'pt', 'text' => '  Breve.  '])
            ->assertCreated()
            ->assertJsonPath('data.author', 'Ana')
            ->assertJsonPath('data.text', 'Breve.')
            ->assertJsonPath('data.likes', 0);

        expect($user->posts()->count())->toBe(1);
    });

    it('ignores an author sent by the client', function () {
        $user = User::factory()->create(['name' => 'Ana']);

        $this->actingAs($user)->postJson('/api/posts', ['kind' => 'aforismo', 'lang' => 'pt', 'text' => 'Oi', 'author' => 'Machado'])
            ->assertJsonPath('data.author', 'Ana');
    });

    it('limits aphorisms to 280 characters', function () {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/posts', ['kind' => 'aforismo', 'lang' => 'pt', 'text' => str_repeat('a', 281)])
            ->assertJsonValidationErrors('text');
    });

    it('publishes a romance with title, link and up to 1000 characters of preview', function () {
        $this->actingAs(User::factory()->create())->postJson('/api/posts', [
            'kind' => 'romance', 'lang' => 'es', 'title' => 'Obra', 'url' => 'https://drive.google.com/x',
            'text' => str_repeat('a', 1000), 'featured' => true,
        ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Obra')
            ->assertJsonPath('data.featured', true);
    });

    it('requires title and an http(s) link for a romance', function () {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/posts', ['kind' => 'romance', 'lang' => 'pt', 'text' => 'Prévia', 'url' => 'javascript:alert(1)'])
            ->assertJsonValidationErrors(['title', 'url']);
    });

    it('refuses kinds that are not enabled yet', function () {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/posts', ['kind' => 'poesia', 'lang' => 'pt', 'text' => 'Verso'])
            ->assertJsonValidationErrors('kind');
    });

    it('refuses title and link on an aphorism', function () {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/posts', ['kind' => 'aforismo', 'lang' => 'pt', 'text' => 'Oi', 'url' => 'https://x.com'])
            ->assertJsonValidationErrors('url');
    });
});

describe('likes', function () {
    it('toggles the like once per user', function () {
        $user = User::factory()->create();
        $post = Post::factory()->create();

        $this->actingAs($user)->postJson("/api/posts/{$post->id}/like")
            ->assertOk()->assertJsonPath('data.likes', 1)->assertJsonPath('data.liked', true);

        $this->actingAs($user)->postJson("/api/posts/{$post->id}/like")
            ->assertOk()->assertJsonPath('data.likes', 0)->assertJsonPath('data.liked', false);
    });

    it('counts likes from different users', function () {
        $post = Post::factory()->create();

        $this->actingAs(User::factory()->create())->postJson("/api/posts/{$post->id}/like");
        $this->actingAs(User::factory()->create())->postJson("/api/posts/{$post->id}/like")->assertJsonPath('data.likes', 2);
    });

    it('returns 404 for an unknown post', function () {
        $this->actingAs(User::factory()->create())->postJson('/api/posts/nao-existe/like')->assertNotFound();
    });
});
