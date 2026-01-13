<#
Atlas DB user password rotation helper (PowerShell)
Requires: ATLAS_PUBLIC_KEY, ATLAS_PRIVATE_KEY (Programmatic API Keys)
Replace: $GroupId, $Username

This script makes an authenticated request to MongoDB Atlas API to update the database user's password.
It does NOT run automatically; review and run locally with credentials set in your environment.
#>

param(
  [Parameter(Mandatory=$true)] [string]$GroupId,
  [Parameter(Mandatory=$true)] [string]$Username,
  [Parameter(Mandatory=$true)] [string]$NewPassword
)

if (-not $env:ATLAS_PUBLIC_KEY -or -not $env:ATLAS_PRIVATE_KEY) {
  Write-Error "Set ATLAS_PUBLIC_KEY and ATLAS_PRIVATE_KEY in your env before running this script."
  exit 1
}

$auth = "{0}:{1}" -f $env:ATLAS_PUBLIC_KEY, $env:ATLAS_PRIVATE_KEY
$encodedAuth = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($auth))

$body = @{
  password = $NewPassword
} | ConvertTo-Json

$uri = "https://cloud.mongodb.com/api/atlas/v1.0/groups/$GroupId/databaseUsers/admin/$Username"

$response = Invoke-RestMethod -Uri $uri -Method PATCH -Headers @{ Authorization = "Basic $encodedAuth"; 'Content-Type' = 'application/json' } -Body $body -ErrorAction Stop

Write-Host "Atlas response status: OK - user $Username updated in project $GroupId"
Write-Host "Remember to update your MONGODB_URI with the new password and rotate old credentials."