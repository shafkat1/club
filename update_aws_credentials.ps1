Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Update AWS Credentials" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Paste your NEW AWS credentials from AWS Console:" -ForegroundColor Yellow
Write-Host ""

$accessKeyId = Read-Host "Enter Access Key ID"
$secretAccessKey = Read-Host "Enter Secret Access Key (hidden)" -AsSecureString

# Convert to plain text
$secretPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($secretAccessKey)
)

# Update credentials file
$credentialsFile = "$env:USERPROFILE\.aws\credentials"
$content = @"
[default]
aws_access_key_id = $accessKeyId
aws_secret_access_key = $secretPlain
"@

Set-Content -Path $credentialsFile -Value $content

Write-Host ""
Write-Host "Credentials updated! Testing..." -ForegroundColor Green
Write-Host ""

$result = aws sts get-caller-identity 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS! AWS credentials are valid:" -ForegroundColor Green
    $result | ConvertFrom-Json | Format-Table -AutoSize
    Write-Host ""
    Write-Host "Ready to create deployment role!" -ForegroundColor Cyan
} else {
    Write-Host "ERROR: Credentials are still invalid" -ForegroundColor Red
    Write-Host $result
}
