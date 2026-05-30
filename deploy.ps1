# =====================================================================
#  One-click deploy for Sumit Phuyal's portfolio  ->  GitHub Pages
#  Usage:  right-click this file > "Run with PowerShell"
#          or in a terminal:   powershell -ExecutionPolicy Bypass -File deploy.ps1
# =====================================================================
$ErrorActionPreference = "Stop"

function Find-Gh {
  $candidates = @(
    "C:\Program Files\GitHub CLI\gh.exe",
    "C:\Program Files (x86)\GitHub CLI\gh.exe"
  )
  foreach ($c in $candidates) { if (Test-Path $c) { return $c } }
  $cmd = Get-Command gh -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  throw "GitHub CLI (gh) not found. Install it from https://cli.github.com/ and re-run."
}

Set-Location $PSScriptRoot
$gh = Find-Gh
Write-Host "Using GitHub CLI: $gh" -ForegroundColor DarkGray

# ---- 1. Make sure you're logged in (this is the one interactive step) ----
& $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "STEP 1/4  Logging you into GitHub..." -ForegroundColor Cyan
  Write-Host "  Choose:  GitHub.com  ->  HTTPS  ->  Login with a web browser" -ForegroundColor DarkGray
  & $gh auth login
}

# ---- 2. Detect your GitHub username ----
$me = (& $gh api user --jq .login).Trim()
if (-not $me) { throw "Could not determine your GitHub username." }
Write-Host ""
Write-Host "STEP 2/4  Logged in as: $me" -ForegroundColor Cyan

$repo = "portfolio"   # change this if you want a different repo / URL path

# ---- 3. Create the repo and push (or push if it already exists) ----
Write-Host "STEP 3/4  Creating repo '$me/$repo' and pushing files..." -ForegroundColor Cyan
& $gh repo view "$me/$repo" 1>$null 2>$null
if ($LASTEXITCODE -eq 0) {
  Write-Host "  Repo already exists - pushing latest commit." -ForegroundColor DarkGray
  git remote remove origin 2>$null | Out-Null
  git remote add origin "https://github.com/$me/$repo.git"
  git push -u origin main
} else {
  & $gh repo create "$me/$repo" --public --source=. --remote=origin --push `
      --description "Personal animated portfolio website (HTML/CSS/JS)"
}

# ---- 4. Turn on GitHub Pages (serve from main branch, root folder) ----
Write-Host "STEP 4/4  Enabling GitHub Pages..." -ForegroundColor Cyan
try {
  '{"source":{"branch":"main","path":"/"}}' |
    & $gh api "repos/$me/$repo/pages" --method POST --input - 1>$null 2>$null
} catch { }  # ignore "already enabled" (409)
try {
  '{"source":{"branch":"main","path":"/"}}' |
    & $gh api "repos/$me/$repo/pages" --method PUT --input - 1>$null 2>$null
} catch { }

$pagesUrl = "https://$me.github.io/$repo/"
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " DONE!  Your portfolio is deploying." -ForegroundColor Green
Write-Host " It will be LIVE in about 1 minute at:" -ForegroundColor Green
Write-Host "    $pagesUrl" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "TIP: To use your custom domain sumitphuyal.com.np later," -ForegroundColor DarkGray
Write-Host "     see DEPLOY.md (the 'Custom domain' section)." -ForegroundColor DarkGray

# Open the repo's Pages settings so you can watch the build / add a domain
Start-Process "https://github.com/$me/$repo/settings/pages"
