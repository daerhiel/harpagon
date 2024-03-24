# Automates the package version updates in repository.
# The script tracks the main package version and all primary entry point library packages.
# Script uses npm to push the main and library package versions as well as to commit and
# tag the change sif required. The flags can be used to specify the semantic version type,
# the production release, the pre-release identifier, the dry run mode, the push mode and
# the skip checks mode. The script should be used manually before creating the release.
#
# Exaples:
#   .\promote.ps1 -Version Release -DryRun -SkipChecks
#   .\promote.ps1 -Version Major -Production -Id -Push

[CmdletBinding()]
param (
  [Parameter(Mandatory = $true)]
  [ValidateSet('Major', 'Minor', 'Patch', 'Release')]
  [string]$Version,

  [Parameter(Mandatory = $false)]
  [switch]$Production,

  [Parameter(Mandatory = $false)]
  [string]$Id = 'alpha',

  [Parameter(Mandatory = $false)]
  [switch]$DryRun,

  [Parameter(Mandatory = $false)]
  [switch]$Push,

  [Parameter(Mandatory = $false)]
  [switch]$SkipChecks
)

function Get-DryRunVersion {
  param ([string]$version)
  # This pattern should cover semver for '1.2.3', '1.2.3-4' and  '1.2.3-alpha.4'
  $patternDryRun = '(?<=\d+\.\d+\.\d+)(?:$|-?(?:\w*\.?)(?<release>\d+))'

  # We should replace existing pre-release name with dryrun or add the new one.
  return $version -replace $patternDryRun, {
    $release = $_.Captures['release'].Value
    return "-dryrun.$([string]::IsNullOrEmpty($release) ? 0 : $release)"
  }
}

function Push-NpmVersion {
  param ([string]$path)
  # This pattern should cover key value pair "version": "1.2.3", "1.2.3-4" and  "1.2.3-alpha.4"
  $patternDryRunVersion = '(?<="version"\s*:\s*")\d+\.\d+\.\d+(?:-(?:\w+\.)?\d+)?(?=")'

  $content = Get-Content -Raw -Path $path
  $package = $content | ConvertFrom-Json
  $next = Get-DryRunVersion -version $package.version
  $content -replace $patternDryRunVersion, $next | Set-Content -Path $path -NoNewline
  return "v$next"
}

$codeBase = '.\'
$searchBase = '.\'

# This pattern should cover project folders to be excluded from the update.
$patternNonProjectFolders = '\\(node_modules|.angular|.vscode|dist)\\'
# Track the index of packages to be updated.
$packages = @{}

$semver = $Version.ToLowerInvariant()
if (-not $Production) {
  $semver = "pre$semver"
  $switch = "--preid=$Id"
}
$currentBase = Get-Location

# The main script section should have error handling to recover current context.
Set-Location -Path $codeBase
try {
  $workingBase = Get-Location
  $optionDryRun = $DryRun ? '--dry-run' : $null
  $noteDryRun = $DryRun ? ' (dry run)' : ''

  # If dry run is off, then we should go for the build checks first.
  if (-not $DryRun -and -not $SkipChecks) {
    Write-Host "Running checks..." -ForegroundColor DarkGreen
    npm run checks
    if ($LastExitCode -gt 0) { Write-Host "Checks failed. Exiting..." -ForegroundColor Red; exit 1 }
  }

  # App version update goes first as we can make sure if everything right for npm.
  if (-not $DryRun) {
    Write-Host "Pushing the main package version..." -ForegroundColor DarkGreen
    $tag = npm version $semver $switch
    if ($LastExitCode -gt 0) { Write-Host "Version bump failed. Exiting..." -ForegroundColor Red; exit 1 }
  }
  else {
    if (Test-Path -Path '.\package.json') {
      Write-Host "Pushing the main package version..." -ForegroundColor DarkGreen
      $tag = Push-NpmVersion -path '.\package.json'
      Write-Host "Updating the main package-lock.json..." -ForegroundColor DarkGreen
      npm install
      if ($LastExitCode -gt 0) { Write-Host "Package lock file update failed. Exiting..." -ForegroundColor Red; exit 1 }
    }
    else { Write-Host "No package.json found in the root folder. Exiting..." -ForegroundColor Red; exit 1 }
  }
  Write-Host "Current release: $tag" -ForegroundColor Green

  # Commit the package versions for the main package and create tag.
  if ((git diff *package*.json) -or (git diff --cached *package*.json)) {
    Write-Host "Committing$noteDryRun the library package versions..." -ForegroundColor DarkGreen
    git commit *package*.json --message "package: bump version" $optionDryRun
    if ($LastExitCode -gt 0) { Write-Host "Commit failed. Exiting..." -ForegroundColor Red; exit 1 }
    if (-not $DryRun) {
      git tag $tag
      if ($LastExitCode -gt 0) { Write-Host "Package tag failed. Exiting..." -ForegroundColor Red; exit 1 }
    }
  }

  # We should go for the library packages update only if the search path is within the code base.
  Set-Location -Path $searchBase
  try {
    if ((Get-Location).Path -ne $workingBase.Path) {
      # Push the versions of every primary entry point library.
      Write-Host "Pushing$noteDryRun the library packages versions..." -ForegroundColor DarkGreen
      Get-ChildItem -Recurse -Path .\**\package.json | ForEach-Object {
        if ($_.Directory -inotmatch $patternNonProjectFolders) {
          $packageOld = Get-Content -Raw -Path $_.FullName | ConvertFrom-Json
          Write-Host "Package $($packageOld.name) $($packageOld.version)" -ForegroundColor DarkBlue
          if (-not $DryRun) {
            Set-Location -Path $_.Directory
            $packageTag = npm version $semver $switch
            if ($LastExitCode -gt 0) { Write-Host "Version bump failed. Exiting..." -ForegroundColor Red; exit 1 }
          }
          else {
            $packageTag = Push-NpmVersion -path $_.FullName
          }
          $packageNew = Get-Content -Raw -Path $_.FullName | ConvertFrom-Json
          $packages[$packageOld.name] = $packageNew.version
          Write-Host "$($packageOld.name) $($packageOld.version) -> $($packageNew.version) [$packageTag]" -ForegroundColor Gray
        }
      }

      # Resolve dependencies between libraries and update references.
      Write-Host "Updating$noteDryRun the library dependencies..." -ForegroundColor DarkGreen
      Get-ChildItem -Recurse -Path .\**\package.json | ForEach-Object {
        if ($_.Directory -inotmatch $patternNonProjectFolders) {
          $content = Get-Content -Raw -Path $_.FullName
          $package = $content | ConvertFrom-Json
          Write-Host "Resolving $($package.name)" -ForegroundColor DarkBlue
          $packageUpdates = 0
          $packages.PSBase.Keys | ForEach-Object {
            if ($package.peerDependencies.$_) {
              $pattern = "(?<=""$_""\s*:\s*""(?:|>=|\^|~))\d+\.\d+\.\d+(?:-(?:\w+\.)?\d+)?(?="")"
              $content = $content -replace $pattern, $packages[$_]
              $packageUpdates++
            }
          }
          if ($packageUpdates -gt 0) {
            $content | Set-Content -Path $_.FullName -NoNewline
            Write-Host "$($package.name) updated." -ForegroundColor Gray
          }
          else {
            Write-Host "$($package.name) has no dependencies." -ForegroundColor DarkGray
          }
        }
      }

      # Commit the package versions for libraries.
      if ((git diff *package*.json) -or (git diff --cached *package*.json)) {
        Write-Host "Committing$noteDryRun the library package versions..." -ForegroundColor DarkGreen
        git commit *package*.json --message "packages: bump versions" $optionDryRun
        if ($LastExitCode -gt 0) { Write-Host "Commit failed. Exiting..." -ForegroundColor Red; exit 1 }
      }
    }
    else {
      Write-Host "No library packages found. Skipping..." -ForegroundColor DarkGray
    }
  }
  catch {
    Set-Location -Path $workingBase
  }

  # Push the version changes and tags, the protection bypass may be required.
  if ($Push) {
    Write-Host "Pushing$noteDryRun the changes..." -ForegroundColor DarkGreen
    git push --tags origin $optionDryRun
    if ($LastExitCode -gt 0) { Write-Host "Push failed. Exiting..." -ForegroundColor Red; exit 1 }
  }
}
finally {
  Set-Location -Path $currentBase
}
