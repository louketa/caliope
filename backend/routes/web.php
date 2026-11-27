<?php

use Illuminate\Support\Facades\Route;

// The React build lives in public/; every non-API path is served its index.html.
$spa = function () {
    $index = public_path('index.html');

    abort_if(request()->is('api/*') || ! is_file($index), 404);

    return response()->file($index, ['Cache-Control' => 'no-cache']);
};

Route::get('/', $spa);
Route::fallback($spa);
