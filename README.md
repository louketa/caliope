# CALIOPE

"Sua voz no mundo" — plataforma de autopublicação de escritos curtos (estilo Pinterest). SPA instalável (PWA), mobile-first, bilíngue PT/ES.

Começa por **aforismos**; poesia, cordéis, contos e novelas já aparecem como "em breve".

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # produção (gera também o service worker do PWA)
```

> O `.npmrc` do projeto força o registro público do npm.

## Estado atual (v0)

- Login/criar conta **de demonstração**: sem servidor, senha não é guardada nem verificada.
- Posts ficam no `localStorage` (`src/store.ts`). Trocar por API mantendo as mesmas funções.
- Feed em colunas (masonry), curtir, publicar (280 caracteres), troca de idioma ES/PT.

## Paleta

| Uso | Cor |
|---|---|
| Fundo | `#100c09` |
| Laranja (logo, botão de escrever) | `#f38634` |
| Dourado (botão, abas) | `#d9af75` |

O logo em `public/logo-mark.svg` é uma reprodução; trocar pelo arquivo original do Lovable. Após trocar, rodar `scripts/icons.sh` (precisa de `rsvg-convert`).
