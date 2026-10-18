@echo off
rem Double-click (Windows): pick a pi run log (Up/Down, Enter/W watches live, Esc/Q back or quit).
node "%~dp0scripts\pi-picker.mjs"
if errorlevel 1 pause
