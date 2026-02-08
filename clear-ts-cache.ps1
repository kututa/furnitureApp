# Fix TypeScript Compilation Issues
# This script clears TypeScript compilation caches

Write-Host "Clearing TypeScript caches..." -ForegroundColor Yellow
Write-Host ""

# Navigate to server directory
Set-Location -Path "server"

# Remove ts-node cache
if (Test-Path ".ts-node") {
    Remove-Item -Recurse -Force ".ts-node"
    Write-Host "✅ Removed .ts-node cache" -ForegroundColor Green
} else {
    Write-Host "ℹ️ No .ts-node cache found" -ForegroundColor Cyan
}

# Remove dist folder
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Removed dist folder" -ForegroundColor Green
} else {
    Write-Host "ℹ️ No dist folder found" -ForegroundColor Cyan
}

# Remove node_modules/.cache if it exists
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✅ Removed node_modules/.cache" -ForegroundColor Green
} else {
    Write-Host "ℹ️ No node_modules/.cache found" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Caches cleared! Now restart your server:" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""

# Return to root
Set-Location -Path ".."
