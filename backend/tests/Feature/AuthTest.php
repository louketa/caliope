<?php

use App\Models\User;

describe('register', function () {
    it('creates the account and starts a session', function () {
        $this->postJson('/api/register', ['name' => 'Ana', 'email' => ' Ana@Mail.com ', 'password' => 'segredo123'])
            ->assertCreated()
            ->assertExactJson(['name' => 'Ana', 'email' => 'ana@mail.com']);

        $this->assertAuthenticated('web');
        expect(User::firstWhere('email', 'ana@mail.com')->password)->not->toBe('segredo123');
    });

    it('rejects a duplicated email', function () {
        User::factory()->create(['email' => 'ana@mail.com']);

        $this->postJson('/api/register', ['name' => 'Ana', 'email' => 'ana@mail.com', 'password' => 'segredo123'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    });

    it('requires a password of at least 8 characters', function () {
        $this->postJson('/api/register', ['name' => 'Ana', 'email' => 'ana@mail.com', 'password' => 'curta'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');
    });
});

describe('login', function () {
    it('logs in with the right password', function () {
        User::factory()->create(['name' => 'Ana', 'email' => 'ana@mail.com', 'password' => 'segredo123']);

        $this->postJson('/api/login', ['email' => 'ANA@mail.com', 'password' => 'segredo123'])
            ->assertOk()
            ->assertExactJson(['name' => 'Ana', 'email' => 'ana@mail.com']);

        $this->assertAuthenticated('web');
    });

    it('refuses a wrong password', function () {
        User::factory()->create(['email' => 'ana@mail.com', 'password' => 'segredo123']);

        $this->postJson('/api/login', ['email' => 'ana@mail.com', 'password' => 'errada123'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertGuest('web');
    });

    it('throttles repeated attempts', function () {
        foreach (range(1, 10) as $attempt) {
            $this->postJson('/api/login', ['email' => 'x@mail.com', 'password' => 'errada123']);
        }

        $this->postJson('/api/login', ['email' => 'x@mail.com', 'password' => 'errada123'])
            ->assertTooManyRequests();
    });
});

it('returns the current user on /me', function () {
    $user = User::factory()->create(['name' => 'Ana', 'email' => 'ana@mail.com']);

    $this->actingAs($user)->getJson('/api/me')->assertExactJson(['name' => 'Ana', 'email' => 'ana@mail.com']);
});

it('blocks /me for guests', function () {
    $this->getJson('/api/me')->assertUnauthorized();
});

it('logs out', function () {
    $this->actingAs(User::factory()->create(), 'web')->postJson('/api/logout')->assertNoContent();

    $this->assertGuest('web');
});

it('rejects login from a non-browser client without a session', function () {
    User::factory()->create(['email' => 'ana@mail.com', 'password' => 'segredo123']);

    $this->withHeader('Origin', 'https://outro-site.com')
        ->postJson('/api/login', ['email' => 'ana@mail.com', 'password' => 'segredo123'])
        ->assertBadRequest();
});
