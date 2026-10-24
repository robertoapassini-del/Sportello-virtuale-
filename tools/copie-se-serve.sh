#!/bin/sh
# Copie «a richiesta»: il server in Italia lancia questo script ogni 15 minuti (cron).
# Se da main sono cambiati gli indirizzi o i dati delle regioni (data/regioni/), i numeri nazionali
# (data/numeri.json), le fonti delle regole nazionali (data/rules*.json, data/fonti-nazionali.json), tools/copie.mjs, tools/email-nascoste.mjs, tools/pdf-testo.mjs
# o tools/copie-richiesta.txt, rifà subito la copia delle pagine ufficiali con lo stesso comando
# della notte, invece di aspettare le 3:30. Se non è cambiato niente, esce senza fare nulla.
# Così una pull request unita su GitHub basta per far partire la copia: nessuno deve entrare nel server.
#
# Uso (in crontab, una riga):
#   */15 * * * * /opt/guidasanita/tools/copie-se-serve.sh "<il comando che il cron lancia alle 3:30>"
# Per forzare una copia senza cambiare dati: modificare tools/copie-richiesta.txt in una pull request.
set -eu

COMANDO="${1:?serve il comando della copia notturna, tra virgolette}"
SITO="$(cd "$(dirname "$0")/.." && pwd)"
SEGNO="$SITO/.git/copie-ultimo"        # l'ultimo commit di main già copiato (non è nel repository)
BLOCCO="/tmp/guidasanita-copie.lock"

cd "$SITO"

# Una copia alla volta: se ne sta già girando una (anche quella delle 3:30), non si parte.
# (pgrep troverebbe anche questo script e il cron che lo lancia, perché il comando contiene «copie.mjs»: si escludono.)
if pgrep -f "copie\.mjs" | grep -v -x -e "$$" -e "$PPID" | grep -q .; then exit 0; fi
exec 9>"$BLOCCO"
flock -n 9 || exit 0

git fetch -q origin main
NUOVO="$(git rev-parse origin/main)"
PRIMA="$(cat "$SEGNO" 2>/dev/null || true)"

# La prima volta (appena installato) si copia subito; poi solo se in main è cambiato qualcosa che conta.
if [ -n "$PRIMA" ]; then
  [ "$PRIMA" = "$NUOVO" ] && exit 0
  if git diff --quiet "$PRIMA" "$NUOVO" -- data/regioni data/numeri.json 'data/rules*.json' data/fonti-nazionali.json tools/copie.mjs tools/email-nascoste.mjs tools/pdf-testo.mjs tools/copie-richiesta.txt; then
    echo "$NUOVO" > "$SEGNO"
    exit 0
  fi
fi

echo "$(date '+%Y-%m-%d %H:%M') cambiati gli indirizzi in main ($PRIMA → $NUOVO): copia a richiesta"
git pull -q --ff-only origin main
# Il segno si scrive prima: se la copia si ferma a metà, non si riprova ogni 15 minuti
# (si riprova alla prossima modifica, o comunque la notte). Siti pubblici: niente raffiche.
echo "$NUOVO" > "$SEGNO"
sh -c "$COMANDO"
