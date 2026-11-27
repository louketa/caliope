<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $this->ensureSession($request);

        $user = User::create($request->validated());

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json($this->sessionPayload($user), 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $this->ensureSession($request);

        if (! Auth::guard('web')->attempt($request->validated())) {
            throw ValidationException::withMessages(['email' => __('auth.failed')]);
        }

        $request->session()->regenerate();

        return response()->json($this->sessionPayload($request->user()));
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($this->sessionPayload($request->user()));
    }

    public function logout(Request $request): Response
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    /**
     * Sessions only exist for requests from the SPA's own domain (Sanctum stateful domains).
     */
    private function ensureSession(Request $request): void
    {
        abort_unless($request->hasSession(), 400, 'Login is only available from the Caliope web app.');
    }

    /**
     * @return array{name: string, email: string}
     */
    private function sessionPayload(User $user): array
    {
        return ['name' => $user->name, 'email' => $user->email];
    }
}
