<?php

use App\Models\User;

it('keeps unknown API routes as JSON 404', function () {
    $this->getJson('/api/nada')->assertNotFound();
});

it('seeds the sample aphorisms only once', function () {
    $this->seed();
    $this->seed();

    expect(User::firstWhere('email', 'caliope@caliope.local')->posts()->count())->toBe(8);
});
