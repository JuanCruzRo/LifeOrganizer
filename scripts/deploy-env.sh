#!/usr/bin/env bash
# Sube las variables de .env.vercel-copy al proyecto de Vercel, una por una,
# sin que ningun valor pase por el terminal ni quede en el historial del shell.
#
#   npm run deploy:env
#
set -euo pipefail

ENV_FILE=".env.vercel-copy"

if ! command -v vercel >/dev/null 2>&1; then
  echo "Falta la Vercel CLI. Instalala con:  npm i -g vercel" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "No existe $ENV_FILE" >&2
  exit 1
fi

if [ ! -d .vercel ]; then
  echo "Vinculando con el proyecto de Vercel (elegi el repo LifeOrganizer)..."
  vercel link
fi

count=0
skipped=0
#IFS= read -r -d '' FILE < <(cat "$ENV_FILE") || true
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    ''|'#'*) continue ;;
  esac
  name="${line%%=*}"
  # El valor se pasa por stdin, nunca como argumento: asi no queda en el historial.
  printf '%s' "${line#*=}" | vercel env add "$name" production --force --yes >/dev/null
  printf '  + %s\n' "$name"
  count=$((count + 1))
done < "$ENV_FILE"

echo
echo "Subidas $count variables a produccion."
echo "Ahora:  vercel --prod     (deploy)"
