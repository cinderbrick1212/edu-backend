<#
Update Render service environment variables helper (PowerShell)
Requires: RENDER_API_KEY and SERVICE_ID
This script demonstrates how to set an env var via Render API. Run with REVIEW and replace placeholders.
#>

param(
  [Parameter(Mandatory=$true)] [string]$ServiceId,
  [Parameter(Mandatory=$true)] [string]$Name,
  [Parameter(Mandatory=$true)] [string]$Value
)

if (-not $env:RENDER_API_KEY) {
  Write-Error "Set RENDER_API_KEY in your environment before running this script."
  exit 1
}

$uri = "https://api.render.com/v1/services/$ServiceId/env-vars"
$body = @{
  key = $Name
  value = $Value
  # note: set "private" true for secret values to hide them in the web UI
  isPrivate = $true
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers @{ Authorization = "Bearer $env:RENDER_API_KEY"; 'Content-Type' = 'application/json' } -Body $body -ErrorAction Stop

Write-Host "Render response: Added/updated env var $Name for service $ServiceId"