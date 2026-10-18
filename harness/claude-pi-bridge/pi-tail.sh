#!/bin/sh
# macOS / Linux: pick a pi run log (Up/Down, Enter/W watches live, Esc/Q back or quit).
exec node "$(dirname "$0")/scripts/pi-picker.mjs"
