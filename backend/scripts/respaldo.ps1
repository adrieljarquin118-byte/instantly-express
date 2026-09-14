param(
  [string]$Usuario = $env:MYSQL_USER,
  [string]$Host = $env:MYSQL_HOST,
  [string]$BaseDatos = 'SisInstantlyExpress',
  [string]$Salida = './respaldos'
)

New-Item -ItemType Directory -Force -Path $Salida | Out-Null
$marca = Get-Date -Format 'yyyyMMdd-HHmmss'
$archivo = Join-Path $Salida "SisInstantlyExpress-$marca.sql"
mysqldump --ssl-mode=REQUIRED --host=$Host --user=$Usuario --databases $BaseDatos | Out-File -Encoding utf8 $archivo
Write-Output "Respaldo creado: $archivo"
