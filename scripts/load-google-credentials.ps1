# Copies Google OAuth Web client values from a downloaded client_secret JSON into .env
# Usage:
#   powershell -File scripts/load-google-credentials.ps1
#   powershell -File scripts/load-google-credentials.ps1 -JsonPath "C:\Users\you\Downloads\client_secret_....json"

param(
  [string]$JsonPath = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root ".env"

if (-not $JsonPath) {
  $downloads = Join-Path $env:USERPROFILE "Downloads"
  $match = Get-ChildItem -Path $downloads -Filter "client_secret*.json" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
  if (-not $match) {
    Write-Error "No client_secret*.json found in Downloads. Pass -JsonPath explicitly."
  }
  $JsonPath = $match.FullName
}

if (-not (Test-Path $JsonPath)) {
  Write-Error "JSON not found: $JsonPath"
}

$json = Get-Content -Raw -Path $JsonPath | ConvertFrom-Json
$web = $json.web
if (-not $web -or -not $web.client_id -or -not $web.client_secret) {
  Write-Error "Unexpected JSON shape. Expected { web: { client_id, client_secret } }."
}

$clientId = [string]$web.client_id
$clientSecret = [string]$web.client_secret

if (-not (Test-Path $envPath)) {
  Copy-Item (Join-Path $root ".env.example") $envPath
  Write-Host "Created .env from .env.example"
}

$content = Get-Content -Raw -Path $envPath
function Set-EnvLine([string]$text, [string]$key, [string]$value) {
  $pattern = "(?m)^$key=.*$"
  $line = "$key=$value"
  if ($text -match $pattern) {
    return [regex]::Replace($text, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $line })
  }
  if ($text -notmatch "`n$") { $text += "`n" }
  return $text + $line + "`n"
}

$content = Set-EnvLine $content "GOOGLE_CLIENT_ID" $clientId
$content = Set-EnvLine $content "GOOGLE_CLIENT_SECRET" $clientSecret
$content = Set-EnvLine $content "EXPO_PUBLIC_GOOGLE_CLIENT_ID" $clientId
Set-Content -Path $envPath -Value $content -NoNewline

Write-Host "Updated .env with Google credentials from:"
Write-Host "  $JsonPath"
Write-Host "GOOGLE_CLIENT_ID=$clientId"
Write-Host "Restart auth-service / docker compose after this change."
