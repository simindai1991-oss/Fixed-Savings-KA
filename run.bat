@echo off
cd /d "%~dp0"

REM Prefer py launcher, then python
where py >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Starting static server at http://127.0.0.1:8080
  echo Press Ctrl+C to stop.
  py -m http.server 8080
  goto :eof
)

where python >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Starting static server at http://127.0.0.1:8080
  echo Press Ctrl+C to stop.
  python -m http.server 8080
  goto :eof
)

echo Python not found on PATH.
echo Install Python or activate your conda/venv, then run:
echo   cd /d "%~dp0"
echo   python -m http.server 8080
exit /b 1
