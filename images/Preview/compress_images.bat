@echo off
echo.
echo ========================================
echo   Image Compressor - Target: 500KB
echo ========================================
echo.
echo Running compression...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0compress_images.ps1"
