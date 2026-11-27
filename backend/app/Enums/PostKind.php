<?php

namespace App\Enums;

enum PostKind: string
{
    case Aforismo = 'aforismo';
    case Poesia = 'poesia';
    case Cordel = 'cordel';
    case Conto = 'conto';
    case Romance = 'romance';
    case Letra = 'letra';

    /**
     * Kinds that can be published today; the others are shown as "coming soon".
     *
     * @return list<self>
     */
    public static function enabled(): array
    {
        return [self::Aforismo, self::Romance];
    }

    public function maxTextLength(): int
    {
        return match ($this) {
            self::Aforismo => 280,
            self::Romance => 1000,
            default => 5000,
        };
    }
}
