# Script PowerShell per creare account admin su produzione
# Esegui questo script dopo che Railway ha fatto il deploy

Write-Host "🔐 Creazione account admin su produzione..." -ForegroundColor Cyan
Write-Host ""

$body = @{
    email = "admin@findmiss.it"
    password = "Findmiss2025!"
    nickname = "Admin"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.findmiss.it/api/admin/create-admin" -Method POST -ContentType "application/json" -Body $body
    
    Write-Host "✅ Account admin creato con successo!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Credenziali:" -ForegroundColor Yellow
    Write-Host "   Email: admin@findmiss.it"
    Write-Host "   Password: Findmiss2025!"
    Write-Host ""
    Write-Host "🌐 Accedi su: https://findmiss.it/admin" -ForegroundColor Cyan
    
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Errore: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Possibili cause:" -ForegroundColor Yellow
    Write-Host "   - Il deploy su Railway non è ancora completato"
    Write-Host "   - L'endpoint non è ancora disponibile"
    Write-Host "   - Problema di connessione"
    Write-Host ""
    Write-Host "🔄 Riprova tra 1-2 minuti" -ForegroundColor Yellow
}

