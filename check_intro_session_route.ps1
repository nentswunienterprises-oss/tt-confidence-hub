# PowerShell script to check if the /api/tutor/student/:studentId/intro-session-details route is live
# Usage: .\check_intro_session_route.ps1 -ApiBaseUrl <API_BASE_URL> -StudentId <STUDENT_ID> -JwtToken <JWT_TOKEN>

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiBaseUrl,
    [Parameter(Mandatory=$true)]
    [string]$StudentId,
    [Parameter(Mandatory=$true)]
    [string]$JwtToken
)

$Url = "$ApiBaseUrl/api/tutor/student/$StudentId/intro-session-details"
Write-Host "Checking: $Url"

$response = Invoke-RestMethod -Uri $Url -Headers @{ Authorization = "Bearer $JwtToken"; Accept = "application/json" } -Method Get -ErrorAction SilentlyContinue -SkipHttpErrorCheck

if ($response) {
    $response | ConvertTo-Json -Depth 5 | Write-Host
} else {
    Write-Host "No response or error occurred. Check your parameters and server logs."
}
