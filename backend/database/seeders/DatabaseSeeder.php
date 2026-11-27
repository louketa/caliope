<?php

namespace Database\Seeders;

use App\Enums\Lang;
use App\Enums\PostKind;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Idempotent: safe to run on every deploy. Creates the house author and its sample aphorisms once.
     */
    public function run(): void
    {
        $caliope = User::firstOrCreate(
            ['email' => 'caliope@caliope.local'],
            ['name' => 'Caliope', 'password' => Str::random(40)],
        );

        if ($caliope->posts()->exists()) {
            return;
        }

        $samples = [
            [Lang::Pt, 'Quem escreve curto é obrigado a pensar longo.'],
            [Lang::Pt, 'O silêncio também tem rascunhos.'],
            [Lang::Es, 'Una frase breve es una puerta que se deja entreabierta.'],
            [Lang::Pt, 'Não se escreve para ser lido: escreve-se para não se perder no caminho de volta a si mesmo, mesmo quando ninguém espera por nós do outro lado da página.'],
            [Lang::Es, 'La memoria es un cuaderno que reescribe a quien lo lee.'],
            [Lang::Pt, 'Toda pressa é uma forma de ausência.'],
            [Lang::Es, 'Escribir es aprender a quedarse.'],
            [Lang::Pt, 'A palavra certa chega depois de todas as erradas.'],
        ];

        foreach ($samples as [$lang, $text]) {
            $caliope->posts()->create(['kind' => PostKind::Aforismo, 'lang' => $lang, 'text' => $text]);
        }
    }
}
