#!/usr/bin/env bash
# Gera os ícones PNG do PWA a partir de public/logo-mark.svg
set -euo pipefail
cd "$(dirname "$0")/.."
for s in 192 512; do
  rsvg-convert -w $((s*70/100)) -h $((s*70/100)) public/logo-mark.svg -o /tmp/caliope-mark.png
  rsvg-convert -w $s -h $s -b '#100c09' <(printf '<svg xmlns="http://www.w3.org/2000/svg" width="%s" height="%s"><rect width="100%%" height="100%%" fill="#100c09"/><image href="/tmp/caliope-mark.png" x="%s" y="%s"/></svg>' $s $s $((s*15/100)) $((s*15/100))) -o public/icon-$s.png
done
cp public/logo-mark.svg public/favicon.svg
