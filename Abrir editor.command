#!/bin/zsh
# Doble clic: enciende el editor de la página (npm run dev) y lo abre en Google Chrome.
# Deja abierta esta ventana de Terminal mientras usas el editor: si la cierras, el editor se apaga.
# Si el editor ya estaba encendido, solo abre Chrome.

cd "$(dirname "$0")" || exit 1
[ -f ~/.zprofile ] && source ~/.zprofile
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

DIRECCION="http://localhost:3100/editor"

if lsof -nP -iTCP:3100 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "El editor ya estaba encendido. Abriendo Chrome…"
  open -a "Google Chrome" "$DIRECCION"
  exit 0
fi

echo "Encendiendo el editor… (deja esta ventana abierta mientras lo usas)"
# Cuando el editor responda, se abre en Chrome.
( until curl -s -o /dev/null "$DIRECCION"; do sleep 1; done; open -a "Google Chrome" "$DIRECCION" ) &
npm run dev
