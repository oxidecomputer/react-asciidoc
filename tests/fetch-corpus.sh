#!/usr/bin/env bash
# Pull every asciidoc RFD via rfd-cli and write to tests/corpus/rfds/NNNN.adoc.
# Re-run any time to refresh; existing files are overwritten.
set -euo pipefail

RFD_CLI="${RFD_CLI:-$HOME/Development/rfd-cli}"
OUT="$(dirname "$0")/corpus/rfds"
mkdir -p "$OUT"

# List asciidoc RFDs (number per line, sorted).
NUMS=$("$RFD_CLI" list -f json 2>/dev/null \
  | jq -r '[.[] | select(.format == "asciidoc")] | sort_by(.rfd_number) | .[].rfd_number')

count=$(echo "$NUMS" | wc -l | tr -d ' ')
echo "Fetching $count RFDs in parallel..." >&2

fetch_one() {
  local n="$1"
  local padded
  padded=$(printf '%04d' "$n")
  local path="$OUT/$padded.adoc"
  if ! "$RFD_CLI" view --number "$n" 2>/dev/null \
      | jq -r '.content' > "$path.tmp"; then
    rm -f "$path.tmp"
    echo "FAIL $padded" >&2
    return 1
  fi
  # An empty/missing content body shows up as `null` from jq — skip those.
  if [ ! -s "$path.tmp" ] || [ "$(cat "$path.tmp")" = "null" ]; then
    rm -f "$path.tmp"
    echo "EMPTY $padded" >&2
    return 0
  fi
  mv "$path.tmp" "$path"
}

export -f fetch_one
export RFD_CLI OUT

echo "$NUMS" | xargs -n1 -P8 -I{} bash -c 'fetch_one "$@"' _ {}

echo "Wrote $(ls "$OUT" | wc -l | tr -d ' ') files to $OUT" >&2
