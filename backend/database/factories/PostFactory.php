<?php

namespace Database\Factories;

use App\Enums\Lang;
use App\Enums\PostKind;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Post>
 */
class PostFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'kind' => PostKind::Aforismo,
            'lang' => Lang::Pt,
            'text' => fake()->sentence(),
            'featured' => false,
        ];
    }

    public function romance(): static
    {
        return $this->state(fn (): array => [
            'kind' => PostKind::Romance,
            'title' => fake()->sentence(3),
            'url' => fake()->url(),
        ]);
    }
}
