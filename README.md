# CALIOPE

"Sua voz no mundo" — plataforma de autopublicação de escritos curtos (estilo Pinterest). SPA instalável (PWA), mobile-first, bilíngue PT/ES.

Começa por **aforismos**; poesia, contos, romances, cordéis e letras de músicas já aparecem como "em breve".

## Rodar

```bash
npm install
npm run dev:full # API (porta 3001) + front (5173)
npm run server   # só a API
npm run dev      # só o front
npm run build    # produção (gera também o service worker do PWA)
```

> O `.npmrc` do projeto força o registro público do npm.

## Estado atual (v0)

- Login/criar conta **de demonstração**: sem servidor, senha não é guardada nem verificada.
- Posts ficam na API Node sem dependências (`server/index.mjs`), gravados em `server/data.json` (ignorado no git). O front chama `/api` via proxy do Vite (`src/store.ts`).
- **Romance:** título, prévia gratuita (até 1000 caracteres) e link externo (Drive etc.). Marcar "destacar" põe a obra no topo com selo. Ainda sem pagamento: o destaque é só uma caixa de seleção.
- Feed em colunas (masonry), curtir, publicar (280 caracteres), troca de idioma ES/PT.

## Paleta

| Uso | Cor |
|---|---|
| Fundo | `#100c09` |
| Laranja (logo, botão de escrever) | `#f38634` |
| Dourado (botão, abas) | `#d9af75` |

O logo em `public/logo-mark.svg` é uma reprodução; trocar pelo arquivo original do Lovable. Após trocar, rodar `scripts/icons.sh` (precisa de `rsvg-convert`).
