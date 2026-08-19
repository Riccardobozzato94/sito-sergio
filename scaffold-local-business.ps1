<#
.SYNOPSIS
  Scaffold di un nuovo sito per un locale (panificio/ristorante/pasticceria)
  a partire dal progetto Panificio Da Sergio.

.DESCRIPTION
  Copia il progetto base ESCLUSI node_modules, dist, .env, .git e asset
  specifici del cliente, poi parametrizza i file di configurazione business
  (src/lib/config.js) e il nome del progetto (package.json).

  Lo script NON tocca il codice sorgente (componenti, lib, pages): è identico
  per tutti i locali. Solo i DATI business cambiano.

.PARAMETER BusinessName
  Nome completo del locale. Es. "Panificio Da Sergio", "Pizzeria Da Luca"

.PARAMETER Slug
  Identificativo cartella / project name (senza spazi). Es. "panificio-sergio"

.PARAMETER Destination
  Cartella di destinazione. Default: "../$Slug" relativo a questo script.

.PARAMETER Address
  Indirizzo completo del locale.

.PARAMETER Phone
  Telefono con prefisso internazionale senza +. Es. "39041401200"

.PARAMETER WhatsApp
  Numero WhatsApp (uguale a Phone se è lo stesso). Es. "39041401200"

.PARAMETER Email
  Email di contatto.

.PARAMETER Since
  Anno di fondazione. Es. "1977"

.PARAMETER Slogan
  Tagline. Es. "Tradizione con Passione"

.EXAMPLE
  .\scaffold-local-business.ps1 -BusinessName "Pizzeria Da Luca" `
    -Slug "pizzeria-luca" -Address "Via Roma 10, 30100 Venezia (VE)" `
    -Phone "39041234567" -WhatsApp "39041234567" `
    -Email "info@pizzeriadaluca.it" -Since "1990" `
    -Slogan "Pizza nel forno a legna dal 1990"
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]  [string] $BusinessName,
  [Parameter(Mandatory=$true)]  [string] $Slug,
  [Parameter(Mandatory=$false)] [string] $Destination = "",
  [Parameter(Mandatory=$false)] [string] $Address = "",
  [Parameter(Mandatory=$false)] [string] $Phone = "",
  [Parameter(Mandatory=$false)] [string] $WhatsApp = "",
  [Parameter(Mandatory=$false)] [string] $Email = "",
  [Parameter(Mandatory=$false)] [string] $Since = "",
  [Parameter(Mandatory=$false)] [string] $Slogan = ""
)

$ErrorActionPreference = 'Stop'

# ── Percorsi ───────────────────────────────────────────────────
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Source    = $ScriptDir
$Dest      = if ($Destination) { $Destination } else { Join-Path $ScriptDir "..\$Slug" }

if (Test-Path -LiteralPath $Dest) {
  throw "La cartella destinazione esiste già: $Dest`nScegli uno Slug diverso o elimina la cartella."
}

Write-Host "`n🍞 Scaffolding '$BusinessName' → $Dest" -ForegroundColor Green

# ── 1. Copia escludendo node_modules, dist, .env, .git, _raw_assets ─
$excludeDirs = @('node_modules', 'dist', '.git', '.next', '.netlify', '_raw_assets_panificio')
$excludeFiles = @('.env', '.env.local', 'pnpm-lock.yaml', 'bun.lock', 'package-lock.json')

function Copy-Tree {
  param($From, $To)
  if (-not (Test-Path $To)) { New-Item -ItemType Directory -Path $To | Out-Null }
  Get-ChildItem -LiteralPath $From | ForEach-Object {
    if ($_.PSIsContainer) {
      if ($excludeDirs -contains $_.Name) { return }
      Copy-Tree -From $_.FullName -To (Join-Path $To $_.Name)
    } else {
      if ($excludeFiles -contains $_.Name) { return }
      Copy-Item -LiteralPath $_.FullName -Destination $To
    }
  }
}
Copy-Tree -From $Source -To $Dest

# ── 2. Parametrizza package.json (solo name + version) ────────
$pkgPath = Join-Path $Dest 'package.json'
$pkg = Get-Content -LiteralPath $pkgPath -Raw | ConvertFrom-Json
$pkg.name = $Slug
$pkg.version = '1.0.0'
$pkg | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $pkgPath

# ── 3. Parametrizza src/lib/config.js ─────────────────────────
$configPath = Join-Path $Dest 'src/lib/config.js'
$config = Get-Content -LiteralPath $configPath -Raw

$config = $config -replace '(?s)(export const BUSINESS = \{).*?(\n\};)', @"
`$1
  name: "$BusinessName",
  slogan: "$(if ($Slogan) { $Slogan } else { 'Tradizione con Passione' })",
  since: "$(if ($Since) { $Since } else { '—' })",
  address: "$(if ($Address) { $Address } else { 'INDIRIZO DA COMPILARE' })",
  phone: "$(if ($Phone) { $Phone } else { '' })",
  email: "$(if ($Email) { $Email } else { '' })",
  whatsappNumber: "$(if ($WhatsApp) { $WhatsApp } else { $Phone })",
  website: "",
`$2
"@

Set-Content -LiteralPath $configPath -Value $config

# ── 4. Template .env.example (senza segreti) ──────────────────
$envExample = @"
# $BusinessName — .env (solo ordine WhatsApp, NO Stripe)
# Copia in .env e inserisci la tua anon key Supabase.
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
# VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx  # solo se attivi pagamenti
"@
Set-Content -LiteralPath (Join-Path $Dest '.env.example') -Value $envExample

# ── 5. README specifico ───────────────────────────────────────
$readme = @"
# $BusinessName — Sito Web

Sito e-commerce con ordine via WhatsApp. Fork del template Panificio Da Sergio.

## Avvio
```bash
npm install
npm run dev
`````

## Configurazione business
Tutti i dati (nome, contatti, orari, social) sono in `src/lib/config.js`.
Le immagini vanno in `public/images/` (vedi `BUSINESS-TEMPLATE.md`).

## Deploy
Vedi `DEPLOY-CHECKLIST.md` (adattato al tuo dominio/Supabase).
"@
Set-Content -LiteralPath (Join-Path $Dest 'README.md') -Value $readme

# ── 6. Copia BUSINESS-TEMPLATE.md se esiste ───────────────────
$templateSrc = Join-Path $ScriptDir 'BUSINESS-TEMPLATE.md'
if (Test-Path -LiteralPath $templateSrc) {
  Copy-Item -LiteralPath $templateSrc -Destination (Join-Path $Dest 'BUSINESS-TEMPLATE.md')
}

Write-Host "`n✅ Progetto '$Slug' creato in: $Dest" -ForegroundColor Green
Write-Host "`nProssimi passi:" -ForegroundColor Yellow
Write-Host "  1. cd $Dest"
Write-Host "  2. npm install"
Write-Host "  3. cp .env.example .env  → inserisci Supabase URL + anon key"
Write-Host "  4. npm run dev  → verifica su http://localhost:5173"
Write-Host "  5. Sostituisci le foto in public/images/ (vedi BUSINESS-TEMPLATE.md)"
Write-Host "  6. Crea le tabelle Supabase (vedi DEPLOY-CHECKLIST.md)`n"
