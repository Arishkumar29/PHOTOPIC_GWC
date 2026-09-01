@echo off
echo ========================================================
echo Pushing PHOTOPIC_BACKEND, PHOTOPIC_FRONTEND, and PHOTOPIC_ADMIN
echo ========================================================

echo.
echo [1/3] Pushing Backend to https://github.com/Arishkumar29/PHOTOPIC_BACKEND.git...
cd /d "%~dp0backend"
if not exist ".git" git init
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/Arishkumar29/PHOTOPIC_BACKEND.git
git add .
git commit -m "initial commit: photopic backend api and face recognition engine"
git push -u origin main --force

echo.
echo [2/3] Pushing Frontend to https://github.com/Arishkumar29/PHOTOPIC_FRONTEND.git...
cd /d "%~dp0frontend"
if not exist ".git" git init
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/Arishkumar29/PHOTOPIC_FRONTEND.git
git add .
git commit -m "initial commit: photopic public attendee frontend portal"
git push -u origin main --force

echo.
echo [3/3] Pushing Admin to https://github.com/Arishkumar29/PHOTOPIC_ADMIN.git...
cd /d "%~dp0admin"
if not exist ".git" git init
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/Arishkumar29/PHOTOPIC_ADMIN.git
git add .
git commit -m "initial commit: photopic organizer and admin management portal"
git push -u origin main --force

echo.
echo ========================================================
echo ALL 3 REPOSITORIES SUCCESSFULLY PUSHED TO GITHUB!
echo ========================================================
pause
