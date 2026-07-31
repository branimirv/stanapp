#!/usr/bin/env bash
# Capture a single frame from the booted iOS Simulator.
# Usage: ./scripts/capture-screenshot.sh <output-path.png>

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <output-path.png>" >&2
  exit 1
fi

OUT="$1"
mkdir -p "$(dirname "$OUT")"

if ! xcrun simctl list devices booted 2>/dev/null | grep -q Booted; then
  echo "No booted iOS Simulator found. Start the app with pnpm ios first." >&2
  exit 1
fi

xcrun simctl io booted screenshot "$OUT"
echo "Saved $OUT"
