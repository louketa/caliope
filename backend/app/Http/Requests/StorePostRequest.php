<?php

namespace App\Http\Requests;

use App\Enums\Lang;
use App\Enums\PostKind;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePostRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $kind = PostKind::tryFrom((string) $this->input('kind'));
        $isRomance = $kind === PostKind::Romance;

        return [
            'kind' => ['required', Rule::in(array_map(fn (PostKind $k): string => $k->value, PostKind::enabled()))],
            'lang' => ['required', Rule::enum(Lang::class)],
            'text' => ['required', 'string', 'max:'.($kind?->maxTextLength() ?? 280)],
            'title' => [Rule::requiredIf($isRomance), Rule::prohibitedIf(! $isRomance), 'nullable', 'string', 'max:120'],
            'url' => [Rule::requiredIf($isRomance), Rule::prohibitedIf(! $isRomance), 'nullable', 'url:http,https', 'max:2048'],
            'featured' => ['sometimes', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(collect(['text', 'title', 'url'])
            ->filter(fn (string $field): bool => is_string($this->input($field)))
            ->mapWithKeys(fn (string $field): array => [$field => trim($this->input($field))])
            ->all());
    }
}
